import { v4 as uuid } from 'uuid';
import type { DesignElement, ElementType } from '../types';

interface ImportResult {
  elements: Record<string, DesignElement>;
  rootIds: string[];
}

// CORS proxy services for fetching websites
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

async function fetchWithProxy(url: string): Promise<string> {
  // Try direct fetch first (works for same-origin or CORS-enabled sites)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) return await response.text();
  } catch {}

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url));
      if (response.ok) return await response.text();
    } catch {}
  }

  throw new Error('Unable to fetch the website. The site may block cross-origin requests. Try a different URL or use a site with CORS enabled.');
}

function resolveUrl(base: string, relative: string): string {
  if (!relative) return '';
  if (relative.startsWith('http://') || relative.startsWith('https://') || relative.startsWith('data:')) return relative;
  if (relative.startsWith('//')) return new URL(base).protocol + relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function sanitizeHtml(html: string): string {
  // Remove script tags
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove event handlers
  html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
  // Remove javascript: URLs
  html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  html = html.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  // Remove iframe, embed, object
  html = html.replace(/<(iframe|embed|object)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<(iframe|embed|object)[^>]*\/?>/gi, '');
  return html;
}

function getComputedStyles(el: Element, baseStyle?: CSSStyleDeclaration): Partial<DesignElement> {
  const result: Partial<DesignElement> = {};

  // We'll parse from inline styles and common attributes
  const style = (el as HTMLElement).style;

  return result;
}

function parseInlineStyles(el: HTMLElement): Partial<DesignElement> {
  const style = el.style;
  const result: Partial<DesignElement> = {};

  // Background
  if (style.backgroundColor) result.background = style.backgroundColor;
  else if (style.background) result.background = style.background;

  // Border
  if (style.borderWidth || style.borderStyle || style.borderColor) {
    result.border = {
      width: parseInt(style.borderWidth) || 0,
      style: (style.borderStyle || 'solid') as any,
      color: style.borderColor || '#000000',
    };
  }

  // Border radius
  if (style.borderRadius) {
    result.borderRadius = parseInt(style.borderRadius) || 0;
  }

  // Padding
  if (style.padding) {
    const parts = style.padding.split(' ').map((p) => parseInt(p) || 0);
    result.padding = {
      top: parts[0] || 0,
      right: parts[1] || parts[0] || 0,
      bottom: parts[2] || parts[0] || 0,
      left: parts[3] || parts[1] || parts[0] || 0,
    };
  }

  // Opacity
  if (style.opacity) {
    result.opacity = parseFloat(style.opacity) || 1;
  }

  return result;
}

function parseTypography(el: HTMLElement): DesignElement['typography'] | null {
  const style = el.style;
  const tag = el.tagName.toLowerCase();

  const isTextElement = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'li', 'label', 'button', 'td', 'th', 'strong', 'em', 'b', 'i'].includes(tag);
  if (!isTextElement) return null;

  const defaultSizes: Record<string, number> = {
    h1: 36, h2: 30, h3: 24, h4: 20, h5: 16, h6: 14,
  };
  const defaultWeights: Record<string, number> = {
    h1: 700, h2: 700, h3: 600, h4: 600, h5: 600, h6: 600,
    strong: 700, b: 700,
  };

  return {
    fontFamily: style.fontFamily || 'Inter, sans-serif',
    fontSize: parseInt(style.fontSize) || defaultSizes[tag] || 16,
    fontWeight: parseInt(style.fontWeight) || defaultWeights[tag] || 400,
    lineHeight: parseFloat(style.lineHeight) || 1.5,
    letterSpacing: parseFloat(style.letterSpacing) || 0,
    textAlign: (style.textAlign || 'left') as any,
    textTransform: (style.textTransform || 'none') as any,
    color: style.color || '#000000',
  };
}

