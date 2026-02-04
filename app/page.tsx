"use strict";

type CaptionRow = {
  content: string | null;
  like_count: number | null;
  created_datetime_utc: string | null;
};

const CAPTIONS_LIMIT = 10;

type CaptionsResult = {
  data: CaptionRow[];
  error: string | null;
};

async function fetchCaptions(): Promise<CaptionsResult> {
  const baseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return { data: [], error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY." };
  }

  const params = new URLSearchParams({
    select: "content,like_count,created_datetime_utc",
    order: "created_datetime_utc.desc",
    limit: String(CAPTIONS_LIMIT),
  });

  const response = await fetch(`${baseUrl}/rest/v1/captions?${params.toString()}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      data: [],
      error: `Supabase error ${response.status}: ${errorText || response.statusText}`,
    };
  }

  return { data: await response.json(), error: null };
}

export default async function Home() {
  const { data: captions, error } = await fetchCaptions();

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-16 text-amber-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Hello Terre! Im watching all the funny captions youre making even harder than Deanna 🙂
          </h1>
        </header>

        <section className="rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Latest captions</h2>
            <span className="text-sm text-amber-700">Showing {CAPTIONS_LIMIT}</span>
          </div>

          {error ? (
            <p className="mt-6 text-amber-700">{error}</p>
          ) : captions.length === 0 ? (
            <p className="mt-6 text-amber-700">
              No captions found yet (or missing Supabase env vars).
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {captions.map((caption, index) => (
                <article
                  key={`${caption.created_datetime_utc ?? "row"}-${index}`}
                  className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4"
                >
                  <p className="text-lg font-medium">
                    {caption.content ?? "Untitled caption"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-amber-700">
                    <span>Likes: {caption.like_count ?? 0}</span>
                    <span>
                      {caption.created_datetime_utc
                        ? new Date(caption.created_datetime_utc).toUTCString()
                        : "Unknown time"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
