import { z } from "zod";
import { isValidCashAddress, MIN_COVENANT_DUST_SATS } from "@/lib/bch/address";

export const bchNetworkSchema = z.enum(["chipnet", "mainnet"]);

export const participantShareSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Enter a name for each person").max(40),
  shareSatoshis: z
    .number()
    .int("Amount must be a whole number of satoshis")
    .min(
      MIN_COVENANT_DUST_SATS,
      `Each slice must be at least ${MIN_COVENANT_DUST_SATS.toLocaleString()} sats (0.00001 BCH)`,
    ),
});

export const createSplitBillSchema = z
  .object({
    network: bchNetworkSchema,
    title: z
      .string()
      .trim()
      .min(2, "Add a short bill name (at least 2 characters)")
      .max(80),
    merchantAddress: z
      .string()
      .trim()
      .min(1, "Enter the cashier Bitcoin Cash address"),
    participants: z
      .array(participantShareSchema)
      .min(2, "Add at least 2 people to split a bill")
      .max(12, "Up to 12 people per table"),
  })
  .superRefine((data, ctx) => {
    if (!isValidCashAddress(data.merchantAddress, data.network)) {
      const expectedPrefix =
        data.network === "mainnet" ? "bitcoincash:" : "bchtest:";
      ctx.addIssue({
        code: "custom",
        path: ["merchantAddress"],
        message: `Enter a valid ${data.network === "mainnet" ? "Mainnet" : "Chipnet"} address starting with ${expectedPrefix}`,
      });
    }
  });

export type CreateSplitBillInput = z.infer<typeof createSplitBillSchema>;