function parseLayout(el: HTMLElement): DesignElement['layout'] {
  const style = el.style;
  return {
    display: (style.display || 'block') as any,
    flexDirection: (style.flexDirection || 'row') as any,
    justifyContent: (style.justifyContent || 'flex-start') as any,
    alignItems: (style.alignItems || 'stretch') as any,
    gap: parseInt(style.gap) || 0,
    gridColumns: style.gridTemplateColumns || '',
    gridRows: style.gridTemplateRows || '',
  };
}

function getElementType(tag: string): ElementType {
  const map: Record<string, ElementType> = {
    div: 'div',
    section: 'section',
    header: 'header',
    nav: 'nav',
    main: 'main',
    footer: 'footer',
    article: 'article',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    p: 'paragraph',
    span: 'text',
    a: 'link',
    button: 'button',
    img: 'image',
    ul: 'list',
    ol: 'list',
    li: 'listItem',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    svg: 'svg',
    label: 'text',
    strong: 'text',
    em: 'text',
    b: 'text',
    i: 'text',
  };
  return map[tag] || 'div';
}

function getElementName(tag: string, el: HTMLElement): string {
  if (el.id) return el.id;
  if (el.className && typeof el.className === 'string') {
    const cls = el.className.split(' ')[0];
    if (cls) return cls.charAt(0).toUpperCase() + cls.slice(1).replace(/[-_]/g, ' ');
  }
  const tagNames: Record<string, string> = {
    div: 'Container',
    section: 'Section',
    header: 'Header',
    nav: 'Navigation',
    main: 'Main',
    footer: 'Footer',
    article: 'Article',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    p: 'Paragraph',
    span: 'Text',
    a: 'Link',
    button: 'Button',
    img: 'Image',
    ul: 'List',
    ol: 'List',
    li: 'List Item',
    form: 'Form',
    input: 'Input',
    textarea: 'Textarea',
  };
  return tagNames[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

let elementCounter = 0;

function convertElement(
  el: HTMLElement,
  parentId: string | null,
  baseUrl: string,
  elements: Record<string, DesignElement>,
  yPos: { value: number },
  depth: number = 0
): string | null {
  const tag = el.tagName.toLowerCase();

  // Skip non-visual elements
  if (['script', 'style', 'link', 'meta', 'head', 'title', 'noscript'].includes(tag)) return null;
  if (el.nodeType !== 1) return null;

  const id = uuid();
  const type = getElementType(tag);
  const name = getElementName(tag, el);

  // Get text content for text elements
  let content = '';
  const isTextType = ['text', 'heading', 'paragraph', 'button', 'link'].includes(type);
  if (isTextType) {
    content = el.textContent?.trim() || '';
    if (tag === 'a') {
      content = el.textContent?.trim() || '';
    }
  }

  // Get image src
  let src = '';
  if (tag === 'img') {
    src = resolveUrl(baseUrl, el.getAttribute('src') || '');
  }

  // Get link href
  let href = '';
  if (tag === 'a') {
    href = el.getAttribute('href') || '';
  }

  // Parse styles
  const inlineStyles = parseInlineStyles(el);
  const typography = parseTypography(el);
  const layout = parseLayout(el);

  // Calculate position - use relative positioning within parent

  const element: DesignElement = {
    id,
    type,
    name,
    parentId,
    children: [],
    x: 0,
    y: yPos.value,
    width: type === 'image' ? (parseInt(el.getAttribute('width') || '200')) : (parentId ? 0 : 1440),
    height: type === 'image' ? (parseInt(el.getAttribute('height') || '150')) : 0,
    rotation: 0,
    opacity: inlineStyles.opacity ?? 1,
    visible: true,
    locked: false,
    background: inlineStyles.background || (parentId === null ? '#ffffff' : 'transparent'),
    border: inlineStyles.border || { width: 0, style: 'solid', color: '#000000' },
    borderRadius: inlineStyles.borderRadius || 0,
    shadow: null,
    padding: inlineStyles.padding || { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block',
    position: parentId ? 'relative' : 'absolute',
    typography,
    layout,
    content,
    src,
    href,
    tag,
    zIndex: 0,
    overflow: 'visible',
  };

  // For root elements, use flow layout
  if (!parentId) {
    element.position = 'absolute';
    element.width = 1440;
  }

  elements[id] = element;

  // Process children
  const childYPos = { value: 0 };
  const childIds: string[] = [];

  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i] as HTMLElement;
    const childId = convertElement(child, id, baseUrl, elements, childYPos, depth + 1);
    if (childId) {
      childIds.push(childId);
    }
  }

  elements[id].children = childIds;

  // Auto-height based on children
  if (childIds.length > 0 && element.height === 0) {
    const maxBottom = childIds.reduce((max, cid) => {
      const child = elements[cid];
      return Math.max(max, child.y + child.height);
    }, 0);
    elements[id].height = maxBottom || 100;
  }

  // For text elements without explicit height
  if (isTextType && element.height === 0) {
    element.height = typography ? Math.ceil(typography.fontSize * typography.lineHeight * Math.max(1, content.split('\n').length)) : 24;
  }
  if (element.height === 0) {
    element.height = 50;
  }

  yPos.value += element.height + (parseInt(el.style.marginBottom) || 0);

  return id;
}

export function createDemoWebsite(): ImportResult {
  const elements: Record<string, DesignElement> = {};
  const rootIds: string[] = [];

  // Root frame
  const frameId = uuid();
  elements[frameId] = {
    id: frameId, type: 'frame', name: 'Demo Website', parentId: null, children: [],
    x: 0, y: 0, width: 1440, height: 2400, rotation: 0, opacity: 1, visible: true, locked: false,
    background: '#ffffff', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'absolute', typography: null,
    layout: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', gap: 0, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'div', zIndex: 0, overflow: 'hidden',
  };
  rootIds.push(frameId);

  // Header
  const headerId = uuid();
  elements[headerId] = {
    id: headerId, type: 'header', name: 'Header', parentId: frameId, children: [],
    x: 0, y: 0, width: 1440, height: 72, rotation: 0, opacity: 1, visible: true, locked: false,
    background: '#ffffff', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 48, bottom: 0, left: 48 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 0, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'header', zIndex: 10, overflow: 'visible',
  };
  elements[frameId].children.push(headerId);

  // Logo
  const logoId = uuid();
  elements[logoId] = {
    id: logoId, type: 'text', name: 'Logo', parentId: headerId, children: [],
    x: 0, y: 0, width: 120, height: 32, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, textAlign: 'left', textTransform: 'none', color: '#111111' },
    layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
    content: 'DeepZen', src: '', href: '', tag: 'span', zIndex: 0, overflow: 'visible',
  };
  elements[headerId].children.push(logoId);

  // Nav
  const navId = uuid();
  elements[navId] = {
    id: navId, type: 'nav', name: 'Navigation', parentId: headerId, children: [],
    x: 0, y: 0, width: 400, height: 32, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 24, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'nav', zIndex: 0, overflow: 'visible',
  };
  elements[headerId].children.push(navId);

  ['Features', 'Pricing', 'About', 'Contact'].forEach((text) => {
    const linkId = uuid();
    elements[linkId] = {
      id: linkId, type: 'link', name: text, parentId: navId, children: [],
      x: 0, y: 0, width: 80, height: 24, rotation: 0, opacity: 1, visible: true, locked: false,
      background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
      display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textAlign: 'left', textTransform: 'none', color: '#555555' },
      layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
      content: text, src: '', href: '#', tag: 'a', zIndex: 0, overflow: 'visible',
    };
    elements[navId].children.push(linkId);
  });

  // Hero section
  const heroId = uuid();
  elements[heroId] = {
    id: heroId, type: 'section', name: 'Hero Section', parentId: frameId, children: [],
    x: 0, y: 72, width: 1440, height: 600, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 120, right: 48, bottom: 120, left: 48 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'section', zIndex: 0, overflow: 'visible',
  };
  elements[frameId].children.push(heroId);

  // Hero heading
  const heroHeadingId = uuid();
  elements[heroHeadingId] = {
    id: heroHeadingId, type: 'heading', name: 'Hero Heading', parentId: heroId, children: [],
    x: 0, y: 0, width: 700, height: 80, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 56, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, textAlign: 'center', textTransform: 'none', color: '#ffffff' },
    layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
    content: 'Design any website.\nEdit everything.', src: '', href: '', tag: 'h1', zIndex: 0, overflow: 'visible',
  };
  elements[heroId].children.push(heroHeadingId);

  // Hero paragraph
  const heroParaId = uuid();
  elements[heroParaId] = {
    id: heroParaId, type: 'paragraph', name: 'Hero Paragraph', parentId: heroId, children: [],
    x: 0, y: 0, width: 500, height: 60, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, textAlign: 'center', textTransform: 'none', color: 'rgba(255,255,255,0.85)' },
    layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
    content: 'Import any public website and edit it like a design file. Change layouts, colors, typography, and more.', src: '', href: '', tag: 'p', zIndex: 0, overflow: 'visible',
  };
  elements[heroId].children.push(heroParaId);

  // CTA Button
  const ctaId = uuid();
  elements[ctaId] = {
    id: ctaId, type: 'button', name: 'CTA Button', parentId: heroId, children: [],
    x: 0, y: 0, width: 180, height: 48, rotation: 0, opacity: 1, visible: true, locked: false,
    background: '#ffffff', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 8, shadow: { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)' },
    padding: { top: 12, right: 32, bottom: 12, left: 32 }, margin: { top: 8, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textAlign: 'center', textTransform: 'none', color: '#667eea' },
    layout: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 0, gridColumns: '', gridRows: '' },
    content: 'Get Started', src: '', href: '', tag: 'button', zIndex: 0, overflow: 'visible',
  };
  elements[heroId].children.push(ctaId);

  // Features section
  const featuresId = uuid();
  elements[featuresId] = {
    id: featuresId, type: 'section', name: 'Features Section', parentId: frameId, children: [],
    x: 0, y: 672, width: 1440, height: 500, rotation: 0, opacity: 1, visible: true, locked: false,
    background: '#f8f9fa', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 80, right: 48, bottom: 80, left: 48 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'section', zIndex: 0, overflow: 'visible',
  };
  elements[frameId].children.push(featuresId);

  // Features heading
  const featHeadingId = uuid();
  elements[featHeadingId] = {
    id: featHeadingId, type: 'heading', name: 'Features Heading', parentId: featuresId, children: [],
    x: 0, y: 0, width: 400, height: 40, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, textAlign: 'center', textTransform: 'none', color: '#111111' },
    layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
    content: 'Powerful Features', src: '', href: '', tag: 'h2', zIndex: 0, overflow: 'visible',
  };
  elements[featuresId].children.push(featHeadingId);

  // Feature cards
  const cardsContainer = uuid();
  elements[cardsContainer] = {
    id: cardsContainer, type: 'div', name: 'Cards Container', parentId: featuresId, children: [],
    x: 0, y: 0, width: 1200, height: 280, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', gap: 24, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'div', zIndex: 0, overflow: 'visible',
  };
  elements[featuresId].children.push(cardsContainer);

  const featureData = [
    { title: 'Website Import', desc: 'Import any public website and convert it into editable design elements.' },
    { title: 'Visual Editing', desc: 'Select, move, resize, and restyle any element with precision controls.' },
    { title: 'Export Code', desc: 'Export your designs as clean HTML, CSS, or JSON for development.' },
  ];

  featureData.forEach((feat) => {
    const cardId = uuid();
    elements[cardId] = {
      id: cardId, type: 'div', name: feat.title, parentId: cardsContainer, children: [],
      x: 0, y: 0, width: 360, height: 240, rotation: 0, opacity: 1, visible: true, locked: false,
      background: '#ffffff', border: { width: 1, style: 'solid', color: '#e5e7eb' }, borderRadius: 12, shadow: { x: 0, y: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,0.06)' },
      padding: { top: 32, right: 24, bottom: 32, left: 24 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
      display: 'block', position: 'relative', typography: null,
      layout: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, gridColumns: '', gridRows: '' },
      content: '', src: '', href: '', tag: 'div', zIndex: 0, overflow: 'visible',
    };
    elements[cardsContainer].children.push(cardId);

    const cardTitleId = uuid();
    elements[cardTitleId] = {
      id: cardTitleId, type: 'heading', name: 'Card Title', parentId: cardId, children: [],
      x: 0, y: 0, width: 300, height: 28, rotation: 0, opacity: 1, visible: true, locked: false,
      background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
      display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.3, textAlign: 'left', textTransform: 'none', color: '#111111' },
      layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
      content: feat.title, src: '', href: '', tag: 'h3', zIndex: 0, overflow: 'visible',
    };
    elements[cardId].children.push(cardTitleId);

    const cardDescId = uuid();
    elements[cardDescId] = {
      id: cardDescId, type: 'paragraph', name: 'Card Description', parentId: cardId, children: [],
      x: 0, y: 0, width: 300, height: 60, rotation: 0, opacity: 1, visible: true, locked: false,
      background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
      display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, textAlign: 'left', textTransform: 'none', color: '#666666' },
      layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
      content: feat.desc, src: '', href: '', tag: 'p', zIndex: 0, overflow: 'visible',
    };
    elements[cardId].children.push(cardDescId);
  });

  // Footer
  const footerId = uuid();
  elements[footerId] = {
    id: footerId, type: 'footer', name: 'Footer', parentId: frameId, children: [],
    x: 0, y: 1172, width: 1440, height: 80, rotation: 0, opacity: 1, visible: true, locked: false,
    background: '#111111', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 24, right: 48, bottom: 24, left: 48 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: null,
    layout: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 0, gridColumns: '', gridRows: '' },
    content: '', src: '', href: '', tag: 'footer', zIndex: 0, overflow: 'visible',
  };
  elements[frameId].children.push(footerId);

  const footerTextId = uuid();
  elements[footerTextId] = {
    id: footerTextId, type: 'text', name: 'Footer Text', parentId: footerId, children: [],
    x: 0, y: 0, width: 300, height: 24, rotation: 0, opacity: 1, visible: true, locked: false,
    background: 'transparent', border: { width: 0, style: 'solid', color: '#000' }, borderRadius: 0, shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block', position: 'relative', typography: { fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textAlign: 'left', textTransform: 'none', color: '#888888' },
    layout: { display: 'block', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 0, gridColumns: '', gridRows: '' },
    content: 'Built with DeepZen', src: '', href: '', tag: 'span', zIndex: 0, overflow: 'visible',
  };
  elements[footerId].children.push(footerTextId);

  return { elements, rootIds };
}

