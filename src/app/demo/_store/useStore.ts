import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from "@xyflow/react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  highlightedGroup: string | null;
  selectedNodes: string[];
  setNodes: (nodes: Node[]) => void;
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
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  highlightGroup: (groupId: string | null) => {
    set({ highlightedGroup: groupId });
  },

  setSelectedNodes: (nodeIds: string[]) => {
    set({ selectedNodes: nodeIds });
  },

  moveNodeToGroup: (nodeId: string, targetGroupId: string) => {
    set((state) => {
      const nodes = [...state.nodes];
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

      return { nodes };
    });
  },

  updateGroupSize: (groupId: string) => {
    set((state) => {
      const nodes = [...state.nodes];
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
        return { nodes };
      }

      const nodeWidth = 200;
      const nodeHeight = 150;
      const padding = 20;

      const newWidth = Math.max(
        400,
        groupNodes.length * (nodeWidth + padding) + padding
      );
      const newHeight = Math.max(200, nodeHeight + padding * 2);

      nodes[groupIndex] = {
        ...nodes[groupIndex],
        style: {
          ...nodes[groupIndex].style,
          width: newWidth,
          height: newHeight,
        },
      };

      groupNodes.forEach((node, index) => {
        const nodeIndex = nodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            position: {
              x: padding + index * (nodeWidth + padding),
              y: padding,
            },
          };
        }
      });

      return { nodes };
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
