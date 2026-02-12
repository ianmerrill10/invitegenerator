// Editor Components - Phase 3: Editor Enhancements
// ================================================

// Canvas Element - Individual draggable/editable element on canvas
export { CanvasElement } from "./canvas-element";

// Image Upload - Upload custom images to S3 with drag-and-drop
export { ImageUpload, ImageUploadButton } from "./image-upload";

// Element Library - Pre-made stickers, icons, shapes, decorations
export { ElementLibrary, ElementLibrarySidebar } from "./element-library";

// Layers Panel - Reorder, lock, hide elements
export { LayersPanel, LayersPanelCompact } from "./layers-panel";

// Text Effects - Shadows, outlines, gradients on text
export { TextEffectsPanel, generateTextEffectStyles } from "./text-effects-panel";

// Background Removal - AI-powered background removal for photos
export { BackgroundRemoval, BackgroundRemovalButton } from "./background-removal";

// Editor Toolbar - Main toolbar with undo/redo, zoom, and actions
export { EditorToolbar, AddElementToolbar } from "./editor-toolbar";

// Color Picker - Color selection with palettes and custom input
export { ColorPicker, ColorSwatch, QuickColorSelect, colorPalettes } from "./color-picker";

// Font Picker - Font selection with categories and size
export { FontPicker, QuickFontSelect, FontSizeSelect, fontCategories } from "./font-picker";

// Properties Panel - Element properties editor
export { PropertiesPanel } from "./properties-panel";

// Editor Sidebar - Collapsible sidebar with panels
export {
  EditorSidebar,
  SidebarPanelContent,
  SidebarSection,
  type SidebarPanel,
} from "./editor-sidebar";
