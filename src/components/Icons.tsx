import React from 'react';

const s = (size: number) => ({ width: size, height: size });

export const Icons = {
  Cursor: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 1l10 6.5L8.5 9 7 14z" />
    </svg>
  ),
  Frame: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <line x1="2" y1="6" x2="14" y2="6" />
      <line x1="6" y1="2" x2="6" y2="14" />
    </svg>
  ),
  Rectangle: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
    </svg>
  ),
  Ellipse: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="8" cy="8" rx="6" ry="5" />
    </svg>
  ),
  Line: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="14" x2="14" y2="2" />
    </svg>
  ),
  Text: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h10M8 3v10M5.5 13h5" />
    </svg>
  ),
  Hand: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1v6M6 4v4M10 4v4M4 7v4a4 4 0 004 4h1a4 4 0 004-4V7M12 7v2" />
    </svg>
  ),
  Zoom: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  ),
  Undo: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h7a3 3 0 010 6H8M3 6l3-3M3 6l3 3" />
    </svg>
  ),
  Redo: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 6H6a3 3 0 000 6h2M13 6l-3-3M13 6l-3 3" />
    </svg>
  ),
  Eye: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  EyeOff: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
      <line x1="2" y1="2" x2="14" y2="14" />
    </svg>
  ),
  Lock: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  ),
  Unlock: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0" />
    </svg>
  ),
  ChevronRight: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4l4 4-4 4" />
    </svg>
  ),
  ChevronDown: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
  Plus: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  ),
  Search: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  ),
  Download: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8M5 7l3 3 3-3M3 12h10" />
    </svg>
  ),
  Share: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="3" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="13" r="2" />
      <line x1="6" y1="7" x2="10" y2="4" />
      <line x1="6" y1="9" x2="10" y2="12" />
    </svg>
  ),
  Trash: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" />
    </svg>
  ),
  Globe: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2a10 10 0 010 12M8 2a10 10 0 000 12" />
    </svg>
  ),
  Desktop: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="14" height="10" rx="1" />
      <line x1="5" y1="14" x2="11" y2="14" />
      <line x1="8" y1="12" x2="8" y2="14" />
    </svg>
  ),
  Tablet: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="1" width="10" height="14" rx="1" />
      <line x1="7" y1="13" x2="9" y2="13" />
    </svg>
  ),
  Mobile: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="1" width="8" height="14" rx="1" />
      <line x1="7" y1="13" x2="9" y2="13" />
    </svg>
  ),
  Layers: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l6 4-6 4-6-4z" />
      <path d="M2 9l6 4 6-4" />
    </svg>
  ),
  Settings: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13" />
    </svg>
  ),
  Command: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2a2 2 0 012 2v8a2 2 0 01-4 0 2 2 0 012-2h8a2 2 0 010 4 2 2 0 01-2-2V4a2 2 0 014 0 2 2 0 01-2 2H4a2 2 0 01-2-2 2 2 0 012-2z" />
    </svg>
  ),
  Image: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <circle cx="5.5" cy="5.5" r="1.5" />
      <path d="M14 10l-3-3-6 6" />
    </svg>
  ),
  Folder: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4v9h12V6H8L6 4H2z" />
    </svg>
  ),
  Play: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2l10 6-10 6z" />
    </svg>
  ),
  X: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  ),
  ArrowLeft: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3L5 8l5 5" />
    </svg>
  ),
  Copy: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 11V3h8" />
    </svg>
  ),
  Group: ({ size = 16 }: { size?: number }) => (
    <svg {...s(size)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" strokeDasharray="2 1" />
      <rect x="9" y="9" width="6" height="6" rx="1" strokeDasharray="2 1" />
      <rect x="5" y="5" width="6" height="6" rx="1" />
    </svg>
  ),
};
