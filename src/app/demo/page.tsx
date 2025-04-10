import React from "react";
import ReactFlowDemo from "./_components/ReactFlowDemo";
import { ReactFlowProvider } from "@xyflow/react";

type Props = {};

function Page({}: Props) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlowProvider>
        <ReactFlowDemo />
      </ReactFlowProvider>
    </div>
  );
}

export default Page;
