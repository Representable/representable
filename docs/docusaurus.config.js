module.exports = {
  title: "Representable Docs",
  tagline: "Getting started with Representable.org",
  url: "https://representable-docs.netlify.app",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "representable", // Usually your GitHub org/user name.
  projectName: "representable", // Usually your repo name.
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
        { to: "blog/", label: "Blog", position: "left" },
        {
          to: "https://github.com/Representable/representable/",
          label: "Github",
          position: "right",
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
              label: "Setup",
              to: "docs/",
            },
            {
              label: "Docs Editing Guide",
              to: "docs/docasaurus1/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/representable/",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/representable20",
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
      copyright: `Copyright © ${new Date().getFullYear()} Representable, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: "setup",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/Representable/representable/edit/main/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/Representable/representable/edit/main/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