export async function importWebsite(url: string): Promise<ImportResult> {
  const html = await fetchWithProxy(url);
  const sanitized = sanitizeHtml(html);

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');

  const elements: Record<string, DesignElement> = {};
  const rootIds: string[] = [];

  // Create root frame
  const frameId = uuid();
  const frame: DesignElement = {
    id: frameId,
    type: 'frame',
    name: new URL(url).hostname,
    parentId: null,
    children: [],
    x: 0,
    y: 0,
    width: 1440,
    height: 900,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    background: '#ffffff',
    border: { width: 0, style: 'solid', color: '#000000' },
    borderRadius: 0,
    shadow: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    display: 'block',
    position: 'absolute',
    typography: null,
    layout: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', gap: 0, gridColumns: '', gridRows: '' },
    content: '',
    src: '',
    href: '',
    tag: 'div',
    zIndex: 0,
    overflow: 'hidden',
  };
  elements[frameId] = frame;
  rootIds.push(frameId);

  // Process body content
  const body = doc.body;
  if (body) {
    const yPos = { value: 0 };
    const childIds: string[] = [];

    for (let i = 0; i < body.children.length; i++) {
      const child = body.children[i] as HTMLElement;
      const childId = convertElement(child, frameId, url, elements, yPos, 1);
      if (childId) {
        childIds.push(childId);
      }
    }

    elements[frameId].children = childIds;
    elements[frameId].height = yPos.value || 900;
  }

  return { elements, rootIds };
}
