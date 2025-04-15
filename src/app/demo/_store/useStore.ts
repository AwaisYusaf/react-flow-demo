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
import { getWireframe, PAGE_GROUPS } from "@/lib/constants";

export interface NodeData extends Record<string, unknown> {
  label: string;
  imageUrl?: string;
  wireframe: {
    dimensions: {
      width: number;
      height: number;
    };
  };
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
  loadReactFlowTree: () => void;
  reorderNodesInGroup: (nodeId: string, x: number) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  highlightedGroup: null,
  selectedNodes: [],

  loadReactFlowTree: () => {
    console.log("Loading React Flow Tree()...");
    let children: Node<NodeData>[] = [];
    let lastGroupPosition = {
      x: 0,
      y: 0,
    };

    let initialGroupNodes = PAGE_GROUPS.map((group) => {
      let maxHeight = 0;
      let maxWidth = 0;
      let previousX = 0;
      group.wireframeIds.forEach((wireframeId, childIndex) => {
        const wireframe = getWireframe(wireframeId);
        maxWidth = maxWidth + (wireframe?.dimensions.width || 0) + 50;
        maxHeight =
          Math.max(maxHeight, wireframe?.dimensions.height || 0) + 100;
        if (wireframe) {
          children.push({
            id: wireframeId,
            type: "custom",
            position: { x: previousX, y: 100 },
            data: { label: wireframe.title, wireframe },
            parentId: group.id,
          } satisfies TNode);
        }
        previousX = previousX + (wireframe?.dimensions.width || 0) + 50;
      });

      // lastGroupPosition.x = lastGroupPosition.x + maxWidth + 50;
      lastGroupPosition.y = lastGroupPosition.y + maxHeight + 100;

      return {
        id: group.id,
        type: "group",
        position: { x: lastGroupPosition.x, y: lastGroupPosition.y + 2000 },
        data: {
          label: group.title,
        },
        style: {
          width: maxWidth,
          height: maxHeight,
        },
      } satisfies TNode;
    });

    let initialNodes = [
      ...initialGroupNodes,
      ...children,
      // ...children.sort(
      //   (a, b) => (a.data.order as number) - (b.data.order as number)
      // ),
    ];

    let initialEdges: Edge[] = [];
    set({ nodes: initialNodes as Node<NodeData>[], edges: initialEdges });
  },

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
    console.log("moveNodeToGroup()...");
    set((state) => {
      const nodes = [...state.nodes] as Node<NodeData>[];
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);

      if (nodeIndex === -1) return state;

      const node = nodes[nodeIndex];
      const sourceGroupId = node.parentId;

      if (!sourceGroupId) return state;

      // Get nodes in target group
      const targetGroupNodes = nodes
        .filter((n) => n.parentId === targetGroupId)
        .sort((a, b) => a.position.x - b.position.x);

      // Calculate drop position relative to target group nodes
      const dropX = node.position.x;
      let insertX = 50;
      let insertIndex = 0;

      // Get the standard y position for the target group (100 if empty, or use existing node's y)
      const targetGroupY =
        targetGroupNodes.length > 0 ? targetGroupNodes[0].position.y : 100;

      if (targetGroupNodes.length === 0) {
        insertX = 50;
      } else {
        for (let i = 0; i < targetGroupNodes.length; i++) {
          const currentNode = targetGroupNodes[i];
          const currentNodeWidth =
            currentNode.data?.wireframe?.dimensions?.width || 200;
          const currentNodeRight = currentNode.position.x + currentNodeWidth;
          const currentNodeCenter =
            currentNode.position.x + currentNodeWidth / 2;

          if (dropX < currentNode.position.x) {
            insertX = currentNode.position.x - 50;
            insertIndex = i;
            break;
          }

          if (i === targetGroupNodes.length - 1) {
            insertX = currentNodeRight + 50;
            insertIndex = targetGroupNodes.length;
          } else {
            const nextNode = targetGroupNodes[i + 1];
            if (dropX >= currentNodeRight && dropX < nextNode.position.x) {
              insertX = dropX;
              insertIndex = i + 1;
              break;
            }
          }
        }
      }

      // Move node to target group with consistent y position
      nodes[nodeIndex] = {
        ...nodes[nodeIndex],
        parentId: targetGroupId,
        position: {
          x: insertX,
          y: targetGroupY,
        },
      };

      // Reposition nodes in target group after insertion point
      let currentX =
        insertX + (node.data?.wireframe?.dimensions?.width || 200) + 50;
      targetGroupNodes.slice(insertIndex).forEach((n) => {
        const idx = nodes.findIndex((node) => node.id === n.id);
        if (idx !== -1) {
          nodes[idx] = {
            ...nodes[idx],
            position: {
              x: currentX,
              y: targetGroupY,
            },
          };
          currentX += (n.data?.wireframe?.dimensions?.width || 200) + 50;
        }
      });

      // Get the standard y position for the source group
      const sourceGroupNodes = nodes
        .filter((n) => n.parentId === sourceGroupId && n.id !== nodeId)
        .sort((a, b) => a.position.x - b.position.x);

      const sourceGroupY =
        sourceGroupNodes.length > 0 ? sourceGroupNodes[0].position.y : 100;

      // Reposition nodes in source group
      currentX = 50;
      sourceGroupNodes.forEach((n) => {
        const idx = nodes.findIndex((node) => node.id === n.id);
        if (idx !== -1) {
          nodes[idx] = {
            ...nodes[idx],
            position: {
              x: currentX,
              y: sourceGroupY,
            },
          };
          currentX += (n.data?.wireframe?.dimensions?.width || 200) + 50;
        }
      });

      return { ...state, nodes };
    });
  },

  updateGroupSize: (groupId: string) => {
    console.log("updateGroupSize()...");
    set((state) => {
      const nodes = [...state.nodes] as Node<NodeData>[];
      const groupIndex = nodes.findIndex((n) => n.id === groupId);

      if (groupIndex === -1) return state;

      const groupNodes = nodes
        .filter((n) => n.parentId === groupId)
        .sort((a, b) => a.position.x - b.position.x);

      if (groupNodes.length === 0) {
        console.log("[CASE 1] groupNodes length is 0");
        nodes[groupIndex] = {
          ...nodes[groupIndex],
          style: {
            ...nodes[groupIndex].style,
            width: 200,
            height: 200,
          },
        };
        return { ...state, nodes };
      }
      console.log("[CASE 2] ...");

      const padding = 50;
      let maxWidth = padding;
      let maxHeight = 0;

      // Calculate max width and height without changing positions
      groupNodes.forEach((node) => {
        const wireframe = node.data?.wireframe;
        const nodeWidth = wireframe?.dimensions?.width || 200;
        const nodeHeight = wireframe?.dimensions?.height || 150;
        const nodeRight = node.position.x + nodeWidth;

        maxWidth = Math.max(maxWidth, nodeRight + padding);
        maxHeight = Math.max(maxHeight, nodeHeight);
      });

      // Update the group size
      nodes[groupIndex] = {
        ...nodes[groupIndex],
        style: {
          ...nodes[groupIndex].style,
          width: Math.max(maxWidth, 200),
          height: Math.max(maxHeight + padding * 2, 200),
        },
      };

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

  reorderNodesInGroup: (nodeId: string, x: number) => {
    console.log("reorderNodesInGroup()...");
    console.log("Node Id:", nodeId);
    console.log("X:", x);
    set((state) => {
      const nodes = [...state.nodes] as Node<NodeData>[];
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);

      if (nodeIndex === -1) return state;

      const node = nodes[nodeIndex];
      const groupId = node.parentId;

      if (!groupId) return state;

      const groupNodes = nodes
        .filter((n) => n.parentId === groupId)
        .sort((a, b) => a.position.x - b.position.x);

      const currentIndex = groupNodes.findIndex((n) => n.id === nodeId);
      if (currentIndex === -1) return state;

      const groupY = groupNodes[0].position.y;

      const nodeWidth = node.data?.wireframe?.dimensions?.width || 200;
      let targetX = Math.max(50, x);
      let insertIndex = 0;

      groupNodes.splice(currentIndex, 1);

      if (groupNodes.length === 0) {
        targetX = 50;
      } else {
        for (let i = 0; i < groupNodes.length; i++) {
          const currentNode = groupNodes[i];
          const currentNodeWidth =
            currentNode.data?.wireframe?.dimensions?.width || 200;
          const currentNodeRight = currentNode.position.x + currentNodeWidth;
          const currentNodeCenter =
            currentNode.position.x + currentNodeWidth / 2;

          const overlapStart = Math.max(x, currentNode.position.x);
          const overlapEnd = Math.min(x + nodeWidth, currentNodeRight);
          const overlapWidth = Math.max(0, overlapEnd - overlapStart);
          const overlapPercentage = overlapWidth / currentNodeWidth;

          if (overlapPercentage > 0.3) {
            if (x < currentNodeCenter) {
              targetX = Math.max(50, currentNode.position.x - nodeWidth - 50);
              insertIndex = i;
            } else {
              targetX = currentNodeRight + 50;
              insertIndex = i + 1;
            }
            break;
          } else if (x < currentNode.position.x) {
            targetX = Math.max(50, x);
            insertIndex = i;
            break;
          }

          if (i === groupNodes.length - 1) {
            targetX = currentNodeRight + 50;
            insertIndex = groupNodes.length;
          } else {
            const nextNode = groupNodes[i + 1];
            const gap = nextNode.position.x - currentNodeRight;

            if (x >= currentNodeRight && x < nextNode.position.x) {
              insertIndex = i + 1;
              if (gap >= 100) {
                targetX = Math.min(
                  nextNode.position.x - nodeWidth - 50,
                  Math.max(currentNodeRight + 50, x)
                );
              } else {
                targetX = currentNodeRight + 50;
              }
              break;
            }
          }
        }
      }

      nodes[nodeIndex] = {
        ...nodes[nodeIndex],
        position: {
          x: targetX,
          y: groupY,
        },
      };

      // Reposition other nodes with consistent y
      groupNodes.splice(insertIndex, 0, node);
      let currentX = 50;

      groupNodes.forEach((groupNode) => {
        if (groupNode.id === nodeId) {
          currentX = targetX + nodeWidth + 50;
        } else {
          const idx = nodes.findIndex((n) => n.id === groupNode.id);
          if (idx !== -1) {
            nodes[idx] = {
              ...nodes[idx],
              position: {
                x: currentX,
                y: groupY,
              },
            };
            currentX +=
              (groupNode.data?.wireframe?.dimensions?.width || 200) + 50;
          }
        }
      });

      return { ...state, nodes };
    });
  },
}));
