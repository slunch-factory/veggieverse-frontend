interface Props {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: Props) {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <div className="mx-auto max-w-[760px] px-5 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="t-h1 mb-2" style={{ color: "var(--ink)" }}>
            {title}
          </h1>
          {lastUpdated && (
            <p className="t-caption" style={{ color: "var(--ink-light)" }}>
              최종 업데이트: {lastUpdated}
            </p>
          )}
        </header>

        <article className="legal-body" style={{ color: "var(--ink)" }}>
          {children}
        </article>
      </div>

      <style>{`
        .legal-body section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--neutral-stone);
        }
        .legal-body section:last-of-type {
          border-bottom: none;
        }
        .legal-body h2 {
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 0.75rem;
        }
        .legal-body p,
        .legal-body li {
          font-size: 14px;
          line-height: 1.7;
          color: var(--ink);
        }
        .legal-body p + p {
          margin-top: 0.5rem;
        }
        .legal-body ul,
        .legal-body ol {
          margin-top: 0.5rem;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .legal-body ul {
          list-style-type: disc;
        }
        .legal-body ol {
          list-style-type: decimal;
        }
        .legal-body a {
          color: var(--primary);
          text-decoration: underline;
        }
        .legal-body strong {
          font-weight: 600;
        }
        .legal-body .legal-todo {
          margin-top: 0.75rem;
          padding: 10px 12px;
          font-size: 12px;
          color: var(--ink-light);
          background: rgba(220, 38, 38, 0.06);
          border: 1px dashed var(--alert-red);
          border-radius: var(--r-btn);
        }
      `}</style>
    </main>
  );
}
