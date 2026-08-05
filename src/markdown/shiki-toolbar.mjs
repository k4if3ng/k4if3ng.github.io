/*
 * Static toolbar for Shiki code blocks.
 * Rendering this structure at build time prevents a visible client-side rewrite
 * after navigating to an article.
 */

import { getLangIcon, getLangLabel, normalizeLang } from './lang-icons.mjs';

const element = (node, tagName) => node?.type === 'element' && node.tagName === tagName;
const text = (value) => ({ type: 'text', value });

const classes = (node) => {
  const value = node?.properties?.className;
  return Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\s+/) : [];
};

const languageFrom = (pre, context) => {
  const fromContext = context?.options?.lang;
  if (typeof fromContext === 'string' && fromContext.trim()) return fromContext;

  const properties = pre?.properties ?? {};
  const fromData = properties['data-lang'] ?? properties.dataLang ?? properties['data-language'] ?? properties.dataLanguage;
  if (fromData) return String(fromData);

  const code = pre?.children?.find((child) => element(child, 'code'));
  const languageClass = classes(code).find((name) => name.startsWith('language-'));
  return languageClass?.slice('language-'.length) ?? 'text';
};

const icon = (className, children) => ({
  type: 'element',
  tagName: 'svg',
  properties: {
    className: [className],
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  },
  children,
});

const path = (d, properties = {}) => ({ type: 'element', tagName: 'path', properties: { d, ...properties }, children: [] });

const copyIcon = () => icon('icon-copy', [
  { type: 'element', tagName: 'rect', properties: { x: 8, y: 8, width: 12, height: 12, rx: 2 }, children: [] },
  path('M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3'),
]);

const checkIcon = () => icon('icon-check', [path('m5 12 4 4L19 6')]);

const toolbar = ({ label, languageIcon }) => ({
  type: 'element',
  tagName: 'div',
  properties: { className: ['code-toolbar'] },
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: { className: ['code-lang'] },
      children: [
        ...(languageIcon ? [{ type: 'raw', value: languageIcon }] : []),
        { type: 'element', tagName: 'span', properties: {}, children: [text(label)] },
      ],
    },
    {
      type: 'element',
      tagName: 'div',
      properties: { className: ['code-meta'] },
      children: [
        {
          type: 'element', tagName: 'button',
          properties: { className: ['code-copy'], type: 'button', disabled: true, 'data-code-copy': 'true', 'data-state': 'idle' },
          children: [copyIcon(), checkIcon()],
        },
      ],
    },
  ],
});

export default function shikiToolbar() {
  return {
    name: 'site-code-toolbar',
    pre(node) {
      const language = normalizeLang(languageFrom(node, this));
      node.properties = { ...(node.properties ?? {}), 'data-lang': language };
    },
    root(node) {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (!element(child, 'pre')) return child;
        const rawLanguage = languageFrom(child, this);
        const language = normalizeLang(rawLanguage);
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block'], 'data-lang': language },
          children: [toolbar({
            label: getLangLabel(rawLanguage, language),
            languageIcon: getLangIcon(rawLanguage),
          }), child],
        };
      });
    },
  };
}
