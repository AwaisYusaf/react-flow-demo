interface TGroup {
  id: string;
  title: string;
  pageId: string;
  wireframeIds: string[];
}

interface TWireframe {
  id: string;
  title: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  type: "mobile" | "desktop";
  _html: string;
}
interface TNode {
  id: string;
  type: "custom" | "group";
  data: {
    label: string;
    wireframe?: TWireframe;
  };
  position: {
    x: number;
    y: number;
  };
  parentId?: string;
  style?: {
    width?: number;
    height?: number;
  };
}
