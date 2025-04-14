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
