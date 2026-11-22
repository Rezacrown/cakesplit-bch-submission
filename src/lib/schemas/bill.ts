import { z } from "zod";
import { isValidCashAddress, MIN_COVENANT_DUST_SATS } from "@/lib/bch/address";

export const bchNetworkSchema = z.enum(["chipnet", "mainnet"]);

export const participantShareSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Nama peserta wajib diisi").max(40),
  shareSatoshis: z
    .number()
    .int("Harus bilangan bulat satoshi")
    .min(MIN_COVENANT_DUST_SATS, `Minimal ${MIN_COVENANT_DUST_SATS} sats per porsi`),
});

export const createSplitBillSchema = z
  .object({
    network: bchNetworkSchema,
    title: z.string().trim().min(2, "Judul tagihan minimal 2 karakter").max(80),
    merchantAddress: z.string().trim().min(1, "Alamat BCH merchant wajib diisi"),
    participants: z
      .array(participantShareSchema)
      .min(2, "Minimal 2 peserta untuk split bill")
      .max(12, "Maksimal 12 peserta"),
  })
  .superRefine((data, ctx) => {
    if (!isValidCashAddress(data.merchantAddress, data.network)) {
      const expectedPrefix = data.network === "mainnet" ? "bitcoincash:" : "bchtest:";
      ctx.addIssue({
        code: "custom",
        path: ["merchantAddress"],
        message: `Alamat BCH tidak valid untuk ${data.network} (harus berawalan ${expectedPrefix})`,
      });
    }
  });

export type CreateSplitBillInput = z.infer<typeof createSplitBillSchema>;
