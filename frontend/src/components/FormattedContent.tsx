import React from 'react';
import { CheckCircle2, ChevronRight, Hash, HelpCircle, Layers, Sparkles } from 'lucide-react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

// Function to clean raw LaTeX math and format electrical & mathematical symbols into readable Unicode
export function sanitizeMathAndLatex(raw: any): string {
  if (raw === null || raw === undefined) return '';
  const text = typeof raw === 'string' ? raw : String(raw);

  return (
    text
      // Remove LaTeX text wraps: \text{ A} or \text{V} -> A or V
      .replace(/\\text\s*\{\s*([^}]+)\s*\}/g, ' $1 ')
      .replace(/\\mathrm\s*\{\s*([^}]+)\s*\}/g, ' $1 ')
      // Common electrical and scientific units & symbols
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\ohm/gi, 'Ω')
      .replace(/\\mu/g, 'μ')
      .replace(/\\micro/g, 'μ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\approx/g, '≈')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\ne/g, '≠')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\infty/g, '∞')
      // Fractions \frac{a}{b} -> (a / b)
      .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1 / $2)')
      // Square roots \sqrt{x} -> √(x)
      .replace(/\\sqrt\s*\{([^}]+)\}/g, '√($1)')
      // Subscripts with numbers: _{1} -> ₁, _1 -> ₁
      .replace(/_\{(\d+)\}/g, (_, d) =>
        d
          .split('')
          .map((c: string) => '₀₁₂₃₄₅₆₇₈₉'[parseInt(c, 10)] || c)
          .join('')
      )
      .replace(/_(\d)(?!\d)/g, (_, d) => '₀₁₂₃₄₅₆₇₈₉'[parseInt(d, 10)] || d)
      // Subscripts with text: _{BD} -> _BD, _{R3} -> _R3
      .replace(/_\{([^}]+)\}/g, '_$1')
      // Superscripts with numbers: ^{2} or ^2 -> ²
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^\{(\d+)\}/g, (_, d) =>
        d
          .split('')
          .map((c: string) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(c, 10)] || c)
          .join('')
      )
      // Clean escaped spaces: '\ ' or '\,' or '\;' -> ' '
      .replace(/\\[ ,;]/g, ' ')
      // Remove surrounding math dollar wrappers: $x = 5$ -> x = 5
      .replace(/\$+/g, '')
      // Clean redundant spaces
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  );
}

// Inline parser for bold, italics, code, and links
function renderInlineText(text: string): React.ReactNode {
  const cleaned = sanitizeMathAndLatex(text);
  // Split by markdown bold **...** and code `...`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleaned.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-navy-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-brand-violet font-mono text-[11px] border border-slate-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < cleaned.length) {
    parts.push(cleaned.substring(lastIndex));
  }

  return parts.length > 0 ? parts : cleaned;
}

export default function FormattedContent({ content, className = '' }: FormattedContentProps) {
  if (content === null || content === undefined) return null;
  const contentStr =
    typeof content === 'string'
      ? content
      : typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : String(content);

  if (!contentStr.trim()) return null;

  const lines = contentStr.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-2.5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((c) => /^-+$/.test(c.trim())));

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs">
            {header && (
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-navy-900">
                <tr>
                  {header.map((col, cIdx) => (
                    <th key={cIdx} className="p-2.5">
                      {renderInlineText(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 bg-white">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/60 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-slate-700">
                      {renderInlineText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Markdown Table Check
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      const cols = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cols);
      continue;
    } else {
      flushTable();
    }

    // Headers: ## Heading
    if (trimmed.startsWith('## ')) {
      flushList();
      const title = trimmed.replace(/^##\s+/, '');
      elements.push(
        <div key={`h2-${i}`} className="pt-4 pb-1 border-b border-slate-200/80 mb-3 first:pt-0">
          <h2 className="text-base md:text-lg font-black text-navy-900 flex items-center space-x-2 tracking-tight">
            <span className="w-2 h-4 rounded-full bg-brand-violet inline-block" />
            <span>{renderInlineText(title)}</span>
          </h2>
        </div>
      );
      continue;
    }

    // Subheadings: ### Heading
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace(/^###\s+/, '');
      elements.push(
        <div key={`h3-${i}`} className="pt-2 pb-0.5 mb-1.5">
          <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block" />
            <span>{renderInlineText(title)}</span>
          </h3>
        </div>
      );
      continue;
    }

    // Subheadings: #### Heading
    if (trimmed.startsWith('#### ')) {
      flushList();
      const title = trimmed.replace(/^####\s+/, '');
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-2 mb-1">
          {renderInlineText(title)}
        </h4>
      );
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${i}`}
          className="p-3 my-2 rounded-xl bg-slate-50 border-l-4 border-brand-violet text-slate-700 text-xs italic leading-relaxed shadow-sm"
        >
          {renderInlineText(quoteText)}
        </div>
      );
      continue;
    }

    // Question rows: e.g. "* Q1: ..." or "Q1: ..."
    const qMatch = trimmed.match(/^(\*|-)?\s*(Q\d+|Question\s*\d+)[\s:]+(.+)$/i);
    if (qMatch) {
      flushList();
      const qBadge = qMatch[2].toUpperCase();
      const qBody = qMatch[3];
      elements.push(
        <div
          key={`q-${i}`}
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition flex items-start space-x-3 my-1.5 shadow-sm group"
        >
          <span className="px-2 py-0.5 rounded-md bg-navy-900 text-white font-mono font-bold text-[10px] flex-shrink-0 mt-0.5 group-hover:bg-brand-violet transition">
            {qBadge}
          </span>
          <div className="text-xs text-slate-800 leading-relaxed flex-1 font-medium">
            {renderInlineText(qBody)}
          </div>
        </div>
      );
      continue;
    }

    // Bullet List Items: * item or - item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      const itemText = trimmed.replace(/^(\*|-)\s+/, '');
      listItems.push(
        <li key={`li-${i}`} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-violet mt-1.5 flex-shrink-0" />
          <div className="flex-1">{renderInlineText(itemText)}</div>
        </li>
      );
      continue;
    }

    // Numbered List Items: 1. item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${i}`} className="flex items-start space-x-2.5 text-xs text-slate-700 my-1 leading-relaxed">
          <span className="w-5 h-5 rounded-md bg-slate-100 text-navy-900 border border-slate-200 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderInlineText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs md:text-sm text-slate-700 leading-relaxed my-1.5">
        {renderInlineText(trimmed)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className={`space-y-1.5 text-slate-800 ${className}`}>{elements}</div>;
}

