import type { DesignElement } from '../types';
import html2canvas from 'html2canvas';

function elementToCSS(el: DesignElement): string {
  const styles: string[] = [];

  if (el.position === 'absolute') {
    styles.push(`position: absolute`);
    styles.push(`left: ${el.x}px`);
    styles.push(`top: ${el.y}px`);
  } else {
    styles.push(`position: ${el.position}`);
  }

  styles.push(`width: ${el.width}px`);
  if (el.height > 0) styles.push(`height: ${el.height}px`);

  if (el.background && el.background !== 'transparent') {
    styles.push(`background: ${el.background}`);
  }

  if (el.border.width > 0) {
    styles.push(`border: ${el.border.width}px ${el.border.style} ${el.border.color}`);
  }

  if (el.borderRadius > 0) {
    styles.push(`border-radius: ${el.borderRadius}px`);
  }

  if (el.shadow) {
    styles.push(`box-shadow: ${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.spread}px ${el.shadow.color}`);
  }

  if (el.opacity < 1) {
    styles.push(`opacity: ${el.opacity}`);
  }

  if (el.rotation !== 0) {
    styles.push(`transform: rotate(${el.rotation}deg)`);
  }

  const p = el.padding;
  if (p.top || p.right || p.bottom || p.left) {
    if (p.top === p.right && p.right === p.bottom && p.bottom === p.left) {
      styles.push(`padding: ${p.top}px`);
    } else {
      styles.push(`padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`);
    }
  }

  if (el.overflow !== 'visible') {
    styles.push(`overflow: ${el.overflow}`);
  }

  // Layout
  if (el.layout.display !== 'block') {
    styles.push(`display: ${el.layout.display}`);
    if (el.layout.display === 'flex') {
      styles.push(`flex-direction: ${el.layout.flexDirection}`);
      styles.push(`justify-content: ${el.layout.justifyContent}`);
      styles.push(`align-items: ${el.layout.alignItems}`);
      if (el.layout.gap > 0) styles.push(`gap: ${el.layout.gap}px`);
    }
    if (el.layout.display === 'grid') {
      if (el.layout.gridColumns) styles.push(`grid-template-columns: ${el.layout.gridColumns}`);
      if (el.layout.gridRows) styles.push(`grid-template-rows: ${el.layout.gridRows}`);
    }
  }

  // Typography
  if (el.typography) {
    styles.push(`font-family: ${el.typography.fontFamily}`);
    styles.push(`font-size: ${el.typography.fontSize}px`);
    styles.push(`font-weight: ${el.typography.fontWeight}`);
    styles.push(`line-height: ${el.typography.lineHeight}`);
    if (el.typography.letterSpacing) styles.push(`letter-spacing: ${el.typography.letterSpacing}px`);
    styles.push(`text-align: ${el.typography.textAlign}`);
    if (el.typography.textTransform !== 'none') styles.push(`text-transform: ${el.typography.textTransform}`);
    styles.push(`color: ${el.typography.color}`);
  }

  return styles.join(';\n  ');
}

function elementToHTML(el: DesignElement, elements: Record<string, DesignElement>, indent: number = 0): string {
  const pad = '  '.repeat(indent);
  const tag = el.tag || 'div';

  // Self-closing tags
  if (el.type === 'image' && el.src) {
    return `${pad}<img src="${el.src}" alt="" class="dz-${el.id}" />`;
  }

  const css = elementToCSS(el);
  const children = el.children.map((cid) => {
    const child = elements[cid];
    if (child) return elementToHTML(child, elements, indent + 1);
    return '';
  }).filter(Boolean).join('\n');

  const content = el.content || '';
  const innerContent = content ? `${pad}  ${content}\n` : '';

  return `${pad}<${tag} class="dz-${el.id}">\n${innerContent}${children ? children + '\n' : ''}${pad}</${tag}>`;
}

