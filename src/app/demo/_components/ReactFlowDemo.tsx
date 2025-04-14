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
  } = useStore();
  const { getIntersectingNodes } = useReactFlow();
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadReactFlowTree();
  }, [loadReactFlowTree]);

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
