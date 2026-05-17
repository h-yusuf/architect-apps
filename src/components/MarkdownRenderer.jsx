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
    <div className="flex gap-12">
      <article className="flex-1 min-w-0 prose prose-invert prose-headings:text-[#e5e5e5] prose-p:text-[#aaa] prose-a:text-indigo-400 prose-code:text-indigo-300 max-w-none">
        <ReactMarkdown
          components={{
            h2({ children }) {
              return <h2 id={headingId(children)}>{children}</h2>;
            },
            h3({ children }) {
              return <h3 id={headingId(children)}>{children}</h3>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {toc.length > 0 && (
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#555] mb-3">
              Isi
            </p>
            <nav className="flex flex-col gap-2">
              {toc.map(({ level, text, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`text-sm text-[#888] hover:text-indigo-400 transition-colors leading-snug${level === 3 ? ' pl-3' : ''}`}
                >
                  {text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
