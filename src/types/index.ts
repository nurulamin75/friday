export interface Typography {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
}

export interface Layout {
  display: 'block' | 'flex' | 'grid' | 'none';
  flexDirection: 'row' | 'column';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap: number;
  gridColumns: string;
  gridRows: string;
}

export interface Border {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
}

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export type ElementType =
  | 'frame'
  | 'section'
  | 'header'
  | 'nav'
  | 'main'
  | 'footer'
  | 'article'
  | 'div'
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'link'
  | 'list'
  | 'listItem'
  | 'form'
  | 'input'
  | 'textarea'
  | 'svg'
  | 'group'
  | 'rectangle'
  | 'ellipse'
  | 'line';

export interface DesignElement {
  id: string;
  type: ElementType;
  name: string;
  parentId: string | null;
  children: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  background: string;
  border: Border;
  borderRadius: number;
  shadow: Shadow | null;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  display: string;
  position: 'relative' | 'absolute' | 'fixed';
  typography: Typography | null;
  layout: Layout;
  content: string;
  src: string;
  href: string;
  tag: string;
  zIndex: number;
  overflow: 'visible' | 'hidden' | 'auto';
}

export interface Page {
  id: string;
  name: string;
  elements: Record<string, DesignElement>;
  rootIds: string[];
  width: number;
  height: number;
  background: string;
}

export interface Project {
  id: string;
  name: string;
  sourceUrl: string;
  createdAt: number;
  updatedAt: number;
  pages: Record<string, Page>;
  currentPageId: string;
  thumbnail: string;
}

export type Tool = 'select' | 'frame' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'hand' | 'zoom';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface ViewportSize {
  desktop: number;
  tablet: number;
  mobile: number;
}

export interface HistoryState {
  elements: Record<string, DesignElement>;
  rootIds: string[];
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
