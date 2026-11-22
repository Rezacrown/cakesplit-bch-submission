import QRCode from "qrcode";
import { buildBip21Uri } from "@/lib/bch/address";

export interface QrRenderOptions {
  width?: number;
  margin?: number;
}

/**
 * Generates a high-contrast PNG Data URL QR code for a BIP21 BCH payment URI
 * (scannable inside Cashonize, Paytaca, and Selene wallets).
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
    width: params.options?.width ?? 320,
    margin: params.options?.margin ?? 3,
    errorCorrectionLevel: "M",
  });

  return { uri, dataUrl };
}

/**
 * Generates a spacious, low-density PNG Data URL QR code for shareable `/bill?d=...` URLs
 * (`errorCorrectionLevel: "L"` + wider quiet zone) so phone cameras scan immediately.
 */
export async function generateUrlQrDataUrl(
  url: string,
  options?: QrRenderOptions,
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width ?? 360,
    margin: options?.margin ?? 3,
    errorCorrectionLevel: "L",
  });
}
