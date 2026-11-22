import {
  binToHex,
  decodePrivateKeyWif,
  encodePrivateKeyWif,
  generatePrivateKey,
  hexToBin,
  privateKeyToP2pkhCashAddress,
  secp256k1,
  validateSecp256k1PrivateKey,
} from "@bitauth/libauth";
import { getNetworkPrefix, type BchNetwork } from "@/lib/bch/address";

export interface OrganizerKeyPair {
  privateKeyHex: string;
  publicKeyHex: string;
  /** Standard P2PKH CashAddress derived from this organizer key (useful for refunds/testing). */
  address: string;
  network: BchNetwork;
}

const STORAGE_KEY_PREFIX = "cakesplit:organizer-key:";

export function organizerKeyFromPrivateHex(
  privateKeyHex: string,
  network: BchNetwork,
): OrganizerKeyPair {
  const privBytes = hexToBin(privateKeyHex.trim());
  if (!validateSecp256k1PrivateKey(privBytes)) {
    throw new Error("Invalid secp256k1 private key");
  }
  const pubBytes = secp256k1.derivePublicKeyCompressed(privBytes);
  if (typeof pubBytes === "string") {
    throw new Error(`Failed to derive public key: ${pubBytes}`);
  }
  const addrRes = privateKeyToP2pkhCashAddress({
    privateKey: privBytes,
    prefix: getNetworkPrefix(network),
  });
  if (typeof addrRes === "string") {
    throw new Error(`Failed to derive CashAddress: ${addrRes}`);
  }
  return {
    privateKeyHex: binToHex(privBytes),
    publicKeyHex: binToHex(pubBytes),
    address: addrRes.address,
    network,
  };
}

export function generateOrganizerKey(network: BchNetwork): OrganizerKeyPair {
  const privBytes = generatePrivateKey();
  return organizerKeyFromPrivateHex(binToHex(privBytes), network);
}

export function exportOrganizerKeyWif(
  privateKeyHex: string,
  network: BchNetwork,
): string {
  const privBytes = hexToBin(privateKeyHex.trim());
  if (!validateSecp256k1PrivateKey(privBytes)) {
    throw new Error("Invalid secp256k1 private key");
  }
  return encodePrivateKeyWif(privBytes, network === "mainnet" ? "mainnet" : "testnet");
}

export function importOrganizerKeyWif(
  wif: string,
  network: BchNetwork,
): OrganizerKeyPair {
  const decoded = decodePrivateKeyWif(wif.trim());
  if (typeof decoded === "string") {
    throw new Error(`Invalid WIF private key: ${decoded}`);
  }
  return organizerKeyFromPrivateHex(binToHex(decoded.privateKey), network);
}

/**
 * Browser-safe helper to persist or retrieve the organizer key in `localStorage`.
 * Falls back cleanly to ephemeral generation in SSR/Node environments.
 */
export function loadOrCreateOrganizerKey(network: BchNetwork): OrganizerKeyPair {
  const storageKey = `${STORAGE_KEY_PREFIX}${network}`;
  if (typeof window !== "undefined" && window.localStorage) {
    const existingHex = window.localStorage.getItem(storageKey);
    if (existingHex) {
      try {
        return organizerKeyFromPrivateHex(existingHex, network);
      } catch {
        // Corrupted key; regenerate cleanly below.
      }
    }
    const fresh = generateOrganizerKey(network);
    window.localStorage.setItem(storageKey, fresh.privateKeyHex);
    return fresh;
  }
  return generateOrganizerKey(network);
}

export function saveOrganizerKeyToStorage(
  privateKeyHex: string,
  network: BchNetwork,
): OrganizerKeyPair {
  const pair = organizerKeyFromPrivateHex(privateKeyHex, network);
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${network}`, pair.privateKeyHex);
  }
  return pair;
}
