import JsonLd from "./JsonLd";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Frequently asked questions</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-lg border border-black/10 p-4 dark:border-white/10"
          >
            <summary className="cursor-pointer font-medium">{item.question}</summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
    </section>
  );
}
