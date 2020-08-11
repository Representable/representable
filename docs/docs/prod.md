---
id: prod
title: Managing Deployment
---

## Introduction

There are three main environments for Representable.org: the local development environment, the one that you run on your computer at localhost; the staging environment, a live test environment at [representable-dev.herokuapp.com](https://representable-dev.herokuapp.com); and the production environment at [representable.org](https://representable.org).

## Deploying to the Production Environment

The DevOps team is responsible for managing deployments to production. In order to deploy, they open a PR to the `production` branch from the `main` branch and merge it. No code review is required at this stage because all code that is on `main` is reviewed before merging. The merge to `production` triggers the automatic deployment of the site via Heroku. If you'd like to learn about how this automatic deployment is set up via Heroku, check out the Set Up page.

## Deploying to the Staging Environment

In some cases, you may want to test a feature out on a live site before pushing it to the production environment. For example, you may be adding a new feature to the select tool and want to make sure it works on mobile. In this case, you can open a PR to the `staging` branch and merge it yourself (no code review needed). This will trigger an automatic deployment to Heroku.
