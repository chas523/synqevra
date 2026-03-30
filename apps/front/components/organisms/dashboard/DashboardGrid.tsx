"use client";

import React, { useMemo, useRef, useCallback } from "react";
import { GridLayout, useContainerWidth, Layout, noCompactor, setTopLeft, LayoutItem } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import { WidgetTile } from "./WidgetTile";

export interface WidgetLayoutItem {
  id: string;
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
  widgetConfig: any;
}

interface DashboardGridProps {
  widgets: WidgetLayoutItem[];
  columns: number;
  margin: number;
  backgroundColor: string;
  isEditMode: boolean;
  totalRows?: number;
  onLayoutChange?: (layout: Layout) => void;
}

const ROW_HEIGHT = 50;

// Strategy using top/left instead of CSS transforms for better coordinate stability during resize
const absolutePositionStrategy = {
  type: "absolute" as const,
  scale: 1,
  calcStyle: setTopLeft,
};

export function DashboardGrid({
  widgets,
  columns,
  margin,
  backgroundColor,
  isEditMode,
  totalRows = 18,
  onLayoutChange,
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 });

  // Ref to track resize start state to fix the "dropped events" bug (GitHub #237)
  const resizeStateRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const layout: Layout = useMemo(
    () =>
      widgets.map((w) => ({
        i: w.id,
        x: w.col,
        y: w.row,
        w: w.sizeX,
        h: w.sizeY,
      })),
    [widgets],
  );

  const canvasMinHeight = totalRows * ROW_HEIGHT + (totalRows + 1) * margin;

  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const validateOverlap = useCallback((l1: any, l2: any) => {
    if (l1.i === l2.i) return false;
    if (l1.x + l1.w <= l2.x) return false;
    if (l1.x >= l2.x + l2.w) return false;
    if (l1.y + l1.h <= l2.y) return false;
    if (l1.y >= l2.y + l2.h) return false;
    return true;
  }, []);

  const handleResizeStart = useCallback((_layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null, _placeholder: LayoutItem | null, event: Event) => {
    if (newItem) {
      const e = event as any;
      const clientX = e?.clientX ?? e?.nativeEvent?.clientX;
      const clientY = e?.clientY ?? e?.nativeEvent?.clientY;

      if (typeof clientX === "number" && typeof clientY === "number") {
        lastMousePosRef.current = { x: clientX, y: clientY };
      }

      const onGlobalMove = (moveEv: MouseEvent) => {
        lastMousePosRef.current = { x: moveEv.clientX, y: moveEv.clientY };
      };
      window.addEventListener("mousemove", onGlobalMove);
      (window as any)._onRglResizeMove = onGlobalMove;

      // Store initial state to determine anchor point
      resizeStateRef.current = {
        itemId: newItem.i,
        startX: newItem.x,
        startY: newItem.y,
        startW: newItem.w,
        startH: newItem.h,
      };
    }
  }, []);

  const handleResize = useCallback(
    (layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null, _placeholder: LayoutItem | null, event: Event) => {
      const meta = (event as any)?.nativeEvent || (event as any); // RGL sometimes nests it
      const handle = (event as any)?.handle || (newItem as any)?.handle || "se"; // Fallback to se if handle missing

      if (!resizeStateRef.current || !newItem || newItem.i !== resizeStateRef.current.itemId || !width || !containerRef.current) {
        onLayoutChange?.(layout);
        return;
      }

      const clientX = meta?.clientX ?? lastMousePosRef.current.x;
      const clientY = meta?.clientY ?? lastMousePosRef.current.y;

      const rect = containerRef.current.getBoundingClientRect();
      const colWidth = (width - margin * (columns + 1)) / columns;
      const unitW = colWidth + margin;
      const unitH = ROW_HEIGHT + margin;

      const mouseCol = Math.round((clientX - rect.left - margin) / unitW);
      const mouseRow = Math.round((clientY - rect.top - margin) / unitH);

      const start = resizeStateRef.current;
      
      // Determine Anchor Point based on handle
      // Anchor is the corner/side that stays FIXED during resize
      let anchorX = start.startX;
      let anchorY = start.startY;

      if (handle.includes("e")) anchorX = start.startX;
      else if (handle.includes("w")) anchorX = start.startX + start.startW;
      
      if (handle.includes("s")) anchorY = start.startY;
      else if (handle.includes("n")) anchorY = start.startY + start.startH;

      // Calculate new bounds
      let finalX = newItem.x;
      let finalY = newItem.y;
      let finalW = newItem.w;
      let finalH = newItem.h;

      // Update Horizontal
      if (handle.includes("e") || handle.includes("w")) {
        finalX = Math.min(mouseCol, anchorX);
        finalW = Math.max(1, Math.abs(mouseCol - anchorX));
      }

      // Update Vertical
      if (handle.includes("s") || handle.includes("n")) {
        finalY = Math.min(mouseRow, anchorY);
        finalH = Math.max(1, Math.abs(mouseRow - anchorY));
      }

      // 🛑 BLOCK COLLISION during resize
      const hasCollision = layout.some(item => 
        item.i !== newItem.i && validateOverlap(item, { x: finalX, y: finalY, w: finalW, h: finalH })
      );

      if (hasCollision || (finalX === newItem.x && finalY === newItem.y && finalW === newItem.w && finalH === newItem.h)) {
        onLayoutChange?.(layout);
        return;
      }

      const updatedLayout = layout.map((item) => {
        if (item.i === newItem.i) {
          return { ...item, x: finalX, y: finalY, w: finalW, h: finalH };
        }
        return item;
      });

      onLayoutChange?.(updatedLayout);
    },
    [onLayoutChange, width, columns, margin, validateOverlap]
  );

  const handleDrag = useCallback(
    (currentLayout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null, _placeholder: LayoutItem | null, _event: Event) => {
      if (!newItem) return;

      // 🛑 BLOCK COLLISION during drag
      const hasCollision = currentLayout.some((item) => item.i !== newItem.i && validateOverlap(item, newItem));

      if (hasCollision) {
        // If colliding, don't trigger layout change
        return;
      }

      onLayoutChange?.(currentLayout);
    },
    [onLayoutChange, validateOverlap],
  );

  const handleResizeStop = useCallback((layout: Layout) => {
    resizeStateRef.current = null;
    const onGlobalMove = (window as any)._onRglResizeMove;
    if (onGlobalMove) {
      window.removeEventListener("mousemove", onGlobalMove);
      delete (window as any)._onRglResizeMove;
    }
    onLayoutChange?.(layout);
  }, [onLayoutChange]);

  return (
    // Scrollable wrapper — overflow is here, NOT on the grid container
    <div className="w-full h-full overflow-auto" style={{ backgroundColor }}>
      {/* Grid container: must be position:relative and wide enough — NO overflow here */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: canvasMinHeight }}
      >
        {mounted && (
          <GridLayout
            layout={layout}
            width={width}
            gridConfig={{
              cols: columns,
              rowHeight: ROW_HEIGHT,
              margin: [margin, margin] as readonly [number, number],
              containerPadding: [margin, margin] as readonly [number, number],
              maxRows: Infinity,
            }}
            dragConfig={{
              enabled: isEditMode,
              bounded: false,
              handle: ".drag-handle",
              threshold: 3,
            }}
            resizeConfig={{
              enabled: isEditMode,
              handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] as readonly any[],
            }}
            compactor={{
              type: null, // No vertical compaction (don't snap to y=0)
              allowOverlap: false, // Don't allow overlap
              preventCollision: true, // Block instead of push
              compact: (l) => l,
            }}
            positionStrategy={absolutePositionStrategy} // Use Top/Left for better stability
            onDrag={handleDrag}
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            onLayoutChange={onLayoutChange}
            autoSize={false}
            style={{ minHeight: canvasMinHeight }}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <WidgetTile widget={widget} isEditMode={isEditMode} />
              </div>
            ))}
          </GridLayout>
        )}

        {/* Grid line overlay — painted as CSS grid on the same layer */}
        {isEditMode && mounted && (
          <style>{`
            .react-grid-layout {
              background-image:
                linear-gradient(rgba(100, 130, 200, 0.13) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100, 130, 200, 0.13) 1px, transparent 1px);
              background-size:
                calc((${width}px - ${margin * 2}px) / ${columns}) ${ROW_HEIGHT + margin}px;
              background-position: ${margin}px ${margin}px;
            }
            .react-grid-item.react-grid-placeholder {
              background: rgba(33, 150, 243, 0.18) !important;
              border: 2px dashed #2196f3 !important;
              border-radius: 6px;
              opacity: 0.9;
              transition: none !important;
            }
            /* Hide transitions in edit mode */
            .react-grid-item {
               transition: none !important;
            }
            .react-resizable-handle {
              position: absolute;
              width: 12px;
              height: 12px;
              z-index: 10;
              opacity: 0;
              transition: opacity 0.2s;
            }
            .react-grid-item:hover .react-resizable-handle {
              opacity: 1;
            }
            .react-resizable-handle::after {
              content: "";
              position: absolute;
              width: 6px;
              height: 6px;
              background: #2196f3;
              border-radius: 50%;
              left: 3px;
              top: 3px;
            }
            .react-resizable-handle-se { bottom: 0; right: 0; cursor: se-resize; }
            .react-resizable-handle-sw { bottom: 0; left: 0; cursor: sw-resize; }
            .react-resizable-handle-nw { top: 0; left: 0; cursor: nw-resize; }
            .react-resizable-handle-ne { top: 0; right: 0; cursor: ne-resize; }
            .react-resizable-handle-w { left: 0; top: 50%; margin-top: -6px; cursor: w-resize; }
            .react-resizable-handle-e { right: 0; top: 50%; margin-top: -6px; cursor: e-resize; }
            .react-resizable-handle-n { top: 0; left: 50%; margin-left: -6px; cursor: n-resize; }
            .react-resizable-handle-s { bottom: 0; left: 50%; margin-left: -6px; cursor: s-resize; }
            
            .react-resizable-handle-se::after { border-radius: 0; width: 8px; height: 8px; background: transparent; border-right: 2px solid #2196f3; border-bottom: 2px solid #2196f3; left: auto; top: auto; right: 2px; bottom: 2px; }
          `}</style>
        )}
      </div>
    </div>
  );
}
