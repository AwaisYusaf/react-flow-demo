import { create } from "zustand";
import { WIREFRAMES, PAGE_GROUPS } from "@/lib/constants";

interface CanvasState {
  groups: TGroup[];
  draggedGroup: string | null;
  isDraggingWireframe: boolean;
  setGroups: (groups: TGroup[]) => void;
  updateGroupWireframes: (groupId: string, new_wireframes: string[]) => void;
  setDraggedGroup: (groupId: string | null) => void;
  setIsDraggingWireframe: (isDragging: boolean) => void;
  updateGroupPosition: (groupId: string, x: number, y: number) => void;
}

export const useCanvasStore = create<CanvasState>()((set) => ({
  groups: PAGE_GROUPS,
  draggedGroup: null,
  isDraggingWireframe: false,
  setGroups: (groups: TGroup[]) => set({ groups }),

  updateGroupWireframes: (groupId: string, new_wireframes: string[]) =>
    set((state: CanvasState) => ({
      groups: state.groups.map((group: TGroup) =>
        group.id === groupId
          ? { ...group, wireframeIds: new_wireframes }
          : group
      ),
    })),

  setDraggedGroup: (groupId: string | null) => set({ draggedGroup: groupId }),

  setIsDraggingWireframe: (isDragging: boolean) =>
    set({ isDraggingWireframe: isDragging }),

  updateGroupPosition: (groupId: string, x: number, y: number) =>
    set((state: CanvasState) => ({
      groups: state.groups.map((group: TGroup) =>
        group.id === groupId ? { ...group, position: { x, y } } : group
      ),
    })),
}));
