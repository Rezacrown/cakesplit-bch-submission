"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FALLBACK_BCH_USD_PRICE,
  fetchBchUsdPrice,
  type BchPriceSource,
} from "@/services/client/priceService";

export interface UseBchPriceResult {
  priceUsd: number;
  isLive: boolean;
  source: BchPriceSource;
  isLoading: boolean;
}

export function useBchPrice(): UseBchPriceResult {
  const query = useQuery({
    queryKey: ["bch-usd-price"],
    queryFn: fetchBchUsdPrice,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const source: BchPriceSource = query.data?.source ?? "fallback";
  const priceUsd = query.data?.priceUsd ?? FALLBACK_BCH_USD_PRICE;

  return {
    priceUsd,
    isLive: source !== "fallback",
    source,
    isLoading: query.isLoading,
  };
}
