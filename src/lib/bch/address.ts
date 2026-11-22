import {
  binToHex,
  cashAddressToLockingBytecode,
  decodeCashAddress,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";

export type BchNetwork = "mainnet" | "chipnet";

export const SATOSHIS_PER_BCH = 100_000_000n;
export const MIN_P2PKH_DUST_SATS = 546;
export const MIN_COVENANT_DUST_SATS = 1_000;

export function getNetworkPrefix(network: BchNetwork): "bitcoincash" | "bchtest" {
  return network === "mainnet" ? "bitcoincash" : "bchtest";
}

export function isValidCashAddress(address: string, network?: BchNetwork): boolean {
  const trimmed = address.trim();
  if (!trimmed) return false;
  const decoded = decodeCashAddress(trimmed);
  if (typeof decoded === "string") return false;
  if (network && decoded.prefix !== getNetworkPrefix(network)) {
    return false;
  }
  return true;
}

export function cashAddressToLockingHex(address: string): string {
  const result = cashAddressToLockingBytecode(address.trim());
  if (typeof result === "string") {
    throw new Error(`Invalid CashAddress: ${result}`);
  }
  return binToHex(result.bytecode);
}

export function lockingHexToCashAddress(
  lockingBytecodeHex: string,
  network: BchNetwork,
  tokenSupport = false,
): string {
  const result = lockingBytecodeToCashAddress({
    bytecode: hexToBin(lockingBytecodeHex),
    prefix: getNetworkPrefix(network),
    tokenSupport,
  });
  if (typeof result === "string") {
    throw new Error(`Unable to encode CashAddress: ${result}`);
  }
  return result.address;
}

export function satsToBch(satoshis: bigint | number): string {
  const sats = typeof satoshis === "bigint" ? satoshis : BigInt(Math.trunc(satoshis));
  const sign = sats < 0n ? "-" : "";
  const abs = sats < 0n ? -sats : sats;
  const whole = abs / SATOSHIS_PER_BCH;
  const frac = (abs % SATOSHIS_PER_BCH).toString().padStart(8, "0").replace(/0+$/, "");
  return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

export function bchToSats(bch: string | number): bigint {
  const normalized = String(bch).trim();
  if (!/^\d+(\.\d{1,8})?$/.test(normalized)) {
    throw new Error(`Invalid BCH amount: ${normalized}`);
  }
  const [whole, frac = ""] = normalized.split(".");
  return BigInt(whole) * SATOSHIS_PER_BCH + BigInt(frac.padEnd(8, "0"));
}

export function buildBip21Uri(params: {
  address: string;
  satoshis?: bigint | number;
  label?: string;
  message?: string;
}): string {
  const query = new URLSearchParams();
  if (params.satoshis !== undefined) {
    query.set("amount", satsToBch(params.satoshis));
  }
  if (params.label) {
    query.set("label", params.label);
  }
  if (params.message) {
    query.set("message", params.message);
  }
  const qs = query.toString();
  return qs ? `${params.address}?${qs}` : params.address;
}
