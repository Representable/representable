---
id: doc2
title: Contribution Guidelines
---

Now that you've got your local development environment set up, please read through the guide below to understand the development process.

## Production workflow

- All issues and feature requests are added to the [Product Backlog](https://github.com/orgs/Representable/projects/1?fullscreen=true). This is how we keep track of all the things we want to do and prioritize them.
- At the beginning of every sprint, we'll create a feature roadmap and add corresponding GitHub issues, pulling from the Product Backlog, under a given milestone. We'll also set a deadline that marks the day when we'll rollout these features.
- DevOps (currently [@lauren-johnston](https://github.com/lauren-johnston) and [@arorasomya](https://github.com/arorasomya)) are responsible for making sure all issues are created, assigned, and added to the [Roadmap Tracker](https://github.com/orgs/Representable/projects/3?fullscreen=true).

### Coding

- When you're starting a new feature, open a branch off the master branch to start making your changes with the relevant issue in mind.
- If the feature that you're working on takes a long time, you wanna make sure that your code is constantly being updated to the changes being pushed by teammates. In order to keep your feature branch updated to prevent conflicts later on, make sure to sync up your branch with master - by pulling changes in master and merging master with your branch. Syncing your branch daily is usually good practice.
- When you're ready to open a PR, open a PR to the master or to a chosen dev branch for features that aren't ready to be merged with the master branch yet. Try to make the PR as small as possible so that your reviewer can easily see what you've done. Be descriptive in your PR! Include screenshots if possible. Write "resolves #<issue_number>" at the end of your PR to automatically close the issue when the PR is merged.
- You need at least one review for any PR to the master branch.

### Reviewing

You've been assigned to review a PR. Now what?

- **Check tests:** Make sure the PR passes CI checks. If it does not, kindly ask the PR opener to review why their PR is failing checks and ask them to recommit if needed (they can recommit to the branch and it will be added to the same PR).
- **High-level review:** Read the PR description and screenshots. Does that match what's in the relevant spec doc? If there's a clear change that they can make, request changes by going to files->review changes-> request changes.
- **Code review:** Check out the PR locally. You may do this in Github desktop, for example. Run the code and make sure the relevant features work. At the same time, go to the files tab in github and check each file off as you review them.

- **Approve/request changes/comment:** Once you're done with the above steps, choose whether to approve changes, request changes (be specific!) or comment for clarification.

### Merging an Approved PR

Once your reviewers have approved your PR, you can merge with master. Try to merge in a timely manner, soon after reviewers have approved the PR, unless there are merge conflicts. Note: it should always be the person who opened the PR that merges it so that they have ownership over their own changes (and get full credit for it).

### Pushing Fixes

In rare cases, there may be a bug in production that needs immediate attention before the next release. Ideally, we would simply roll back the release. If this is not possible, we would open a PR directly to production for someone to quickly (but carefully) take a look. This process may change in future as we better understand how to address rollout problems.

### Releasing to Production

The DevOps team is responsible for merging the current state of the master branch to the production branch on the rollout deadline. Any pushes to production trigger an auto deployment to Heroku. Most contributors will not have direct push access to the production branch to prevent rollout confusion. If you're interested in managing this process, and are a current contributor, however, DevOps would love to have you join the team!
