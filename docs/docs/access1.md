---
id: access1
title: Accessibility Overview
---

Accessibility is important! While writing code, it's good to keep these things in mind, so that we can maintain and improve our accessibility. This is primarily HTML/CSS related.

We follow the [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/) (WCAG).

### Alt Text
Any time you add an image to the site, add alt text! `alt="Image description goes here"`

### Labels
All form areas should have labels which allow for easy access with screen readers. If you don't want to make these visible, use `class="sr-only"` to make it so that it's only present for screen readers.

### Context and Roles
When possible, use more straightforward html element types: `<button>` or `role="button"` rather than `<div class="btn">`. Also try to make HTML elements cascade in a natural way. This should come naturally with simpler code, as well!

### Color Contrast
Try to ensure that new elements meet color contrast standards. [Here's](https://wave.webaim.org/) a site that checks this (+ so much more on accessibility!).
