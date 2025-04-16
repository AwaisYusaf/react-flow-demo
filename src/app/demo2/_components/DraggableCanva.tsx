"use client";

import React, { useRef, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import { useCanvasStore } from "@/app/demo2/_store/useCanvasStore";
import { getWireframe } from "@/lib/constants";
import WireframeCard from "./WireframeCard";

interface DragState {
  groupId: string;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

function DraggableCanva() {
  const {
    groups,
    draggedGroup,
    isDraggingWireframe,
    updateGroupWireframes,
    setDraggedGroup,
    setIsDraggingWireframe,
    updateGroupPosition,
  } = useCanvasStore();

  const dragStateRef = useRef<DragState | null>(null);

  const clearDragState = () => {
    setDraggedGroup(null);
    dragStateRef.current = null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current || isDraggingWireframe) return;

      const { groupId, offsetX, offsetY } = dragStateRef.current;
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      updateGroupPosition(groupId, newX, newY);
    };

    const handleMouseUp = () => {
      if (dragStateRef.current && !isDraggingWireframe) {
        clearDragState();
      }
    };

    if (draggedGroup) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedGroup, isDraggingWireframe, updateGroupPosition]);

  const handleMouseDown = (e: React.MouseEvent, groupId: string) => {
    if ((e.target as HTMLElement).closest(".sortable-item")) {
      setIsDraggingWireframe(true);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragStateRef.current = {
      groupId,
      initialX: e.clientX,
      initialY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setDraggedGroup(groupId);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] p-4 overflow-hidden bg-gray-50">
      {groups.map((group) => (
        <div
          key={group.id}
          className="fixed border rounded-lg p-4 shadow-lg select-none"
          style={{
            left: `${group.position.x}px`,
            top: `${group.position.y}px`,
            cursor: draggedGroup === group.id ? "grabbing" : "grab",
            zIndex: draggedGroup === group.id ? 10 : 1,
            minWidth: "300px",
            margin: 0,
            padding: "1rem",
            userSelect: "none",
          }}
          onMouseDown={(e) => handleMouseDown(e, group.id)}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">{group.title}</h3>
          </div>
          <ReactSortable
            list={group.wireframeIds.map((id) => ({ id }))}
            setList={(newNodes) =>
              updateGroupWireframes(
                group.id,
                newNodes.map((n) => n.id)
              )
            }
            group="shared"
            className="flex gap-8"
            onStart={() => {
              setIsDraggingWireframe(true);
              clearDragState();
            }}
            onEnd={() => {
              setIsDraggingWireframe(false);
            }}
          >
            {group.wireframeIds.map((wId, index) => (
              <WireframeCard
                key={wId + index}
                data={getWireframe(wId) as TWireframe}
              />
            ))}
          </ReactSortable>
        </div>
      ))}
    </div>
  );
}

export default DraggableCanva;
