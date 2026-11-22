import QRCode from "qrcode";
import { buildBip21Uri } from "@/lib/bch/address";

export interface QrRenderOptions {
  width?: number;
  margin?: number;
}

/**
 * Generates a PNG Data URL QR code for a BIP21 BCH payment URI (scannable by Cashonize, Paytaca, Selene).
 */
export async function generatePaymentQrDataUrl(params: {
  address: string;
  satoshis?: bigint | number;
  label?: string;
  message?: string;
  options?: QrRenderOptions;
}): Promise<{ uri: string; dataUrl: string }> {
  const uri = buildBip21Uri({
    address: params.address,
    satoshis: params.satoshis,
    label: params.label,
    message: params.message,
  });

  const dataUrl = await QRCode.toDataURL(uri, {
    width: params.options?.width ?? 280,
    margin: params.options?.margin ?? 2,
    errorCorrectionLevel: "M",
  });

  return { uri, dataUrl };
}

/**
 * Generates a PNG Data URL QR code for any shareable URL (e.g., `/bill?d=...`).
 */
export async function generateUrlQrDataUrl(
  url: string,
  options?: QrRenderOptions,
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width ?? 260,
    margin: options?.margin ?? 2,
    errorCorrectionLevel: "M",
  });
}
