export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6f3] text-[#17201a]">
      <header className="border-b border-[#d9ded8] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <p className="text-xl font-semibold">FieldNote</p>
          <span className="rounded-md bg-[#e7f3e9] px-3 py-1 text-sm font-medium text-[#245b31]">
            Sandbox
          </span>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:py-20">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-[#377348]">
            New field note
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Speak the job. Send the invoice. Get paid.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#58625b]">
            Turn a quick voice note into reviewed line items and a PayPal invoice
            draft.
          </p>

          <div className="mt-10 flex min-h-56 items-center justify-center border border-[#cbd2cb] bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#176b3a] text-2xl text-white">
                <span aria-hidden="true">●</span>
              </div>
              <p className="text-lg font-semibold">Ready for your first note</p>
              <p className="mt-2 text-sm text-[#68716a]">
                Voice capture is the first workflow we will connect.
              </p>
            </div>
          </div>
        </div>

        <aside className="border border-[#cbd2cb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Today</h2>
          <dl className="mt-6 space-y-6">
            <div className="flex items-end justify-between border-b border-[#e2e6e1] pb-4">
              <dt className="text-sm text-[#68716a]">Notes captured</dt>
              <dd className="text-2xl font-semibold">0</dd>
            </div>
            <div className="flex items-end justify-between border-b border-[#e2e6e1] pb-4">
              <dt className="text-sm text-[#68716a]">Draft invoices</dt>
              <dd className="text-2xl font-semibold">0</dd>
            </div>
            <div className="flex items-end justify-between">
              <dt className="text-sm text-[#68716a]">Ready to send</dt>
              <dd className="text-2xl font-semibold">0</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
