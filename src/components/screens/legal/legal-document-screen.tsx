import ReactMarkdown from "react-markdown";

type LegalDocumentScreenProps = {
  title: string;
  content: string;
};

export default function LegalDocumentScreen({ title, content }: LegalDocumentScreenProps) {
  return (
    <section className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <article className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8">
        <h1 className="mb-6 text-xl font-bold text-gray-900 md:text-2xl">{title}</h1>
        <div className="prose prose-gray max-w-none text-sm leading-7 md:text-base">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h2 className="mb-4 mt-8 text-lg font-bold first:mt-0" {...props} />,
              h2: ({ ...props }) => <h3 className="mb-3 mt-7 text-base font-bold" {...props} />,
              h3: ({ ...props }) => <h4 className="mb-2 mt-6 text-sm font-semibold md:text-base" {...props} />,
              p: ({ ...props }) => <p className="mb-4 leading-7 last:mb-0" {...props} />,
              ul: ({ ...props }) => <ul className="mb-4 list-disc space-y-1 pl-5" {...props} />,
              ol: ({ ...props }) => <ol className="mb-4 list-decimal space-y-1 pl-5" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  );
}
