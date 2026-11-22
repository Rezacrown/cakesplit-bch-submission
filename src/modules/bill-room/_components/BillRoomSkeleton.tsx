export function BillRoomSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="ink-card animate-pulse rounded-3xl p-6 sm:p-8">
        <div className="h-5 w-36 rounded-full bg-[#F4F4F5]" />
        <div className="mt-4 h-9 w-64 rounded-xl bg-[#F4F4F5]" />
        <div className="mt-6 h-4 w-full rounded-full bg-[#F4F4F5]" />
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="h-10 w-36 rounded-full bg-[#F4F4F5]" />
          <div className="h-10 w-36 rounded-full bg-[#F4F4F5]" />
          <div className="h-10 w-44 rounded-full bg-[#F4F4F5]" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="ink-card h-72 animate-pulse rounded-3xl p-6" />
        <div className="ink-card h-72 animate-pulse rounded-3xl p-6" />
      </div>
    </section>
  );
}
