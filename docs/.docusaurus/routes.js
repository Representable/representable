import React from "react";
import ComponentCreator from "@docusaurus/ComponentCreator";

export default [
  {
    path: "/",
    component: ComponentCreator("/"),
    exact: true,
  },
  {
    path: "/blog",
    component: ComponentCreator("/blog"),
    exact: true,
  },
  {
    path: "/blog/hello-world",
    component: ComponentCreator("/blog/hello-world"),
    exact: true,
  },
  {
    path: "/blog/hola",
    component: ComponentCreator("/blog/hola"),
    exact: true,
  },
  {
    path: "/blog/tags",
    component: ComponentCreator("/blog/tags"),
    exact: true,
  },
  {
    path: "/blog/tags/docusaurus",
    component: ComponentCreator("/blog/tags/docusaurus"),
    exact: true,
  },
  {
    path: "/blog/tags/hello",
    component: ComponentCreator("/blog/tags/hello"),
    exact: true,
  },
  {
    path: "/blog/tags/hola",
    component: ComponentCreator("/blog/tags/hola"),
    exact: true,
  },
  {
    path: "/blog/welcome",
    component: ComponentCreator("/blog/welcome"),
    exact: true,
  },
  {
    path: "/docs",
    component: ComponentCreator("/docs"),
    exact: true,
  },
  {
    path: "/docs/:route",
    component: ComponentCreator("/docs/:route"),

    routes: [
      {
        path: "/docs/doc1",
        component: ComponentCreator("/docs/doc1"),
        exact: true,
      },
      {
        path: "/docs/doc2",
        component: ComponentCreator("/docs/doc2"),
        exact: true,
      },
      {
        path: "/docs/doc3",
        component: ComponentCreator("/docs/doc3"),
        exact: true,
      },
    ],
  },

  {
    path: "*",
    component: ComponentCreator("*"),
  },
];
