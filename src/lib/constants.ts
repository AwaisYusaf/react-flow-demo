import { DESKTOP_VIEW_HTML, MOBILE_VIEW_HTML } from "./iframe.constant";
import type { TGroup, TWireframe } from "./types";

export const PAGE_GROUPS: TGroup[] = [
  {
    id: "096813f7-a5fb-4bf5-9ad7-5b24d1e33f69",
    title: "Group 1",
    pageId: "1",
    wireframeIds: [
      "da5d9929-7aa5-40e1-9c67-2fdc9635720a",
      "6d4a2d98-afa5-45e1-837c-59c16f637643",
      "f038cd9e-e8ca-4ebb-9625-197ce5329ce5",
      "a581c9c8-3331-49ef-92e6-0903eecb8e84",
    ],
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: "1a2a6d87-118c-48e0-b8b2-6b841efce4cc",
    title: "Group 2",
    pageId: "1",
    wireframeIds: [
      "93fc3494-8098-4b6f-bd2d-361123f46bef",
      "ea2da4bf-eed6-4bda-8c81-6e0a6785bb5b",
      "b01cca80-7529-4b5c-96e6-db0a4afc9ab9",
      "740145b1-a7d3-4cb7-a2fc-352bfeef5e3b",
    ],
    position: {
      x: 0,
      y: 1000,
    },
  },
];

export const WIREFRAMES: TWireframe[] = [
  {
    id: "da5d9929-7aa5-40e1-9c67-2fdc9635720a",
    title: "Wireframe 1",
    image: "/wireframe1.png",
    dimensions: {
      width: 1024,
      height: 840,
    },
    type: "desktop",
    _html: DESKTOP_VIEW_HTML,
  },
  {
    id: "6d4a2d98-afa5-45e1-837c-59c16f637643",

    title: "Wireframe 2",
    image: "/wireframe2.png",
    dimensions: {
      width: 1024,
      height: 840,
    },
    type: "desktop",
    _html: DESKTOP_VIEW_HTML,
  },
  {
    id: "f038cd9e-e8ca-4ebb-9625-197ce5329ce5",
    title: "Wireframe 3",
    image: "/wireframe2.png",
    dimensions: {
      width: 1024,
      height: 840,
    },
    type: "desktop",
    _html: DESKTOP_VIEW_HTML,
  },
  {
    id: "a581c9c8-3331-49ef-92e6-0903eecb8e84",
    title: "Wireframe 4",
    image: "/wireframe3.png",
    dimensions: {
      width: 840,
      height: 1080,
    },
    type: "mobile",
    _html: MOBILE_VIEW_HTML,
  },
  {
    id: "93fc3494-8098-4b6f-bd2d-361123f46bef",
    title: "Wireframe 5",
    image: "/wireframe3.png",
    dimensions: {
      width: 840,
      height: 1080,
    },
    type: "mobile",
    _html: MOBILE_VIEW_HTML,
  },
  {
    id: "ea2da4bf-eed6-4bda-8c81-6e0a6785bb5b",
    title: "Wireframe 6",
    image: "/wireframe3.png",
    dimensions: {
      width: 840,
      height: 1080,
    },
    type: "mobile",
    _html: MOBILE_VIEW_HTML,
  },
  {
    id: "b01cca80-7529-4b5c-96e6-db0a4afc9ab9",
    title: "Wireframe 7",
    image: "/wireframe3.png",
    dimensions: {
      width: 840,
      height: 1080,
    },
    type: "mobile",
    _html: MOBILE_VIEW_HTML,
  },
  {
    id: "740145b1-a7d3-4cb7-a2fc-352bfeef5e3b",
    title: "Wireframe 8",
    image: "/wireframe3.png",
    dimensions: {
      width: 840,
      height: 1080,
    },
    type: "mobile",
    _html: MOBILE_VIEW_HTML,
  },
];

export const getWireframe = (id: string) => {
  return WIREFRAMES.find((wireframe) => wireframe.id === id);
};
