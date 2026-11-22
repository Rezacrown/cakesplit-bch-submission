import { FEATURE_PANELS } from "../constants";

export function FeatureStoryboard() {
  return (
    <section
      id="why-cakesplit"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="font-mono text-xs font-bold tracking-widest text-[#52525B] uppercase">
            WHY CAKESPLIT
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
            Built for real tables, not spreadsheets
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[#52525B]">
          Simple group bill splitting designed around how friends actually pay
          at dinner.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURE_PANELS.map((panel) => (
          <article
            key={panel.id}
            className="ink-card group flex flex-col overflow-hidden rounded-3xl transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="paper-stipple relative flex h-52 items-center justify-center border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] p-6">
              <span className="absolute top-4 left-4 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#111111]">
                PANEL {panel.panelNumber}
              </span>

              <img
                src={panel.imageSrc}
                alt={panel.imageAlt}
                width={150}
                height={150}
                className="h-36 w-auto object-contain transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 p-6">
              <div className="space-y-2.5">
                <p className="font-mono text-[11px] font-bold tracking-widest text-[#71717A] uppercase">
                  {panel.caption}
                </p>
                <h3 className="font-display text-xl leading-snug font-extrabold text-[#111111]">
                  {panel.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#52525B]">
                  {panel.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
