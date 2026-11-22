"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/app-store";
import { createSplitBillSchema } from "@/lib/schemas/bill";
import { satsToBch } from "@/lib/bch/address";
import { XO_DEBUG_TOOL_URL, XO_ENGINE_PACKAGE_VERSION } from "@/lib/xo";

export default function HomePage() {
  const {
    network,
    title,
    merchantAddress,
    participants,
    setNetwork,
    setTitle,
    setMerchantAddress,
  } = useAppStore();

  const totalSatoshis = useMemo(
    () => participants.reduce((sum, item) => sum + item.shareSatoshis, 0),
    [participants],
  );

  const stackStatusQuery = useQuery({
    queryKey: ["scaffold-status", network],
    queryFn: async () => ({
      network,
      xoEngineVersion: XO_ENGINE_PACKAGE_VERSION,
      debugToolUrl: XO_DEBUG_TOOL_URL,
      ready: true,
    }),
  });

  const handleValidateDraft = () => {
    const parsed = createSplitBillSchema.safeParse({
      network,
      title,
      merchantAddress,
      participants,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Input tidak valid";
      toast.error(firstError);
      return;
    }

    toast.success(
      `Draft valid untuk ${parsed.data.network}: ${satsToBch(totalSatoshis)} BCH`,
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* BCH BLAZE 2026 Top Banner Placeholder (update with slides + EMBER2026 z-address before submission) */}
      <header className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">BCH BLAZE 2026</Badge>
            <span>Build with XO + Mainnet Track</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Rezacrown/bch-blaze-hackathon"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub Repo
            </a>
            <a
              href={XO_DEBUG_TOOL_URL}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              XO Debug Tool
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              On-Chain Split Bill — Minimal Scaffold
            </h1>
            <p className="text-sm text-muted-foreground">
              Next.js 16 + shadcn/ui + TanStack Query + Zod + Zustand + XO Stack + Libauth
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={network === "chipnet" ? "default" : "outline"}
              onClick={() => setNetwork("chipnet")}
            >
              Chipnet
            </Button>
            <Button
              size="sm"
              variant={network === "mainnet" ? "default" : "outline"}
              onClick={() => setNetwork("mainnet")}
            >
              Mainnet
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Quick Draft Validator</span>
              <Badge variant="outline">
                XO {stackStatusQuery.data?.xoEngineVersion ?? "..."}
              </Badge>
            </CardTitle>
            <CardDescription>
              Scaffold siap dipakai — berikutnya kita pasang XO Split-Bill Covenant Template &
              Invitation flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bill-title">Judul Tagihan</Label>
                <Input
                  id="bill-title"
                  placeholder="Contoh: Makan Malam Bareng"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant-address">
                  Alamat BCH Merchant ({network === "mainnet" ? "bitcoincash:" : "bchtest:"})
                </Label>
                <Input
                  id="merchant-address"
                  placeholder={
                    network === "mainnet"
                      ? "bitcoincash:q..."
                      : "bchtest:q..."
                  }
                  value={merchantAddress}
                  onChange={(e) => setMerchantAddress(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Default draft: {participants.length} peserta · Total{" "}
                <strong className="text-foreground">
                  {totalSatoshis.toLocaleString()} sats ({satsToBch(totalSatoshis)} BCH)
                </strong>
              </span>
              <Button onClick={handleValidateDraft}>Cek Validasi Zod + Libauth</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
