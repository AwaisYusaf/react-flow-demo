export interface TWireframe {
  id: string;
  title: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  type: "desktop" | "mobile";
  _html: string;
}

export interface TGroup {
  id: string;
  title: string;
  pageId: string;
  wireframeIds: string[];
  position: {
    x: number;
    y: number;
  };
}
