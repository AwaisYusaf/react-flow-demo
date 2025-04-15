import { create } from "zustand";
import type { StateCreator } from "zustand";

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

interface CanvasState {
  groups: Group[];
  draggedGroup: string | null;
  isDraggingNode: boolean;
  setGroups: (groups: Group[]) => void;
  updateGroupNodes: (groupId: string, newNodes: Node[]) => void;
  setDraggedGroup: (groupId: string | null) => void;
  setIsDraggingNode: (isDragging: boolean) => void;
  updateGroupPosition: (groupId: string, x: number, y: number) => void;
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

export const useCanvasStore = create<CanvasState>()((set) => ({
  groups: initialGroups,
  draggedGroup: null,
  isDraggingNode: false,

  setGroups: (groups: Group[]) => set({ groups }),

  updateGroupNodes: (groupId: string, newNodes: Node[]) =>
    set((state: CanvasState) => ({
      groups: state.groups.map((group: Group) =>
        group.id === groupId ? { ...group, nodes: newNodes } : group
      ),
    })),

  setDraggedGroup: (groupId: string | null) => set({ draggedGroup: groupId }),

  setIsDraggingNode: (isDragging: boolean) =>
    set({ isDraggingNode: isDragging }),

  updateGroupPosition: (groupId: string, x: number, y: number) =>
    set((state: CanvasState) => ({
      groups: state.groups.map((group: Group) =>
        group.id === groupId ? { ...group, position: { x, y } } : group
      ),
    })),
}));
