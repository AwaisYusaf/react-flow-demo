import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { TWireframe } from "@/constants";

export interface NodeData extends Record<string, unknown> {
  label: string;
  imageUrl?: string;
  wireframe?: TWireframe;
}

interface StoreState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  highlightedGroup: string | null;
  selectedNodes: string[];
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  moveNodeToGroup: (nodeId: string, targetGroupId: string) => void;
  updateGroupSize: (groupId: string) => void;
  highlightGroup: (groupId: string | null) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  exportSelectedNodes: (format: "pdf" | "image") => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  highlightedGroup: null,
  selectedNodes: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) =>
    set((state) => ({
      ...state,
      nodes: applyNodeChanges(changes, state.nodes) as Node<NodeData>[],
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      ...state,
      edges: applyEdgeChanges(changes, state.edges),
    })),

  highlightGroup: (groupId: string | null) => {
    set({ highlightedGroup: groupId });
  },

  setSelectedNodes: (nodeIds: string[]) => {
    set({ selectedNodes: nodeIds });
  },

  moveNodeToGroup: (nodeId: string, targetGroupId: string) => {
    set((state) => {
      const nodes = [...state.nodes] as Node<NodeData>[];
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
      const targetGroupIndex = nodes.findIndex((n) => n.id === targetGroupId);

      if (nodeIndex === -1 || targetGroupIndex === -1) return state;

      const targetGroupNodes = nodes.filter(
        (n) => n.parentId === targetGroupId
      );
      const nodeWidth = 200;
      const padding = 20;

      const newPosition = {
        x: padding + targetGroupNodes.length * (nodeWidth + padding),
        y: padding,
      };

      nodes[nodeIndex] = {
        ...nodes[nodeIndex],
        parentId: targetGroupId,
        position: newPosition,
      };

      return { ...state, nodes };
    });
  },

  updateGroupSize: (groupId: string) => {
    set((state) => {
      const nodes = [...state.nodes] as Node<NodeData>[];
      const groupIndex = nodes.findIndex((n) => n.id === groupId);

      if (groupIndex === -1) return state;

      const groupNodes = nodes.filter((n) => n.parentId === groupId);

      if (groupNodes.length === 0) {
        nodes[groupIndex] = {
          ...nodes[groupIndex],
          style: {
            ...nodes[groupIndex].style,
            width: 400,
            height: 200,
          },
        };
        return { ...state, nodes };
      }

      const padding = 20;
      let totalWidth = padding; // Start with initial padding
      let maxHeight = 0;

      // First pass: calculate total width and max height
      groupNodes.forEach((node) => {
        const wireframe = node.data?.wireframe;
        const nodeWidth = wireframe?.dimensions?.width || 200;
        const nodeHeight = wireframe?.dimensions?.height || 150;

        totalWidth += nodeWidth + padding; // Add node width and spacing
        maxHeight = Math.max(maxHeight, nodeHeight);
      });

      // Add final padding to total width
      totalWidth += padding;

      // Add padding to height for top and bottom
      const totalHeight = maxHeight + padding * 2;

      // Ensure minimum dimensions
      const newWidth = Math.max(400, totalWidth);
      const newHeight = Math.max(200, totalHeight);

      nodes[groupIndex] = {
        ...nodes[groupIndex],
        style: {
          ...nodes[groupIndex].style,
          width: newWidth,
          height: newHeight,
        },
      };

      // Second pass: update node positions
      let currentX = padding;
      groupNodes.forEach((node) => {
        const nodeIndex = nodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
          const wireframe = node.data?.wireframe;
          const nodeWidth = wireframe?.dimensions?.width || 200;

          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            position: {
              x: currentX,
              y: padding, // Center vertically if needed: (newHeight - nodeHeight) / 2
            },
          };

          currentX += nodeWidth + padding;
        }
      });

      return { ...state, nodes };
    });
  },

  exportSelectedNodes: async (format: "pdf" | "image") => {
    const state = get();
    const selectedNodeIds = state.selectedNodes;

    if (selectedNodeIds.length === 0) return;

    try {
      const reactFlowWrapper = document.querySelector(".react-flow");
      if (!reactFlowWrapper) {
        throw new Error("React Flow wrapper not found");
      }

      const nodeElements: HTMLElement[] = [];
      selectedNodeIds.forEach((id) => {
        const element = reactFlowWrapper.querySelector(
          `.react-flow__node[data-id="${id}"]`
        );
        if (element) {
          nodeElements.push(element as HTMLElement);
        }
      });

      if (nodeElements.length === 0) {
        throw new Error("No selected nodes found in the DOM");
      }

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "fit-content";
      container.style.height = "fit-content";
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(2, 1fr)";
      container.style.gap = "20px";
      container.style.padding = "20px";
      document.body.appendChild(container);

      nodeElements.forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.style.transform = "none";
        clone.style.position = "static";
        clone.style.left = "auto";
        clone.style.top = "auto";
        clone.classList.remove("react-flow__node");
        clone.removeAttribute("data-id");
        container.appendChild(clone);
      });

      // Convert to canvas
      const canvas = await html2canvas(container, {
        logging: true,
        useCORS: true,
        allowTaint: true,
      });

      if (format === "image") {
        const link = document.createElement("a");
        link.download = "exported-screens.png";
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(
          canvas.toDataURL("image/png", 1.0),
          "PNG",
          0,
          0,
          canvas.width,
          canvas.height
        );

        pdf.save("exported-screens.pdf");
      }

      // Clean up
      document.body.removeChild(container);
    } catch (error: any) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message || "Unknown error"}`);
    }
  },
}));
