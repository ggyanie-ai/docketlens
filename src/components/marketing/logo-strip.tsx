export function LogoStrip() {
  return (
    <div className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="eyebrow text-center mb-7">
          Powering research at firms and newsrooms in private beta
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 opacity-70">
          {[
            "GLOSSER &amp; CHEN LLP",
            "NORTHGATE RESEARCH",
            "THE PROOF BUREAU",
            "MERIDIAN CAPITAL",
            "STILLWATER LEGAL",
            "OCTAVA NEWS",
          ].map((name) => (
            <span
              key={name}
              className="font-serif text-base tracking-[0.18em] text-[color:var(--color-fg-muted)]"
              dangerouslySetInnerHTML={{ __html: name }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
