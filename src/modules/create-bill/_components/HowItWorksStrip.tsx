import { HOW_IT_WORKS_STEPS } from "../constants";

export function HowItWorksStrip() {
  return (
    <section id="how-it-works" className="scroll-mt-24 space-y-6 pt-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <p className="font-mono text-xs font-bold tracking-widest text-[#52525B] uppercase">
            How CakeSplit Works
          </p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
            Three quick steps from check to paid
          </h2>
        </div>
        <p className="max-w-sm text-sm text-[#52525B]">
          No accounts, no logins, and no middleman holding your money.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <article
            key={step.stepNumber}
            className="ink-card flex flex-col overflow-hidden rounded-3xl"
          >
            <div className="relative flex h-44 items-center justify-center border-b border-[#E4E4E7] bg-[#F4F4F5] p-5">
              <span className="absolute top-3 left-3 rounded-full border border-[#18181B] bg-[#FFFFFF] px-2.5 py-0.5 font-mono text-xs font-bold text-[#111111]">
                STEP {step.stepNumber}
              </span>
              <img
                src={step.imageSrc}
                alt={step.imageAlt}
                width={140}
                height={140}
                className="size-32 object-contain"
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-5">
              <h3 className="font-display text-lg font-extrabold text-[#161616]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5B5347]">
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
