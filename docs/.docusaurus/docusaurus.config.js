export default {
  plugins: [],
  themes: [],
  customFields: {},
  themeConfig: {
    navbar: {
      title: "Representable",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      links: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          to: "blog/",
          label: "Blog",
          position: "left",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Style Guide",
              to: "docs/",
            },
            {
              label: "Second Doc",
              to: "docs/doc2/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/docusaurus",
            },
            {
              label: "Discord",
              href: "https://discordapp.com/invite/docusaurus",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/docusaurus",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/representable/representable",
            },
          ],
        },
      ],
      copyright: "Copyright © 2020 Representable, Inc. Built with Docusaurus.",
    },
  },
  title: "Representable.org Docs",
  tagline: "Getting started with Representable.org",
  url: "https://representable-docs.netlify.app",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "representable",
  projectName: "representable",
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          homePageId: "doc1",
          sidebarPath: "/Users/lauren/sw/representable/docs/sidebars.js",
          editUrl:
            "https://github.com/Representable/representable/edit/master/docs/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/Representable/representable/edit/master/docs/",
        },
        theme: {
          customCss: "/Users/lauren/sw/representable/docs/src/css/custom.css",
        },
      },
    ],
  ],
};
