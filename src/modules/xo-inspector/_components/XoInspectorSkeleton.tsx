export function XoInspectorSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <div className="size-28 animate-pulse rounded-full bg-[#F4F4F5]" />
        <div className="h-8 w-64 animate-pulse rounded-xl bg-[#F4F4F5]" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-[#F4F4F5]" />
      </div>
      <div className="ink-card h-64 animate-pulse rounded-3xl p-6" />
      <div className="ink-card h-96 animate-pulse rounded-3xl p-6" />
    </section>
  );
}
