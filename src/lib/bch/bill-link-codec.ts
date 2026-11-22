import {
  binToHex,
  CashAddressType,
  decodeCashAddress,
  encodeCashAddress,
  hexToBin,
} from "@bitauth/libauth";
import type { ShareableBillPayload } from "@/lib/bch/bill-link";

const COMPACT_VERSION_BYTE = 0x02;

const ADDRESS_TYPES: readonly CashAddressType[] = [
  CashAddressType.p2pkh,
  CashAddressType.p2sh,
  CashAddressType.p2pkhWithTokens,
  CashAddressType.p2shWithTokens,
];

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function writeVarUint(out: number[], value: number): void {
  let remaining = Math.trunc(value);
  if (!Number.isSafeInteger(remaining) || remaining < 0) {
    throw new Error(`Invalid unsigned varint value: ${value}`);
  }
  while (remaining >= 0x80) {
    out.push((remaining & 0x7f) | 0x80);
    remaining = Math.floor(remaining / 128);
  }
  out.push(remaining);
}

function readVarUint(bytes: Uint8Array, offsetRef: { pos: number }): number {
  let result = 0;
  let multiplier = 1;
  while (offsetRef.pos < bytes.length) {
    const byte = bytes[offsetRef.pos++];
    result += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) {
      return result;
    }
    multiplier *= 128;
    if (!Number.isSafeInteger(result)) {
      throw new Error("Varint overflow while decoding CakeSplit token");
    }
  }
  throw new Error("Unexpected EOF while reading varint");
}

function writeBytesWithLen(out: number[], data: Uint8Array): void {
  writeVarUint(out, data.length);
  for (const b of data) out.push(b);
}

function readBytesWithLen(bytes: Uint8Array, offsetRef: { pos: number }): Uint8Array {
  const len = readVarUint(bytes, offsetRef);
  if (offsetRef.pos + len > bytes.length) {
    throw new Error("Unexpected EOF while reading byte slice");
  }
  const slice = bytes.subarray(offsetRef.pos, offsetRef.pos + len);
  offsetRef.pos += len;
  return slice;
}

/**
 * Packs a validated `ShareableBillPayload` into a compact v2 binary token (~135-180 chars)
 * so `Show Share QR` generates a clean, low-density QR code that any phone camera scans instantly.
 */
export function encodeCompactBillToken(payload: ShareableBillPayload): string {
  const decodedAddr = decodeCashAddress(payload.merchantAddress.trim());
  if (typeof decodedAddr === "string") {
    throw new Error(`Invalid merchantAddress: ${decodedAddr}`);
  }
  const addrTypeIndex = ADDRESS_TYPES.findIndex((t) => t === decodedAddr.type);
  if (addrTypeIndex === -1) {
    throw new Error(`Unsupported CashAddress type: ${decodedAddr.type}`);
  }

  const hasCustomIds = payload.participants.some(
    (p, idx) => p.id !== `p-${idx + 1}`,
  );
  const networkBit = payload.network === "chipnet" ? 1 : 0;
  const flags =
    networkBit | (addrTypeIndex << 1) | (hasCustomIds ? 1 << 3 : 0);

  const encoder = new TextEncoder();
  const nonceBytes = hexToBin(payload.billNonceHex);
  const pubKeyBytes = hexToBin(payload.organizerPublicKeyHex);
  const titleBytes = encoder.encode(payload.title);

  const out: number[] = [COMPACT_VERSION_BYTE, flags];
  writeBytesWithLen(out, nonceBytes);
  for (const b of pubKeyBytes) out.push(b);
  writeBytesWithLen(out, decodedAddr.payload);
  writeVarUint(out, payload.merchantPayoutSatoshis);
  writeVarUint(out, payload.settlementFeeSatoshis);
  writeVarUint(out, payload.createdAt);
  writeBytesWithLen(out, titleBytes);

  writeVarUint(out, payload.participants.length);
  for (const p of payload.participants) {
    writeBytesWithLen(out, encoder.encode(p.label));
    writeVarUint(out, p.shareSatoshis);
    if (hasCustomIds) {
      writeBytesWithLen(out, encoder.encode(p.id));
    }
  }

  return bytesToBase64Url(Uint8Array.from(out));
}

/**
 * Decodes either a compact v2 binary token or a legacy v1 base64url JSON token.
 */
export function decodeRawBillToken(encoded: string): unknown {
  const bytes = base64UrlToBytes(encoded.trim());
  if (bytes.length === 0) {
    throw new Error("Empty CakeSplit bill token");
  }

  // Legacy v1 JSON starts with '{' (0x7b)
  if (bytes[0] === 0x7b) {
    const jsonText = new TextDecoder().decode(bytes);
    return JSON.parse(jsonText) as unknown;
  }

  if (bytes[0] !== COMPACT_VERSION_BYTE) {
    throw new Error(`Unsupported CakeSplit token version byte: ${bytes[0]}`);
  }

  const decoder = new TextDecoder();
  const ref = { pos: 1 };
  const flags = bytes[ref.pos++];
  const network = (flags & 1) === 1 ? "chipnet" : "mainnet";
  const addrTypeIndex = (flags >> 1) & 0x03;
  const hasCustomIds = ((flags >> 3) & 1) === 1;
  const addrType = ADDRESS_TYPES[addrTypeIndex];

  const nonceBytes = readBytesWithLen(bytes, ref);
  if (ref.pos + 33 > bytes.length) {
    throw new Error("Truncated organizerPublicKey in CakeSplit token");
  }
  const pubKeyBytes = bytes.subarray(ref.pos, ref.pos + 33);
  ref.pos += 33;

  const merchantPayload = readBytesWithLen(bytes, ref);
  const prefix = network === "mainnet" ? "bitcoincash" : "bchtest";
  const encodedAddr = encodeCashAddress({
    prefix,
    type: addrType,
    payload: merchantPayload,
  });
  if (typeof encodedAddr === "string") {
    throw new Error(`Could not reconstruct merchant CashAddress: ${encodedAddr}`);
  }

  const merchantPayoutSatoshis = readVarUint(bytes, ref);
  const settlementFeeSatoshis = readVarUint(bytes, ref);
  const createdAt = readVarUint(bytes, ref);
  const title = decoder.decode(readBytesWithLen(bytes, ref));

  const participantCount = readVarUint(bytes, ref);
  const participants = [];
  for (let idx = 0; idx < participantCount; idx++) {
    const label = decoder.decode(readBytesWithLen(bytes, ref));
    const shareSatoshis = readVarUint(bytes, ref);
    const id = hasCustomIds
      ? decoder.decode(readBytesWithLen(bytes, ref))
      : `p-${idx + 1}`;
    participants.push({ id, label, shareSatoshis });
  }

  return {
    v: 1,
    network,
    title,
    billNonceHex: binToHex(nonceBytes),
    merchantAddress: encodedAddr.address,
    organizerPublicKeyHex: binToHex(pubKeyBytes),
    merchantPayoutSatoshis,
    settlementFeeSatoshis,
    participants,
    createdAt,
  };
}
