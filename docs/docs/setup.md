---
id: setup
title: First Steps
---

Hello and welcome to the Representable.org Docs! This guide will lead you through setting up your local development environment and explain different parts of the website.

The first page of the guide, below, will take you through the recommended setup (i.e. all the packages and programs needed to set up locally) and also demostrate how to clone/download the codebase so you can start contributing.

## 1. Recommended Setup

Install the packages listed in the table below (if you don't have them already) using the installation link.

### A. Required Packages:

| Name                      | Description                                                                                                       | Installation                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Homebrew (Mac/Linux only) | Package installer for Mac/Linux                                                                                   | [Link](https://brew.sh/)                                        |
| Python3                   | Open source programming language. Note: Mac users can run `brew install python` as a shortcut.                    | [Link](https://realpython.com/installing-python/)               |
| pip                       | Python package installer, installed by default but needs to be upgraded.                                          | [Link](https://pip.pypa.io/en/stable/installing/#upgrading-pip) |
| yarn                      | Package manager for node (used for our React projects). Note: Mac users can run `brew install yarn` as a shorcut. | [Link](https://classic.yarnpkg.com/en/docs/install/#mac-stable) |

### B. Highly Suggested Tools:

The following tools will be helpful for setting up your development environment. Install them using the provided installation links.

| Name               | Description                                                    | Installation                           |
| ------------------ | -------------------------------------------------------------- | -------------------------------------- |
| GitHub Desktop     | Desktop client for GitHub                                      | [Link](https://desktop.github.com/)    |
| VS Code            | IDE/Code Editor                                                | [Link](https://code.visualstudio.com/) |
| GitHub Pull Requests and Issues | VS Code Extension for GitHub  | [Link](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) |
| Git History | VS Code Extension for GitHub that tells you who committed each line of code  | [Link](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory) |
| Python (Linter/Debugger) | VS Code Extension for Python  | [Link](https://marketplace.visualstudio.com/items?itemName=ms-python.python) |
| Django (Syntax highlighting) | VS Code Extension for GitHub that highlights syntax and provides helpful code snippets.  | [Link](https://marketplace.visualstudio.com/items?itemName=batisteo.vscode-django) |
| Markdown All in One  |  VS Code Extension for Markdown  | [Link](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)    |
| Postico (Mac Only) | A modern PostgreSQL client that lets you inspect your database | [Link](https://eggerapps.at/postico/)  |

## 2. Cloning the Repo

The easiest way to clone the repo to begin editing locally is to visit the [Github repository](https://github.com/Representable/representable) and click `Clone or download` then `Open in Desktop`.

![clone](/img/clone.png "Cloning the repo")

Alternatively, you can open Terminal and write:

```
git clone https://github.com/Representable/representable.git
```
