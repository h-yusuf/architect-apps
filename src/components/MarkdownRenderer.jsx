import { useEffect, useState } from 'react';
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

const NAV_OFFSET = 96; // batas aktif scrollspy. Jarak berhenti scroll = scroll-mt-28 di heading (Lenis ikut membacanya)

function goTo(e, id) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.1 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
}

function TocLink({ level, text, id, active }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`#${id}`}
      onClick={e => goTo(e, id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-current={active ? 'location' : undefined}
      className="leading-snug block relative"
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: level === 3 ? '0.67rem' : '0.72rem',
        fontWeight: active ? 600 : level === 3 ? 400 : 500,
        paddingLeft: level === 3 ? '0.6rem' : '0',
        textDecoration: 'none',
        color: active || hovered ? 'var(--accent)' : 'var(--text-2)',
        transition: 'color 0.2s ease',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', left: 'calc(-1rem - 1px)', top: 0, bottom: 0, width: 2,
          background: 'var(--accent)', borderRadius: 2,
          opacity: active ? 1 : 0, transform: `scaleY(${active ? 1 : 0.2})`,
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      />
      {text}
    </a>
  );
}

export default function MarkdownRenderer({ content }) {
  const toc = content ? extractTOC(content) : [];
  const [activeId, setActiveId] = useState(toc[0]?.id);

  // scrollspy: heading terakhir yang sudah melewati garis bawah navbar = aktif
  useEffect(() => {
    if (!toc.length) return;
    const update = () => {
      // query ulang tiap panggilan: heading di-remount React tiap render, node lama lepas dari DOM
      const els = toc.map(t => document.getElementById(t.id)).filter(Boolean);
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= NAV_OFFSET + 24) cur = el.id;
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = els[els.length - 1]?.id;
      setActiveId(cur);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [content]);

  if (!content) return null;

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
                <h2 id={headingId(children)} className="scroll-mt-28" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '-0.005em' }}>
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3 id={headingId(children)} className="scroll-mt-28" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
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
          <div className="sticky top-28">
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
              {toc.map(({ level, text, id }, i) => (
                <TocLink key={`${id}-${i}`} level={level} text={text} id={id} active={id === activeId} />
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
