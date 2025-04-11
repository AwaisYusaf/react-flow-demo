"use client";
import React, { useEffect, useCallback, useState } from "react";
import {
  Background,
  Panel,
  ReactFlow,
  BackgroundVariant,
  Node,
  Edge,
  OnSelectionChangeParams,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import { useStore } from "../_store/useStore";
import { SAMPLE_WIREFRAMES, TWireframe } from "@/constants";
import type { NodeData } from "../_store/useStore";

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: "group-1",
    type: "group",
    position: { x: 0, y: 0 },
    style: {
      width: 400,
      height: 200,
      backgroundColor: "transparent",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      transition: "all 0.3s ease",
    },
    data: { label: "Group 1", wireframe: SAMPLE_WIREFRAMES[0] as TWireframe },
  },
  {
    id: "1",
    type: "custom",
    position: { x: 50, y: 50 },
    parentId: "group-1",
    data: {
      label: "Screen 1",
      imageUrl: "/sample-image.jpg",
      wireframe: SAMPLE_WIREFRAMES[2] as TWireframe,
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 250, y: 50 },
    parentId: "group-1",
    data: {
      label: "Screen 2",
      imageUrl: "/sample-image.jpg",
      wireframe: SAMPLE_WIREFRAMES[1] as TWireframe,
    },
  },
  {
    id: "group-2",
    type: "group",
    position: { x: 2500, y: 0 },
    style: {
      width: 400,
      height: 200,
      backgroundColor: "transparent",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      transition: "all 0.3s ease",
    },
    data: { label: "Group 2" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 50, y: 50 },
    parentId: "group-2",
    data: {
      label: "Screen 3",
      imageUrl: "/sample-image.jpg",
      wireframe: SAMPLE_WIREFRAMES[2] as TWireframe,
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 250, y: 50 },
    parentId: "group-2",
    data: {
      label: "Screen 4",
      imageUrl: "/sample-image.jpg",
      wireframe: SAMPLE_WIREFRAMES[1] as TWireframe,
    },
  },
];

export default function ReactFlowDemo() {
  const {
    nodes,
    setNodes,
    onNodesChange,
    moveNodeToGroup,
    updateGroupSize,
    highlightGroup,
    setSelectedNodes,
    selectedNodes,
    exportSelectedNodes,
  } = useStore();
  const { getIntersectingNodes } = useReactFlow();
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const groupNodes = initialNodes.filter((node) => node.type === "group");

    const nonGroupNodes = initialNodes.filter((node) => node.type !== "group");

    const groupChildrenMap = new Map();

    nonGroupNodes.forEach((node) => {
      if (node.parentId) {
        if (!groupChildrenMap.has(node.parentId)) {
          groupChildrenMap.set(node.parentId, []);
        }
        groupChildrenMap.get(node.parentId).push(node);
      }
    });

    // Process each group to calculate dimensions based on its children
    const processedNodes = initialNodes.map((node) => {
      if (node.type === "group") {
        const children = groupChildrenMap.get(node.id) || [];

        // Calculate max height and sum of widths
        let maxHeight = 0;
        let totalWidth = 0;
        const padding = 20; // Padding between nodes

        children.forEach((child: Node) => {
          const childHeight =
            ((child.data.wireframe as TWireframe).dimensions.height as number) +
            2 * padding;
          const childWidth =
            ((child.data.wireframe as TWireframe).dimensions.width as number) +
            padding;

          maxHeight = Math.max(maxHeight, childHeight);
          totalWidth += childWidth;
        });

        // Add padding to the group dimensions
        const groupPadding = 40;
        const groupHeight = maxHeight + groupPadding;
        const groupWidth = totalWidth + groupPadding;

        // Update group node with calculated dimensions
        return {
          ...node,
          style: {
            ...node.style,
            width: Math.max(groupWidth, 400), // Minimum width of 400
            height: Math.max(groupHeight, 200), // Minimum height of 200
          },
        };
      }
      return node;
    });

    setNodes(processedNodes as Node<NodeData>[]);
  }, [setNodes]);

  const onNodeDrag = useCallback(
    (event: any, node: Node) => {
      const intersectingNodes = getIntersectingNodes(node);
      const targetGroup = intersectingNodes.find(
        (n) => n.type === "group" && n.id !== node.parentId
      );

      highlightGroup(targetGroup?.id || null);
    },
    [getIntersectingNodes, highlightGroup]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      const intersectingNodes = getIntersectingNodes(node);
      const targetGroup = intersectingNodes.find(
        (n) => n.type === "group" && n.id !== node.parentId
      );

      if (targetGroup) {
        moveNodeToGroup(node.id, targetGroup.id);
        updateGroupSize(node.parentId!);
        updateGroupSize(targetGroup.id);
      }

      highlightGroup(null);
    },
    [getIntersectingNodes, moveNodeToGroup, updateGroupSize, highlightGroup]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const selectedScreens = selectedNodes
        .filter((node) => node.type === "custom")
        .map((node) => node.id);
      setSelectedNodes(selectedScreens);
    },
    [setSelectedNodes]
  );

  const nodesWithStyles = nodes.map((node) => {
    if (node.type === "custom" && selectedNodes.includes(node.id)) {
      return {
        ...node,
        style: {
          ...node.style,
          border: "2px solid #3b82f6",
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
        },
      };
    }
    if (node.type === "group") {
      const isHighlighted = node.id === useStore.getState().highlightedGroup;
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: isHighlighted
            ? "rgba(59, 130, 246, 0.1)"
            : "transparent",
          border: isHighlighted ? "2px solid #3b82f6" : "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          transition: "all 0.3s ease",
        },
      };
    }
    return node;
  });

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodesWithStyles}
        edges={[]}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={10}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        selectionOnDrag
        selectNodesOnDrag
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Panel
          position="top-right"
          style={{ display: "flex", gap: "1rem", alignItems: "start" }}
        >
          {selectedNodes.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors"
              >
                Export Selected ({selectedNodes.length})
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded shadow-lg border border-gray-200 py-2 min-w-[150px]">
                  <button
                    onClick={() => {
                      exportSelectedNodes("pdf");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      exportSelectedNodes("image");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    Export as Image
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Instructions</h3>
            <ul className="text-sm">
              <li>• Drag screens between groups</li>
              <li>• Select multiple screens with Shift + Click</li>
              <li>• Or drag to select multiple screens</li>
              <li>• Click Export to download as PDF or Image</li>
            </ul>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
