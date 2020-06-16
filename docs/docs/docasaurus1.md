---
id: docasaurus1
title: Overview
---

### Editing a Page

Scroll to the bottom of each page in the docasaurus and click `edit this page`. If you have access to editing the docs, you will be taken to a page to edit them. Then, you can commit directly to the master branch.

### Adding a Page

#### 1. Add to the Sidebar

Go to `sidebars.js` and find the section that you want to add to. For example I may decide that I want to add a new doc "django3" to the Django Project section.

Then, I would add Django3 to the end of the line:

```
module.exports = {
  someSidebar: {
    ...
    "Django Project": ["django1", "django2","django3"],
    ...
  },
};
```

#### 2. Create Markdown File

After completing the above step, add a file in the docs folder called `django3.md`.

This file should have the following lines:

```
---
id: django1
title: Overview
---

### Title
Anything you want here!

```
