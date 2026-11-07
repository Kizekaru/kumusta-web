export default function DashboardLoading() {
  return (
    <main
      aria-label="Loading admin dashboard"
      aria-busy="true"
      className="min-h-screen bg-white"
    >
      <div className="h-16 border-b border-purple-100 bg-white" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-10">
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((card) => (
            <div
              key={card}
              className="h-44 animate-pulse rounded-3xl bg-purple-100"
            />
          ))}
        </div>
        <section className="flex flex-col gap-4">
          <div className="h-7 w-56 animate-pulse rounded-lg bg-purple-100" />
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="h-44 animate-pulse rounded-2xl bg-purple-50" />
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl border border-purple-100 bg-white"
                />
              ))}
            </div>
            <div className="min-h-96 animate-pulse rounded-3xl bg-purple-50" />
          </div>
        </section>
      </div>
    </main>
  );
}
