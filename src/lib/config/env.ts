export interface MainnetElectrumConfig {
  host: string;
  port: number;
  scheme: "wss";
}

const DEFAULT_APP_URL = "https://cakesplit-bch.vercel.app";
const DEFAULT_APP_NAME = "CakeSplit";
const DEFAULT_GITHUB_REPO_URL =
  "https://github.com/Rezacrown/bch-blaze-hackathon";
const DEFAULT_EMBER_ADDRESS =
  "bitcoincash:zr4jg99w7eeupyd9hch370t3ffkd8kmmfs9y4g5aqe";
const DEFAULT_XO_DEBUG_TOOL_URL = "https://blaze.xo.cash/";
const DEFAULT_EXPLORER_MAINNET_URL = "https://explorer.bch.ninja";
const DEFAULT_FALLBACK_BCH_USD_PRICE = 200;

const DEFAULT_MAINNET_SERVERS: MainnetElectrumConfig[] = [
  { host: "bch.imaginary.cash", port: 50004, scheme: "wss" },
  { host: "electrum.imaginary.cash", port: 50004, scheme: "wss" },
  { host: "cashnode.bch.ninja", port: 50004, scheme: "wss" },
  { host: "fulcrum.greyh.at", port: 50004, scheme: "wss" },
];

function cleanEnvString(raw: string | undefined): string {
  return raw?.trim() ?? "";
}

function normalizeUrl(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  return trimmed.replace(/\/+$/, "");
}

function parsePositiveNumber(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseElectrumServersEnv(
  raw: string | undefined,
): MainnetElectrumConfig[] {
  const trimmed = cleanEnvString(raw);
  if (!trimmed) return DEFAULT_MAINNET_SERVERS;

  const parsed: MainnetElectrumConfig[] = [];
  for (const entry of trimmed.split(",")) {
    const cleaned = entry.trim();
    if (!cleaned) continue;
    const [hostPart, portPart] = cleaned.split(":");
    const host = hostPart?.trim();
    const port = portPart ? Number(portPart) : 50004;
    if (host && Number.isInteger(port) && port > 0 && port <= 65535) {
      parsed.push({ host, port, scheme: "wss" });
    }
  }
  return parsed.length > 0 ? parsed : DEFAULT_MAINNET_SERVERS;
}

export function truncateCashAddress(address: string): string {
  const trimmed = address.trim();
  if (trimmed.length <= 24) return trimmed;
  return `${trimmed.slice(0, 18)}...${trimmed.slice(-5)}`;
}

const configuredAppUrl = cleanEnvString(process.env.NEXT_PUBLIC_APP_URL);
const configuredSlidesUrl = cleanEnvString(process.env.NEXT_PUBLIC_SLIDES_URL);

export const appConfig = {
  appName: cleanEnvString(process.env.NEXT_PUBLIC_APP_NAME) || DEFAULT_APP_NAME,
  /** Explicit `NEXT_PUBLIC_APP_URL` if set, or default deployment URL for SSR metadata. */
  appUrl: normalizeUrl(configuredAppUrl, DEFAULT_APP_URL),
  /** True only when the operator explicitly pinned `NEXT_PUBLIC_APP_URL`. */
  hasExplicitAppUrl: configuredAppUrl.length > 0,
  githubRepoUrl: normalizeUrl(
    cleanEnvString(process.env.NEXT_PUBLIC_GITHUB_REPO_URL),
    DEFAULT_GITHUB_REPO_URL,
  ),
  slidesUrl: configuredSlidesUrl,
  emberAddress:
    cleanEnvString(process.env.NEXT_PUBLIC_EMBER_ADDRESS) ||
    DEFAULT_EMBER_ADDRESS,
  xoDebugToolUrl:
    cleanEnvString(process.env.NEXT_PUBLIC_XO_DEBUG_TOOL_URL) ||
    DEFAULT_XO_DEBUG_TOOL_URL,
  explorerMainnetUrl: normalizeUrl(
    cleanEnvString(process.env.NEXT_PUBLIC_EXPLORER_MAINNET_URL),
    DEFAULT_EXPLORER_MAINNET_URL,
  ),
  fallbackBchUsdPrice: parsePositiveNumber(
    process.env.NEXT_PUBLIC_FALLBACK_BCH_USD_PRICE,
    DEFAULT_FALLBACK_BCH_USD_PRICE,
  ),
  electrumMainnetServers: parseElectrumServersEnv(
    process.env.NEXT_PUBLIC_ELECTRUM_MAINNET_SERVERS,
  ),
} as const;

/**
 * Resolves the active origin for shareable `/bill?d=...` links.
 * In the browser, always respects the current domain (`window.location.origin`)
 * so custom domains work automatically without rebuilding or changing code.
 */
export function getShareableAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return appConfig.appUrl;
}
