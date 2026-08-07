const alertNames = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);

function walk(node) {
  if (!node?.children) return;
  enhanceMedia(node);
  for (const child of node.children) {
    if (child.type === 'blockquote') enhanceAlert(child);
    if (!['code', 'inlineCode'].includes(child.type)) enhanceSpoilers(child);
    walk(child);
  }
}

function parseImageAttributes(node) {
  if (node?.type !== 'paragraph' || node.data?.hName || node.children?.[0]?.type !== 'image') return null;

  const image = node.children[0];
  const suffix = node.children.slice(1);
  if (!suffix.length) return { image, attributes: {} };
  if (suffix.some(child => child.type !== 'text')) return null;

  const raw = suffix.map(child => child.value).join('').trim();
  const match = raw.match(/^\{([^{}]*)\}$/);
  if (!match) return null;

  const attributes = {};
  for (const token of match[1].trim().split(/\s+/).filter(Boolean)) {
    const pair = token.match(/^([a-z]+)=(.+)$/);
    if (!pair) return null;

    const [, key, value] = pair;
    if (key === 'width' && /^(?:0|\d+(?:\.\d+)?)(?:%|px|rem|em|vw|vh)$/.test(value)) {
      attributes.width = value;
    } else if (key === 'layout' && value === 'grid') {
      attributes.layout = value;
    } else {
      return null;
    }
  }

  return { image, attributes };
}

function createFigure(image, captionChildren, attributes = {}) {
  const children = [image];
  if (captionChildren?.length) {
    children.push({
      type: 'paragraph',
      data: { hName: 'figcaption' },
      children: captionChildren,
    });
  }

  const className = [
    ...(attributes.layout === 'grid' ? ['media-grid-item'] : []),
    ...(attributes.width ? ['media-sized'] : []),
  ];
  const style = attributes.width ? `--media-width: ${attributes.width};` : undefined;
  const hProperties = {
    ...(className.length ? { className } : {}),
    ...(style ? { style } : {}),
  };

  return {
    type: 'paragraph',
    data: {
      hName: 'figure',
      ...(Object.keys(hProperties).length ? { hProperties } : {}),
    },
    children,
  };
}

function isFigure(node) {
  return node?.data?.hName === 'figure';
}

function isGridFigure(node) {
  return node?.data?.hProperties?.className?.includes('media-grid-item');
}

function isGallery(node) {
  return node?.data?.hName === 'div' && node.data.hProperties?.className?.includes('media-gallery');
}

function createGallery(figures) {
  return {
    type: 'paragraph',
    data: { hName: 'div', hProperties: { className: ['media-gallery'] } },
    children: figures,
  };
}

function enhanceMedia(node) {
  if (!node?.children?.length || node.data?.hName) return;

  const enhanced = [];
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    const imageInfo = parseImageAttributes(child);
    if (!imageInfo) {
      enhanced.push(child);
      continue;
    }

    const captionChildren = imageInfo.image.title
      ? [{ type: 'text', value: imageInfo.image.title }]
      : undefined;
    enhanced.push(createFigure(imageInfo.image, captionChildren, imageInfo.attributes));
  }

  node.children = enhanced.reduce((children, child) => {
    if (!isFigure(child) || !isGridFigure(child)) {
      children.push(child);
      return children;
    }
    const previous = children[children.length - 1];
    if (isGallery(previous)) {
      previous.children.push(child);
    } else {
      children.push(createGallery([child]));
    }
    return children;
  }, []);

  node.children = node.children.map((child) => {
    if (isGallery(child) && child.children.length === 1) {
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
