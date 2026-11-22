import {
  ElectrumClient,
  type ElectrumClientEvents,
} from "@electrum-cash/network";
import { hexToBin } from "@bitauth/libauth";
import { scriptToScriptHash } from "@xo-cash/utils";
import { cashAddressToLockingHex, type BchNetwork } from "@/lib/bch/address";
import type { CompiledCakeSplitContract, UtxoRef } from "@/lib/bch/cakesplit-contract";
import { computePotProgress, type PotProgress } from "@/lib/bch/bill-link";
import { appConfig } from "@/lib/config/env";

export interface ElectrumServerEndpoint {
  host: string;
  port: number;
  scheme: "wss";
}

export const DEFAULT_ELECTRUM_SERVERS: Record<BchNetwork, ElectrumServerEndpoint[]> = {
  mainnet: appConfig.electrumMainnetServers,
  chipnet: [
    { host: "chipnet.bch.ninja", port: 50004, scheme: "wss" },
    { host: "chipnet.imaginary.cash", port: 50004, scheme: "wss" },
  ],
};

interface ElectrumListUnspentEntry {
  tx_hash: string;
  tx_pos: number;
  value: number;
  height: number;
  token_data?: unknown;
}

export interface OnChainUtxo extends UtxoRef {
  /** Block height (`0` or `-1` means 0-conf unconfirmed in mempool). */
  height: number;
  isUnconfirmed: boolean;
}

export interface ContractPotState {
  utxos: OnChainUtxo[];
  totalSatoshis: bigint;
  confirmedSatoshis: bigint;
  unconfirmedSatoshis: bigint;
  progress: PotProgress;
  fetchedAt: number;
}

export function getExplorerTxUrl(txid: string, network: BchNetwork): string {
  return network === "mainnet"
    ? `${appConfig.explorerMainnetUrl}/tx/${txid}`
    : `https://chipnet.chaingraph.cash/tx/${txid}`;
}

export function getExplorerAddressUrl(address: string, network: BchNetwork): string {
  return network === "mainnet"
    ? `${appConfig.explorerMainnetUrl}/address/${address}`
    : `https://chipnet.chaingraph.cash/address/${address}`;
}

