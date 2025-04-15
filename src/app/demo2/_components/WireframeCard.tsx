import { Handle, Position } from "@xyflow/react";
import Image from "next/image";
import { useRef } from "react";

interface CustomNodeProps {
  data: {
    label: string;
    imageUrl: string;
    wireframe: TWireframe;
  };
}

export default function WireframeCard({ data }: CustomNodeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wireframe = data.wireframe;
  // console.log("Wireframe", wireframe);

  const mobileView = false;

  const handleIframeLoad = () => {
    const iframeElement = iframeRef.current;
    if (!iframeElement) return;
    const iframeContentWindow = iframeElement.contentWindow;
    // iframeContentWindow.addEventListener("wheel", {
    //   passive: false,
    // })

    // iframeContentWindow.addEventListener("dblclick", () => {
    //   setIsInteractive(false)
    // })

    try {
      const body = iframeContentWindow?.document.body;
      const htmlElement = iframeContentWindow?.document.documentElement;
      const contentHeight = Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        htmlElement?.clientHeight || 0,
        htmlElement?.scrollHeight || 0,
        htmlElement?.offsetHeight || 0
      );

      const minHeight = mobileView ? 844 : 1024;
      const finalHeight = Math.max(contentHeight, minHeight);

      // setIframeHeight(finalHeight + 5)
      // refreshWireframes()
      // iframeRef.current.style.height = `${finalHeight + 5}px`

      // identifyMainSections()
    } catch (error) {
      console.warn(
        "Error accessing iframe content or adding event listeners:",
        error
      );
    }
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <div className="flex flex-col items-center relative">
        <div>
          <h2>{data.label}</h2>
        </div>

        {wireframe && wireframe._html && (
          <iframe
            title={`wireframe-${data.label}`}
            srcDoc={wireframe._html}
            frameBorder="0"
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="overflow-hidden"
            style={{
              height: wireframe.dimensions.height,
              width: wireframe.dimensions.width,
              overflow: "hidden",
              zIndex: 10,
              // border: showBackgroundStack ? "2px solid #3F20FC" : "",
            }}
          />
        )}

        {/* Overlay to prevent interaction with iframe */}
        <div
          className="absolute inset-0 z-20"
          style={{
            width: wireframe?.dimensions.width,
            height: wireframe?.dimensions.height,
            // cursor: 'pointer',
          }}
          onClick={(e) => {
            // Prevent event propagation to iframe
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}
