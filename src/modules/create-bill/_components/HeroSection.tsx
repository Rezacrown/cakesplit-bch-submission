import { ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { TRUST_GUARANTEES, type TrustGuarantee } from "../constants";

function GuaranteeIcon({ id }: { id: TrustGuarantee["id"] }) {
  if (id === "pot") return <Users className="size-4 text-[#161616]" aria-hidden="true" />;
  if (id === "settle") return <Zap className="size-4 text-[#161616]" aria-hidden="true" />;
  return <ShieldCheck className="size-4 text-[#161616]" aria-hidden="true" />;
}

export function HeroSection() {
  return (
    <section className="flex flex-col justify-between gap-7">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#161616] bg-[#F4F4F5] px-3.5 py-1 text-xs font-extrabold tracking-wide text-[#161616]">
          <Sparkles className="size-3.5 text-[#18181B]" aria-hidden="true" />
          <span>BITCOIN CASH TABLE SPLIT</span>
        </div>

        <h1 className="font-display text-4xl leading-[1.04] font-extrabold tracking-tight text-[#161616] sm:text-5xl lg:text-[3.35rem]">
          Split the table.
          <span className="mt-1 block">
            Pay the cashier{" "}
            <span className="inline-block rounded-full border-2 border-[#161616] bg-[#18181B] px-3 py-0.5 text-[#FAF9F6]">
              in one tap.
            </span>
          </span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-[#52525B] sm:text-lg">
          Everyone pays their slice into one shared pot. Once full, anyone at
          the table can settle directly to the cashier — no awkward IOUs or
          chasing friends after dinner.
        </p>
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[210px_1fr]">
        <div className="relative mx-auto flex w-52 items-center justify-center sm:mx-0 sm:w-full">
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-full border-2 border-dashed border-[#18181B]/20 bg-[#F4F4F5]"
          />
          <img
            src="/mascots/hero.png"
            alt="CakeSplit cartoon cake mascot holding a Bitcoin Cash split receipt"
            width={260}
            height={282}
            className="relative z-10 h-auto w-48 object-contain sm:w-52"
          />
        </div>

        <ul className="space-y-3" aria-label="CakeSplit safety guarantees">
          {TRUST_GUARANTEES.map((item) => (
            <li
              key={item.id}
              className="retro-card-sm flex items-start gap-3 rounded-xl px-3.5 py-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#161616] bg-[#0AC18E]/30">
                <GuaranteeIcon id={item.id} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-[#161616]">
                  {item.title}
                </p>
                <p className="text-xs leading-snug text-[#5B5347]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
