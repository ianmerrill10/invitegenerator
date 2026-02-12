"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Loader2, Monitor, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useEditorStore, useInvitationStore } from "@/lib/stores";
import {
  EditorToolbar,
  ElementLibrary,
  LayersPanel,
  TextEffectsPanel,
  CanvasElement,
  PropertiesPanel
} from "@/components/editor";
import { Button } from "@/components/ui/button";
import { MediaPicker, type MediaItem } from "@/components/media";
import { ImageUpload } from "@/components/media";
import { DesignElement, Invitation, LibraryItem } from "@/types";
import { Image } from "lucide-react";
import { useEditorShortcuts, ShortcutsReference } from "@/hooks/use-editor-shortcuts";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { 
    elements, 
    setElements, 
    updateDesign, 
    selectedElementId,
    selectElement,
    addElement,
    zoom,
    showGrid,
    gridSize,
    reset: resetEditor 
  } = useEditorStore();

  const { currentInvitation, fetchInvitation, updateInvitation } = useInvitationStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<"elements" | "layers" | "text-effects" | "media" | null>("elements");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [dismissedMobileWarning, setDismissedMobileWarning] = useState(false);

  // Detect mobile/small screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Setup keyboard shortcuts
  useEditorShortcuts({
    enabled: true,
    onSave: () => {
      if (!isSaving) {
        handleSaveRef.current?.();
      }
    },
    onPreview: () => {
      if (currentInvitation) {
        window.open(`/i/${currentInvitation.shortId}`, '_blank');
      }
    },
  });

  // Ref for save handler to avoid stale closure
  const handleSaveRef = useRef<(() => void) | null>(null);

  // Initialize Editor
  useEffect(() => {
    async function init() {
      if (id) {
        try {
          await fetchInvitation(id);
        } catch (error) {
          toast.error("Failed to load invitation");
          router.push("/dashboard");
        }
      }
    }
    init();

    return () => {
      resetEditor();
    };
  }, [id, fetchInvitation, resetEditor, router]);

  // Sync store with fetched invitation
  useEffect(() => {
    if (currentInvitation) {
      // If invitation has design data, load it
      if (currentInvitation.designData) {
        updateDesign(currentInvitation.designData);
        
        // Load elements if they exist
        if (currentInvitation.designData.elements) {
          setElements(currentInvitation.designData.elements);
        }
      }
    }
  }, [currentInvitation, updateDesign, setElements]);

  const handleSave = async () => {
    if (!currentInvitation) return;
    
    setIsSaving(true);
    try {
      // Get current state
      const { design, elements } = useEditorStore.getState();
      
      // Prepare update data
      const updatedDesignData = {
        ...design,
        elements: elements
      };

      // Save design settings
      await updateInvitation(currentInvitation.id, {
        // @ts-expect-error - designData type mismatch needs fixing in store
        designData: updatedDesignData
      });
      
      toast.success("Design saved successfully");
    } catch (error) {
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  // Keep save ref updated for keyboard shortcuts
  useEffect(() => {
    handleSaveRef.current = handleSave;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: ref pattern doesn't need handleSave in deps
  }, [currentInvitation, updateInvitation]);

  // Add element from library
  const handleAddElement = (item: LibraryItem) => {
    const newElement: DesignElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: item.type,
      content: item.content || "",
      position: { x: 100, y: 100 },
      size: { width: item.type === "text" ? 200 : 100, height: item.type === "text" ? 50 : 100 },
      style: {
        color: "#000000",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "normal",
        textAlign: "left",
        backgroundColor: item.type === "shape" ? "#3b82f6" : "transparent",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "transparent",
        borderStyle: "solid",
      },
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      hidden: false,
    };
    addElement(newElement);
    toast.success(`${item.name} added to canvas`);
  };

  // Quick add functions
  const handleAddText = () => {
    const newElement: DesignElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      content: "Double-click to edit",
      position: { x: 200, y: 200 },
      size: { width: 300, height: 60 },
      style: {
        color: "#000000",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "normal",
        textAlign: "center",
        backgroundColor: "transparent",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "transparent",
        borderStyle: "solid",
      },
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      hidden: false,
    };
    addElement(newElement);
  };

  const handleAddImage = (mediaItem: MediaItem) => {
    const newElement: DesignElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "image",
      content: mediaItem.url,
      position: { x: 200, y: 200 },
      size: { width: 200, height: 200 },
      style: {
        color: "#000000",
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "normal",
        textAlign: "left",
        backgroundColor: "transparent",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "transparent",
        borderStyle: "solid",
      },
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      hidden: false,
    };
    addElement(newElement);
    setShowMediaPicker(false);
    toast.success("Image added to canvas");
  };

  const handleAddShape = (shapeType: "rectangle" | "circle") => {
    const newElement: DesignElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "shape",
      content: shapeType,
      position: { x: 200, y: 200 },
      size: { width: 150, height: 150 },
      style: {
        color: "#000000",
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "normal",
        textAlign: "left",
        backgroundColor: "#3b82f6",
        borderRadius: shapeType === "circle" ? 9999 : 8,
        borderWidth: 0,
        borderColor: "transparent",
        borderStyle: "solid",
      },
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      hidden: false,
    };
    addElement(newElement);
  };

  if (!currentInvitation) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <span className="ml-2 text-gray-600">Loading editor...</span>
      </div>
    );
  }

  // Mobile device warning
  if (isMobileDevice && !dismissedMobileWarning) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Desktop Recommended
          </h1>
          <p className="text-gray-600 mb-6">
            The invitation editor works best on larger screens. For the best experience,
            please use a desktop or tablet device.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setDismissedMobileWarning(true)}
              className="w-full"
            >
              Continue Anyway
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/invitations")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invitations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex-none z-10">
          <EditorToolbar 
            onSave={handleSave}
            onPreview={() => window.open(`/i/${currentInvitation.shortId}`, '_blank')}
          />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex-none flex flex-col z-10">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveSidebar("elements")}
                className={`flex-1 py-3 text-sm font-medium ${activeSidebar === "elements" ? "text-brand-600 border-b-2 border-brand-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Elements
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebar("layers")}
                className={`flex-1 py-3 text-sm font-medium ${activeSidebar === "layers" ? "text-brand-600 border-b-2 border-brand-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Layers
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebar("text-effects")}
                className={`flex-1 py-3 text-sm font-medium ${activeSidebar === "text-effects" ? "text-brand-600 border-b-2 border-brand-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Effects
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebar("media")}
                className={`flex-1 py-3 text-sm font-medium ${activeSidebar === "media" ? "text-brand-600 border-b-2 border-brand-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Media
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {activeSidebar === "elements" && (
                <ElementLibrary onSelectElement={handleAddElement} />
              )}
              {activeSidebar === "layers" && (
                <LayersPanel />
              )}
              {activeSidebar === "text-effects" && selectedElementId && (
                <TextEffectsPanel
                  style={elements.find(el => el.id === selectedElementId)?.style || {}}
                  onChange={(updates) => {
                    if (selectedElementId) {
                      useEditorStore.getState().updateElement(selectedElementId, { style: { ...elements.find(el => el.id === selectedElementId)?.style, ...updates } });
                    }
                  }}
                />
              )}
              {activeSidebar === "text-effects" && !selectedElementId && (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a text element to edit its effects</p>
                </div>
              )}
              {activeSidebar === "media" && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Upload images or select from your media library to add to your design.
                  </div>
                  <ImageUpload
                    onUpload={async (file) => {
                      // Upload to S3 using the upload API
                      const formData = new FormData();
                      formData.append("file", file);

                      const response = await fetch("/api/upload", {
                        method: "PUT",
                        body: formData,
                      });

                      const result = await response.json();

                      if (!response.ok || !result.success) {
                        throw new Error(result.error?.message || "Failed to upload image");
                      }

                      const url = result.data.publicUrl;
                      handleAddImage({ id: `img_${Date.now()}`, url, name: file.name, type: "image" });
                      return url;
                    }}
                    accept="image/*"
                    maxSize={10}
                  />
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowMediaPicker(true)}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Browse Media Library
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-8 relative">
            <div 
              className="bg-white shadow-lg relative transition-all duration-200 ease-in-out"
              style={{
                width: currentInvitation.designData?.width || 800,
                height: currentInvitation.designData?.height || 600,
                backgroundColor: currentInvitation.designData?.backgroundColor || "#ffffff",
                transform: `scale(${zoom})`,
                transformOrigin: "center center"
              }}
              onClick={() => selectElement(null)}
            >
              {/* Grid Background */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`
                  }}
                />
              )}

              {/* Elements Render Layer */}
              {elements.map((element) => (
                <CanvasElement key={element.id} element={element} />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          {selectedElementId && elements.find(el => el.id === selectedElementId) && (
            <div className="w-72 bg-white border-l border-gray-200 flex-none overflow-y-auto z-10">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Properties</h3>
              </div>
              <PropertiesPanel
                element={elements.find(el => el.id === selectedElementId)!}
                onUpdate={(updates) => {
                  useEditorStore.getState().updateElement(selectedElementId, updates);
                }}
                onDelete={() => {
                  useEditorStore.getState().deleteElement(selectedElementId);
                  selectElement(null);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Dialog */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleAddImage}
        items={[]}
      />
    </DndProvider>
  );
}
