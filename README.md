# DeepZen - Browser-based Web Design Editor

A powerful Figma-inspired web design editor that allows you to import any public website and edit it like a design file.

## Features

### Core Editing
- **Infinite Canvas** - Pan, zoom, and navigate freely
- **Design Tools** - Select, Frame, Rectangle, Ellipse, Line, Text, Hand tools
- **Selection System** - Click, shift-click, drag-select with resize handles
- **Layers Panel** - Tree view with visibility, lock, and rename
- **Properties Panel** - Full control over position, size, layout, colors, typography
- **Design Tokens** - Auto-extracted colors, fonts, and spacing

### Advanced Features
- **Text Editing** - Inline editing with full typography controls
- **Alignment Tools** - Align and distribute multiple elements
- **Snap Guides** - Visual alignment guides when moving elements
- **Group/Ungroup** - Organize elements into groups (Ctrl+G)
- **Find & Replace** - Search and replace text across all elements (Ctrl+F)
- **Command Menu** - Quick command access (Ctrl+K)
- **Context Menu** - Right-click for element actions
- **Undo/Redo** - Full history system (Ctrl+Z / Ctrl+Shift+Z)
- **Copy/Paste/Duplicate** - Full clipboard support

### Website Import
- **URL Import** - Import any public website via URL
- **CORS Proxy Support** - Works with cross-origin restrictions
- **HTML/CSS Parsing** - Converts websites to editable elements
- **Demo Website** - Built-in demo for testing without network
- **Sanitization** - XSS protection and script removal

### Multi-Page Support
- **Pages Panel** - Create and manage multiple pages
- **Page Switching** - Switch between pages seamlessly
- **Page Rename** - Double-click to rename pages

### Responsive Design
- **Viewport Modes** - Desktop (1440px), Tablet (768px), Mobile (390px)
- **Preview Mode** - Full-screen website preview
- **Responsive Layouts** - Flex and Grid layout support

### Export Options
- **HTML Export** - Clean, semantic HTML
- **CSS Export** - Separate CSS file
- **JSON Export** - Document structure as JSON
- **PNG Export** - High-quality screenshot using html2canvas

### Persistence
- **IndexedDB Storage** - Projects saved locally
- **Auto-Save** - Automatic saving every second
- **Recent Projects** - Quick access to previous work

### UX Polish
- **Toast Notifications** - User feedback system
- **Loading States** - Visual feedback during operations
- **Keyboard Shortcuts** - Full keyboard navigation
- **Drag & Drop** - Drop images directly onto canvas
- **Zoom to Cursor** - Precise zoom control

## Keyboard Shortcuts

### Tools
- `V` - Select tool
- `F` - Frame tool
- `R` - Rectangle tool
- `O` - Ellipse tool
- `L` - Line tool
- `T` - Text tool
- `H` - Hand tool
- `Space` - Temporary pan (hold)

### Actions
- `Delete/Backspace` - Delete selected elements
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+D` - Duplicate
- `Ctrl+G` - Group
- `Ctrl+Shift+G` - Ungroup
- `Ctrl+F` - Find & Replace
- `Ctrl+K` - Command Menu
- `Escape` - Deselect / Cancel

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **IndexedDB** - Local storage
- **html2canvas** - PNG export
- **Tailwind CSS** - Utility styles

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx           # Infinite canvas with rendering
│   ├── Toolbar.tsx          # Top toolbar
│   ├── LeftToolbar.tsx      # Left tool panel
│   ├── LayersPanel.tsx      # Layers tree view
│   ├── PropertiesPanel.tsx  # Properties inspector
│   ├── DesignTokens.tsx     # Design tokens panel
│   ├── PagesPanel.tsx       # Pages management
│   ├── AlignmentBar.tsx     # Alignment tools
│   ├── SnapGuides.tsx       # Snap guide system
│   ├── CommandMenu.tsx      # Command palette
│   ├── FindReplace.tsx      # Find & replace
│   ├── ContextMenu.tsx      # Right-click menu
│   ├── Preview.tsx          # Preview mode
│   ├── Dashboard.tsx        # Landing page
│   ├── Toast.tsx            # Toast notifications
│   └── Icons.tsx            # SVG icons
├── store/
│   └── index.ts             # Zustand store
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   ├── importer.ts          # Website import logic
│   ├── exporter.ts          # Export functions
│   └── storage.ts           # IndexedDB storage
├── App.tsx                  # Main app component
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

The built application will be in `dist/`

## Usage

### Import a Website
1. Click "Import Website" on the dashboard
2. Enter a public URL (e.g., https://example.com)
3. Wait for import to complete
4. Edit the imported website like a design file

### Create from Scratch
1. Click "Blank Canvas" on the dashboard
2. Use tools to create elements
3. Build your design from scratch

### Load Demo
1. Click "Load Demo" on the dashboard
2. Explore the pre-built demo website
3. Edit and customize as needed

## Architecture Highlights

### Document Model
- Hierarchical element tree
- Each element has full styling properties
- Supports nested children
- Flexible layout system (flex, grid, block)

### Rendering
- DOM-based rendering for editability
- Absolute positioning for precise control
- Relative positioning for flow layouts
- Real-time updates

### State Management
- Zustand for global state
- Immutable updates
- History tracking for undo/redo
- Auto-save to IndexedDB

### Import Pipeline
1. Fetch HTML via CORS proxy
2. Sanitize (remove scripts, event handlers)
3. Parse DOM structure
4. Extract inline styles
5. Convert to internal model
6. Render on canvas

## Limitations

- **CORS Restrictions** - Some websites block cross-origin requests
- **JavaScript** - Imported JavaScript is not executed (security)
- **Complex Layouts** - Some advanced CSS may not import perfectly
- **External Assets** - Images/fonts may not load if blocked by CORS
- **Responsive** - Responsive behavior is preserved but not fully editable per breakpoint

## Future Enhancements

- [ ] AI-powered design suggestions
- [ ] Component library
- [ ] Design system management
- [ ] Collaboration features
- [ ] Version history
- [ ] Plugin system
- [ ] More export formats (React, Vue, etc.)
- [ ] Advanced responsive editing
- [ ] Animation support
- [ ] Prototyping features

## License

MIT

## Credits

Built with modern web technologies and inspired by professional design tools like Figma, Framer, and Webflow.