export function exportToHTML(elements: Record<string, DesignElement>, rootIds: string[]): string {
  let bodyContent = '';
  rootIds.forEach((id) => {
    const el = elements[id];
    if (el) bodyContent += elementToHTML(el, elements, 2) + '\n';
  });

  // Generate CSS
  let cssContent = '';
  Object.values(elements).forEach((el) => {
    const css = elementToCSS(el);
    if (css) {
      cssContent += `.dz-${el.id} {\n  ${css}\n}\n\n`;
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported from DeepZen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, sans-serif; }
    ${cssContent}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

export function exportToCSS(elements: Record<string, DesignElement>): string {
  let css = '';
  Object.values(elements).forEach((el) => {
    const styles = elementToCSS(el);
    if (styles) {
      css += `.dz-${el.id} {\n  ${styles}\n}\n\n`;
    }
  });
  return css;
}

export function exportToJSON(elements: Record<string, DesignElement>, rootIds: string[]): string {
  return JSON.stringify({ elements, rootIds }, null, 2);
}

export async function exportToPNG(
  elements: Record<string, DesignElement>,
  rootIds: string[],
  width: number = 1440,
  height: number = 900
): Promise<Blob> {
  // Create a temporary container to render the design
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${width}px;
    min-height: ${height}px;
    background: white;
    overflow: visible;
    font-family: Inter, sans-serif;
  `;
  document.body.appendChild(container);

  // Render elements
  const renderElement = (el: DesignElement): HTMLElement => {
    const div = document.createElement('div');
    div.style.position = el.position === 'absolute' ? 'absolute' : 'relative';
    if (el.position === 'absolute') {
      div.style.left = `${el.x}px`;
      div.style.top = `${el.y}px`;
    }
    div.style.width = `${el.width}px`;
    if (el.height > 0) div.style.height = `${el.height}px`;
    div.style.background = el.background || 'transparent';
    if (el.border.width > 0) {
      div.style.border = `${el.border.width}px ${el.border.style} ${el.border.color}`;
    }
    div.style.borderRadius = `${el.borderRadius}px`;
    if (el.shadow) {
      div.style.boxShadow = `${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.spread}px ${el.shadow.color}`;
    }
    div.style.opacity = `${el.opacity}`;
    div.style.padding = `${el.padding.top}px ${el.padding.right}px ${el.padding.bottom}px ${el.padding.left}px`;
    if (el.rotation) div.style.transform = `rotate(${el.rotation}deg)`;
    div.style.overflow = el.overflow;

    // Layout
    if (el.layout.display === 'flex') {
      div.style.display = 'flex';
      div.style.flexDirection = el.layout.flexDirection;
      div.style.justifyContent = el.layout.justifyContent;
      div.style.alignItems = el.layout.alignItems;
      if (el.layout.gap > 0) div.style.gap = `${el.layout.gap}px`;
    } else if (el.layout.display === 'grid') {
      div.style.display = 'grid';
      if (el.layout.gridColumns) div.style.gridTemplateColumns = el.layout.gridColumns;
      if (el.layout.gridRows) div.style.gridTemplateRows = el.layout.gridRows;
      if (el.layout.gap > 0) div.style.gap = `${el.layout.gap}px`;
    }

    // Typography
    if (el.typography) {
      div.style.fontFamily = el.typography.fontFamily;
      div.style.fontSize = `${el.typography.fontSize}px`;
      div.style.fontWeight = `${el.typography.fontWeight}`;
      div.style.lineHeight = `${el.typography.lineHeight}`;
      div.style.letterSpacing = `${el.typography.letterSpacing}px`;
      div.style.textAlign = el.typography.textAlign;
      div.style.textTransform = el.typography.textTransform;
      div.style.color = el.typography.color;
    }

    // Content
    if (el.content) {
      div.textContent = el.content;
    }

    // Image
    if (el.type === 'image' && el.src) {
      const img = document.createElement('img');
      img.src = el.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.crossOrigin = 'anonymous';
      div.appendChild(img);
    }

    // Children
    el.children.forEach((childId) => {
      const child = elements[childId];
      if (child) {
        div.appendChild(renderElement(child));
      }
    });

    return div;
  };

  rootIds.forEach((id) => {
    const el = elements[id];
    if (el) container.appendChild(renderElement(el));
  });

  try {
    // Use html2canvas to capture the rendered design
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        document.body.removeChild(container);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    });
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
