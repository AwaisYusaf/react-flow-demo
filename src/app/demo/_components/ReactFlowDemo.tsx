"use client";
import React, { useEffect, useCallback, useState } from "react";
import {
  Background,
  Panel,
  ReactFlow,
  BackgroundVariant,
  Node,
  OnSelectionChangeParams,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import DropIndicator from "./DropIndicator";
import { useStore } from "../_store/useStore";

const nodeTypes = {
  custom: CustomNode,
};

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
    loadReactFlowTree,
    reorderNodesInGroup,
  } = useStore();
  const { getIntersectingNodes, getNode } = useReactFlow();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    x: number;
    y: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    loadReactFlowTree();
  }, [loadReactFlowTree]);

  const findDropPosition = useCallback(
    (node: Node, x: number) => {
      const currentGroup = nodes.find((n) => n.id === node.parentId);
      if (!currentGroup) return null;

      const groupNodes = nodes
        .filter((n) => n.parentId === node.parentId && n.id !== node.id)
        .sort((a, b) => a.position.x - b.position.x);

      // If no other nodes in group, show indicator at x position
      if (groupNodes.length === 0) {
        return {
          x: Math.max(50, x), // Ensure minimum x of 50
          y: currentGroup.position.y + 50,
          height: (currentGroup.style?.height as number) - 100 || 740,
        };
      }

      // If before first node
      if (x < groupNodes[0].position.x) {
        return {
          x: Math.max(25, groupNodes[0].position.x - 25),
          y: currentGroup.position.y + 50,
          height: (currentGroup.style?.height as number) - 100 || 740,
        };
      }

      // If after last node
      const lastNode = groupNodes[groupNodes.length - 1];
      const lastNodeRight =
        lastNode.position.x +
        (lastNode.data?.wireframe?.dimensions?.width || 200);
      if (x > lastNodeRight) {
        return {
          x: lastNodeRight + 25,
          y: currentGroup.position.y + 50,
          height: (currentGroup.style?.height as number) - 100 || 740,
        };
      }

      // Find position between nodes
      for (let i = 0; i < groupNodes.length - 1; i++) {
        const curr = groupNodes[i];
        const next = groupNodes[i + 1];
        const currRight =
          curr.position.x + (curr.data?.wireframe?.dimensions?.width || 200);

        if (x > currRight && x < next.position.x) {
          return {
            x: currRight + (next.position.x - currRight) / 2,
            y: currentGroup.position.y + 50,
            height: (currentGroup.style?.height as number) - 100 || 740,
          };
        }
      }

      return null;
    },
    [nodes]
  );

  const onNodeDrag = useCallback(
    (event: any, node: Node) => {
      const intersectingNodes = getIntersectingNodes(node);
      const relevantNodes = intersectingNodes.filter((n) => n.id !== node.id);

      const targetGroup = relevantNodes.find(
        (n) => n.type === "group" && n.id !== node.parentId
      );

      if (targetGroup) {
        highlightGroup(targetGroup.id);
        setDropIndicator(null);
      } else if (node.parentId) {
        highlightGroup(null);
        // Use node's current drag position for drop indicator
        const dropPos = findDropPosition(node, event.clientX);
        setDropIndicator(dropPos);
      }
    },
    [getIntersectingNodes, highlightGroup, findDropPosition]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      const intersectingNodes = getIntersectingNodes(node);
      const relevantNodes = intersectingNodes.filter((n) => n.id !== node.id);

      const targetGroup = relevantNodes.find(
        (n) => n.type === "group" && n.id !== node.parentId
      );

      if (targetGroup) {
        moveNodeToGroup(node.id, targetGroup.id);
        if (node.parentId) {
          updateGroupSize(node.parentId);
        }
        updateGroupSize(targetGroup.id);
      } else if (node.parentId) {
        reorderNodesInGroup(node.id, node.position.x);
        updateGroupSize(node.parentId);
      }

      highlightGroup(null);
      setDropIndicator(null);
    },
    [
      getIntersectingNodes,
      moveNodeToGroup,
      updateGroupSize,
      highlightGroup,
      reorderNodesInGroup,
    ]
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
        snapToGrid={false}
        snapGrid={[1, 1]}
        nodesDraggable={true}
        preventScrolling={true}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        {dropIndicator && (
          <DropIndicator
            x={dropIndicator.x}
            y={dropIndicator.y}
            height={dropIndicator.height}
          />
        )}
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
