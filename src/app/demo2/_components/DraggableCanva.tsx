"use client";

import React, { useState, useRef, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";

interface Node {
  id: string;
  text: string;
}

interface Group {
  id: string;
  name: string;
  nodes: Node[];
  position: {
    x: number;
    y: number;
  };
}

const initialGroups: Group[] = [
  {
    id: "group1",
    name: "Group A",
    nodes: [
      { id: "1", text: "Node 1" },
      { id: "2", text: "Node 2" },
      { id: "3", text: "Node 3" },
    ],
    position: { x: 20, y: 20 },
  },
  {
    id: "group2",
    name: "Group B",
    nodes: [
      { id: "4", text: "Node 4" },
      { id: "5", text: "Node 5" },
      { id: "6", text: "Node 6" },
    ],
    position: { x: 20, y: 200 },
  },
];

interface DragState {
  groupId: string;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

function DraggableCanva() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const isDraggingNode = useRef(false);

  const updateGroupNodes = (groupId: string, newNodes: Node[]) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, nodes: newNodes } : group
      )
    );
  };

  const clearDragState = () => {
    setDraggedGroup(null);
    dragStateRef.current = null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current || isDraggingNode.current) return;

      const { groupId, initialX, initialY, offsetX, offsetY } =
        dragStateRef.current;
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                position: {
                  x: newX,
                  y: newY,
                },
              }
            : group
        )
      );
    };

    const handleMouseUp = () => {
      if (dragStateRef.current && !isDraggingNode.current) {
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
  }, [draggedGroup]);

  const handleMouseDown = (e: React.MouseEvent, groupId: string) => {
    // Prevent group dragging if clicking on a sortable node
    if ((e.target as HTMLElement).closest(".sortable-item")) {
      isDraggingNode.current = true;
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
    <div className="relative w-full h-[calc(100vh-4rem)] p-4 overflow-hidden bg-gray-100">
      {groups.map((group) => (
        <div
          key={group.id}
          className="fixed border rounded-lg p-4 bg-white shadow-lg select-none"
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
            <h3 className="text-lg font-semibold">{group.name}</h3>
          </div>
          <ReactSortable
            list={group.nodes}
            setList={(newNodes) => updateGroupNodes(group.id, newNodes)}
            group="shared"
            className="flex gap-4"
            onStart={() => {
              isDraggingNode.current = true;
              clearDragState();
            }}
            onEnd={() => {
              isDraggingNode.current = false;
            }}
          >
            {group.nodes.map((node) => (
              <div
                key={node.id}
                className="bg-white border rounded-md p-4 cursor-move shadow-sm hover:shadow-md sortable-item"
              >
                {node.text}
              </div>
            ))}
          </ReactSortable>
        </div>
      ))}
    </div>
  );
}

export default DraggableCanva;
