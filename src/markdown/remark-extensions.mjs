const alertNames = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);

function walk(node) {
  if (!node?.children) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') enhanceAlert(child);
    if (!['code', 'inlineCode'].includes(child.type)) enhanceSpoilers(child);
    walk(child);
  }
}

function enhanceAlert(node) {
  const paragraph = node.children?.[0];
  const text = paragraph?.type === 'paragraph' && paragraph.children?.[0]?.type === 'text'
    ? paragraph.children[0]
    : undefined;
  const match = text?.value.match(/^\[!([a-z]+)\](?:[ \t]+([^\n]+))?(?:\n|$)/i);
  const kind = match?.[1]?.toUpperCase();
  if (!kind || !alertNames.has(kind)) return;

  const title = match[2]?.trim() || kind[0] + kind.slice(1).toLowerCase();
  text.value = text.value.slice(match[0].length);
  if (!text.value) paragraph.children.shift();
  if (!paragraph.children.length) node.children.shift();
  node.data = {
    ...(node.data ?? {}),
    hProperties: { className: ['markdown-alert', `markdown-alert-${kind.toLowerCase()}`] },
  };
  node.children.unshift({
    type: 'paragraph',
    data: { hProperties: { className: ['markdown-alert-title'] } },
    children: [{ type: 'text', value: title }],
  });
}

function enhanceSpoilers(node) {
  if (!node?.children) return;
  node.children = node.children.flatMap((child) => {
    if (child.type !== 'text' || !child.value.includes('==')) return [child];
    const parts = child.value.split(/(==[^=\n]+==)/g).filter(Boolean);
    return parts.map((part) => part.startsWith('==') && part.endsWith('==')
      ? {
          type: 'strong',
          data: { hName: 'span', hProperties: { className: ['spoiler'], tabIndex: 0, role: 'button', ariaLabel: '隐藏内容，悬停或聚焦显示' } },
          children: [{ type: 'text', value: part.slice(2, -2) }],
        }
      : { type: 'text', value: part });
  });
}

export default function remarkExtensions() {
  return (tree) => walk(tree);
}
