const alertNames = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);

function walk(node) {
  if (!node?.children) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') enhanceAlert(child);
    if (!['code', 'inlineCode'].includes(child.type)) enhanceSpoilers(child);
    walk(child);
  }
  enhanceMedia(node);
}

function isStandaloneImageParagraph(node) {
  return node?.type === 'paragraph' && node.children?.length === 1 && node.children[0]?.type === 'image';
}

function isCaptionParagraph(node) {
  return node?.type === 'paragraph' && node.children?.length === 1 && node.children[0]?.type === 'emphasis';
}

function createFigure(image, caption) {
  const children = [image];
  if (caption) {
    children.push({
      type: 'paragraph',
      data: { hName: 'figcaption' },
      children: caption.children,
    });
  }
  return {
    type: 'paragraph',
    data: { hName: 'figure' },
    children,
  };
}

function isFigure(node) {
  return node?.data?.hName === 'figure';
}

function createGallery(figures) {
  return {
    type: 'paragraph',
    data: { hName: 'div', hProperties: { className: ['gallery'] } },
    children: figures,
  };
}

function enhanceMedia(node) {
  if (!node?.children?.length) return;

  const enhanced = [];
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (!isStandaloneImageParagraph(child)) {
      enhanced.push(child);
      continue;
    }

    const next = node.children[index + 1];
    const caption = isCaptionParagraph(next) ? next.children[0] : null;
    enhanced.push(createFigure(child.children[0], caption));
    if (caption) index += 1;
  }

  node.children = enhanced.reduce((children, child) => {
    if (!isFigure(child)) {
      children.push(child);
      return children;
    }
    const previous = children[children.length - 1];
    if (previous?.data?.hName === 'div' && previous.data.hProperties?.className?.includes('gallery')) {
      previous.children.push(child);
    } else {
      children.push(createGallery([child]));
    }
    return children;
  }, []);

  node.children = node.children.map((child) => {
    if (child?.data?.hName === 'div' && child.data.hProperties?.className?.includes('gallery') && child.children.length === 1) {
      return child.children[0];
    }
    return child;
  });
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
