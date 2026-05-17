import ReactMarkdown from 'react-markdown';

function extractTOC(content) {
  const headings = [];
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim()
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]+/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ level, text, id });
    }
  }
  return headings;
}

function flattenChildren(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(flattenChildren).join('');
  if (children?.props?.children) return flattenChildren(children.props.children);
  return '';
}

function headingId(children) {
  const text = flattenChildren(children);
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;
  const toc = extractTOC(content);

  return (
    <div className="flex gap-16">
      <article
        className="flex-1 min-w-0 prose prose-invert max-w-none"
        style={{
          '--tw-prose-body': '#b0a498',
          '--tw-prose-headings': '#ede4d4',
          '--tw-prose-lead': '#7a6d5e',
          '--tw-prose-links': '#c4955a',
          '--tw-prose-bold': '#ede4d4',
          '--tw-prose-counters': '#7a6d5e',
          '--tw-prose-bullets': '#3d3630',
          '--tw-prose-hr': '#2c2620',
          '--tw-prose-quotes': '#ede4d4',
          '--tw-prose-quote-borders': '#c4955a',
          '--tw-prose-captions': '#7a6d5e',
          '--tw-prose-code': '#e2d4c0',
          '--tw-prose-pre-code': '#ede4d4',
          '--tw-prose-pre-bg': '#131110',
          '--tw-prose-th-borders': '#2c2620',
          '--tw-prose-td-borders': '#1c1915',
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.9rem',
        }}
      >
        <ReactMarkdown
          components={{
            h2({ children }) {
              return (
                <h2
                  id={headingId(children)}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '-0.005em' }}
                >
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3
                  id={headingId(children)}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
                >
                  {children}
                </h3>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {toc.length > 0 && (
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-8">
            <p
              className="text-[#3d3630] uppercase font-semibold tracking-[0.22em] mb-4"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.55rem' }}
            >
              Isi
            </p>
            <div className="border-l border-[#2c2620] pl-4 flex flex-col gap-3">
              {toc.map(({ level, text, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`text-[#7a6d5e] hover:text-[#c4955a] transition-colors leading-snug block${level === 3 ? ' pl-2.5' : ''}`}
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: level === 3 ? '0.67rem' : '0.72rem',
                    fontWeight: level === 3 ? 400 : 500,
                    textDecoration: 'none',
                  }}
                >
                  {text}
                </a>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
