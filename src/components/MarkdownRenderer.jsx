import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function TocLink({ level, text, id }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`#${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="leading-snug block"
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: level === 3 ? '0.67rem' : '0.72rem',
        fontWeight: level === 3 ? 400 : 500,
        paddingLeft: level === 3 ? '0.6rem' : '0',
        textDecoration: 'none',
        color: hovered ? 'var(--accent)' : 'var(--text-2)',
        transition: 'color 0.15s ease',
      }}
    >
      {text}
    </a>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;
  const toc = extractTOC(content);

  return (
    <div className="flex gap-16">
      <article
        className="flex-1 min-w-0 prose prose-invert max-w-none"
        style={{
          '--tw-prose-body': 'var(--prose-body)',
          '--tw-prose-headings': 'var(--prose-headings)',
          '--tw-prose-lead': 'var(--text-2)',
          '--tw-prose-links': 'var(--prose-links)',
          '--tw-prose-bold': 'var(--prose-bold)',
          '--tw-prose-counters': 'var(--prose-counters)',
          '--tw-prose-bullets': 'var(--prose-bullets)',
          '--tw-prose-hr': 'var(--prose-hr)',
          '--tw-prose-quotes': 'var(--prose-headings)',
          '--tw-prose-quote-borders': 'var(--prose-quote-border)',
          '--tw-prose-captions': 'var(--text-2)',
          '--tw-prose-code': 'var(--prose-code)',
          '--tw-prose-pre-code': 'var(--prose-headings)',
          '--tw-prose-pre-bg': 'var(--prose-pre-bg)',
          '--tw-prose-th-borders': 'var(--border)',
          '--tw-prose-td-borders': 'var(--prose-td-borders)',
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.9rem',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2({ children }) {
              return (
                <h2 id={headingId(children)} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '-0.005em' }}>
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3 id={headingId(children)} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
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
              className="uppercase font-semibold tracking-[0.22em] mb-4"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.55rem', color: 'var(--text-3)' }}
            >
              Isi
            </p>
            <div
              className="flex flex-col gap-3"
              style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}
            >
              {toc.map(({ level, text, id }) => (
                <TocLink key={id} level={level} text={text} id={id} />
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
