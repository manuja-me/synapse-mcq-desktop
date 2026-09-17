import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // Regex to detect inline math ($...$) or display math ($$...$$)
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = text.split(mathRegex);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
          } catch {
            return escapeHtml(part);
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
          } catch {
            return escapeHtml(part);
          }
        } else {
          return escapeHtml(part);
        }
      })
      .join('');
  }, [text]);

  return (
    <span
      className={`inline-block leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
