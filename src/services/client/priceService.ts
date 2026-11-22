export const FALLBACK_BCH_USD_PRICE = 200;

export type BchPriceSource = "coinbase" | "coingecko" | "fallback";

export interface BchUsdPriceResult {
  priceUsd: number;
  source: BchPriceSource;
  updatedAt: number;
}

const COINBASE_SPOT_URL = "https://api.coinbase.com/v2/prices/BCH-USD/spot";
const COINGECKO_SIMPLE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd";
const FETCH_TIMEOUT_MS = 5_000;

async function fetchJsonWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePositiveNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

/**
 * Fetches live BCH/USD spot rate from Coinbase with CoinGecko and static fallback.
 * Never throws so offline or rate-limited clients remain fully functional.
 */
export async function fetchBchUsdPrice(): Promise<BchUsdPriceResult> {
  try {
    const payload = (await fetchJsonWithTimeout(COINBASE_SPOT_URL)) as {
      data?: { amount?: string | number };
    };
    const priceUsd = parsePositiveNumber(payload?.data?.amount);
    if (priceUsd !== null) {
      return { priceUsd, source: "coinbase", updatedAt: Date.now() };
    }
  } catch {
    // Fall through to secondary provider.
  }

  try {
    const payload = (await fetchJsonWithTimeout(COINGECKO_SIMPLE_URL)) as {
      "bitcoin-cash"?: { usd?: string | number };
    };
    const priceUsd = parsePositiveNumber(payload?.["bitcoin-cash"]?.usd);
    if (priceUsd !== null) {
      return { priceUsd, source: "coingecko", updatedAt: Date.now() };
    }
  } catch {
    // Fall through cleanly to offline reference rate.
  }

  return {
    priceUsd: FALLBACK_BCH_USD_PRICE,
    source: "fallback",
    updatedAt: Date.now(),
  };
}
