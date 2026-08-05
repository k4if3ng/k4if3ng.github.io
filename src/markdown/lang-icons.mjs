import { createRequire } from 'node:module';

const loadJson = createRequire(import.meta.url);
const simpleIcons = loadJson('@iconify-json/simple-icons/icons.json');
const logos = loadJson('@iconify-json/logos/icons.json');
const codeBlockConfig = loadJson('../config/code-block.json');
const { aliases, labels, simpleIcons: simpleKeys, logoIcons: logoKeys } = codeBlockConfig;
const colorPriority = new Set(codeBlockConfig.colorPriority);

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const normalizeLang = (rawLanguage) => {
  const language = normalize(rawLanguage);
  return (aliases[language] ?? language) || 'text';
};

export const getLangLabel = (rawLanguage, language = normalizeLang(rawLanguage)) => (
  labels[normalize(rawLanguage)] ?? labels[language] ?? language
);

const resolveIcon = (set, key) => {
  if (set?.icons?.[key]) return set.icons[key];
  const parent = set?.aliases?.[key]?.parent;
  return parent ? set?.icons?.[parent] ?? null : null;
};

const findIcon = (set, keys) => {
  for (const key of keys) {
    const icon = resolveIcon(set, key);
    if (icon) return icon;
  }
  return null;
};

const viewBox = (set, icon) => `${icon?.left ?? 0} ${icon?.top ?? 0} ${icon?.width ?? set?.width ?? 24} ${icon?.height ?? set?.height ?? 24}`;

const monochromeBody = (body) => body
  .replace(/fill="[^"]*"/g, 'fill="currentColor"')
  .replace(/fill:[^;"]+/g, 'fill:currentColor');

const svg = (set, icon, colored) => {
  if (!icon?.body) return null;
  const body = colored ? icon.body : monochromeBody(icon.body);
  const className = colored ? 'code-lang-icon is-colored' : 'code-lang-icon';
  const fill = colored ? '' : ' fill="currentColor"';
  return `<svg class="${className}" viewBox="${viewBox(set, icon)}"${fill} aria-hidden="true" focusable="false">${body}</svg>`;
};

export const getLangIcon = (rawLanguage) => {
  const language = normalizeLang(rawLanguage);
  const primaryLogoKeys = logoKeys[language] ?? [language];
  const primarySimpleKeys = simpleKeys[language] ?? [language];
  const preferColor = colorPriority.has(language);

  if (preferColor) {
    const icon = findIcon(logos, primaryLogoKeys);
    if (icon) return svg(logos, icon, true);
  }

  const simpleIcon = findIcon(simpleIcons, primarySimpleKeys);
  if (simpleIcon) return svg(simpleIcons, simpleIcon, false);

  const logoIcon = findIcon(logos, primaryLogoKeys);
  return logoIcon ? svg(logos, logoIcon, true) : null;
};