async function withElectrumClient<T>(
  network: BchNetwork,
  fn: (client: ElectrumClient<ElectrumClientEvents>) => Promise<T>,
  customServers?: ElectrumServerEndpoint[],
): Promise<T> {
  const servers = customServers ?? DEFAULT_ELECTRUM_SERVERS[network];
  let lastError: unknown;

  for (const server of servers) {
    const client = new ElectrumClient<ElectrumClientEvents>(
      "CakeSplit",
      "1.5",
      server.host,
      { port: server.port, encrypted: true, timeoutInMilliSeconds: 10_000 },
    );
    try {
      await client.connect();
      return await fn(client);
    } catch (error) {
      lastError = error;
    } finally {
      try {
        await client.disconnect();
      } catch {
        // Ignore disconnect errors on failed connections.
      }
    }
  }

  throw new Error(
    `Failed to reach any ${network} Electrum/Fulcrum server: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

/**
 * Fetches live UTXOs (including 0-conf mempool UTXOs!) for any CashAddress.
 */
export async function fetchAddressUtxos(
  address: string,
  network: BchNetwork,
  customServers?: ElectrumServerEndpoint[],
): Promise<OnChainUtxo[]> {
  const lockingHex = cashAddressToLockingHex(address);
  const scriptHash = scriptToScriptHash(hexToBin(lockingHex));
  return fetchScriptHashUtxos(scriptHash, network, customServers);
}

/**
 * Fetches live UTXOs for an Electrum scripthash (reversed SHA-256 of locking bytecode).
 */
export async function fetchScriptHashUtxos(
  scriptHash: string,
  network: BchNetwork,
  customServers?: ElectrumServerEndpoint[],
): Promise<OnChainUtxo[]> {
  return withElectrumClient(
    network,
    async (client) => {
      const response = await client.request(
        "blockchain.scripthash.listunspent",
        scriptHash,
      );
      if (response instanceof Error) {
        throw new Error(`Electrum listunspent failed: ${response.message}`);
      }
      if (!Array.isArray(response)) {
        throw new Error(
          `Unexpected Electrum listunspent response: ${JSON.stringify(response)}`,
        );
      }
      const entries = response as unknown as ElectrumListUnspentEntry[];
      return entries
        .filter((e) => !e.token_data)
        .map((e) => ({
          txid: e.tx_hash,
          vout: e.tx_pos,
          satoshis: BigInt(e.value),
          height: e.height,
          isUnconfirmed: e.height <= 0,
        }));
    },
    customServers,
  );
}

/**
 * Fetches live Bill Pot UTXOs + progress metrics for a compiled CakeSplit contract.
 * Ready to drop straight into a TanStack Query `queryFn` with 3-5s polling!
 */
export async function fetchContractPotState(
  contract: CompiledCakeSplitContract,
  customServers?: ElectrumServerEndpoint[],
): Promise<ContractPotState> {
  const utxos = await fetchScriptHashUtxos(
    contract.scriptHash,
    contract.network,
    customServers,
  );
  let confirmedSatoshis = 0n;
  let unconfirmedSatoshis = 0n;
  for (const u of utxos) {
    if (u.isUnconfirmed) {
      unconfirmedSatoshis += u.satoshis;
    } else {
      confirmedSatoshis += u.satoshis;
    }
  }
  const totalSatoshis = confirmedSatoshis + unconfirmedSatoshis;
  const progress = computePotProgress(totalSatoshis, contract.potGoalSatoshis);

  return {
    utxos,
    totalSatoshis,
    confirmedSatoshis,
    unconfirmedSatoshis,
    progress,
    fetchedAt: Date.now(),
  };
}

class BroadcastRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BroadcastRejectedError";
  }
}

/**
 * Broadcasts a raw signed/permissionless BCH transaction hex to Mainnet or Chipnet via Fulcrum.
 * Returns the broadcast `txid`.
 */
export async function broadcastRawTransaction(
  rawTxHex: string,
  network: BchNetwork,
  customServers?: ElectrumServerEndpoint[],
): Promise<string> {
  const servers = customServers ?? DEFAULT_ELECTRUM_SERVERS[network];
  let lastBroadcastRejection: string | null = null;
  let lastConnectionError: unknown;

  for (const server of servers) {
    const client = new ElectrumClient<ElectrumClientEvents>(
      "CakeSplit",
      "1.5",
      server.host,
      { port: server.port, encrypted: true, timeoutInMilliSeconds: 10_000 },
    );
    try {
      await client.connect();
      const response = await client.request(
        "blockchain.transaction.broadcast",
        rawTxHex.trim(),
      );
      if (response instanceof Error) {
        throw new BroadcastRejectedError(response.message);
      }
      if (typeof response !== "string" || response.length !== 64) {
        throw new BroadcastRejectedError(
          `Unexpected broadcast response: ${JSON.stringify(response)}`,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof BroadcastRejectedError) {
        lastBroadcastRejection = error.message;
      } else {
        lastConnectionError = error;
      }
    } finally {
      try {
        await client.disconnect();
      } catch {
        // Ignore disconnect errors on failed connections.
      }
    }
  }

  if (lastBroadcastRejection) {
    const lower = lastBroadcastRejection.toLowerCase();
    if (
      lower.includes("missing inputs") ||
      lower.includes("bad-txns-inputs-missingorspent")
    ) {
      throw new Error(
        "A recent 0-conf deposit is still syncing across Bitcoin Cash nodes (or was already spent). Please wait 5-10 seconds, tap Refresh, and try again.",
      );
    }
    throw new Error(`Transaction rejected by Bitcoin Cash network: ${lastBroadcastRejection}`);
  }

  throw new Error(
    `Failed to reach any ${network} Electrum/Fulcrum server: ${
      lastConnectionError instanceof Error
        ? lastConnectionError.message
        : String(lastConnectionError)
    }`,
  );
}
