# Git Setup and Workflow - VIGILUX Project

**CSE 499 - Week 2 Activity Submission**

---

## Project Information

**Project Name:** VIGILUX - Neighborhood Watch Mobile Application

**Team Members:**

- Kendahl Chae Bingham (Project Lead) - GitHub: [@kendychae](https://github.com/kendychae)
- Samuel Iyen Evbosaru (Backend Developer) - GitHub: [@terrywhyte001](https://github.com/terrywhyte001)
- Brenden Taylor Lyon (Frontend Developer) - GitHub: [@richardlyonheart](https://github.com/richardlyonheart)

**Repository URL:** https://github.com/kendychae/VIGILUX

**Project Board:** https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning

**Date:** March 9, 2026

---

## Table of Contents

1. [Repository Setup](#1-repository-setup)
2. [Branch Strategy](#2-branch-strategy)
3. [Commit Conventions](#3-commit-conventions)
4. [Pull Request Process](#4-pull-request-process)
5. [GitHub Project Board](#5-github-project-board)
6. [Team Workflow](#6-team-workflow)
7. [Initial Setup Instructions](#7-initial-setup-instructions)
8. [Common Git Commands](#8-common-git-commands)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Repository Setup

### 1.1 Repository Creation

✅ **Completed:**

- Created repository: `VIGILUX` at https://github.com/kendychae/VIGILUX
- Repository is public for collaboration and transparency
- Initial README.md created
- LICENSE file added (MIT License)
- .gitignore configured for Node.js and React Native

### 1.2 Repository Structure

```
VIGILUX/
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── LICENSE              # MIT License
├── backend/             # Node.js backend application
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/            # React Native mobile app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── docs/                # Documentation and submissions
    └── canvas-submissions/
```

### 1.3 Collaborator Access

**Current Collaborators:**

- Kendahl Chae Bingham (Owner/Admin)
- Samuel Iyen Evbosaru [@terrywhyte001](https://github.com/terrywhyte001) (Write access)
- Brenden Taylor Lyon [@richardlyonheart](https://github.com/richardlyonheart) (Write access)

**Adding Collaborators:**

1. Navigate to repository Settings
2. Click on "Collaborators and teams"
3. Click "Add people"
4. Enter GitHub username or email
5. Set permission level to "Write"

---

## 2. Branch Strategy

We will use the **Git Flow** branching model adapted for our team size:

### 2.1 Main Branches

#### `main` Branch

- **Purpose:** Production-ready code
- **Protection:** Protected branch, requires pull request reviews
- **Merges From:** `develop` branch only
- **Deployment:** Tagged releases
- **Rules:**
  - No direct commits
  - Requires 1 approving review
  - All checks must pass

#### `develop` Branch

- **Purpose:** Integration branch for features
- **Protection:** Protected branch
- **Merges From:** Feature and bugfix branches
- **Rules:**
  - No direct commits for major changes
  - Should always be in a working state

### 2.2 Supporting Branches

#### Feature Branches

- **Naming Convention:** `feature/<feature-name>`
- **Examples:**
  - `feature/user-authentication`
  - `feature/report-submission`
  - `feature/push-notifications`
- **Created From:** `develop`
- **Merged To:** `develop`
- **Lifetime:** Until feature is complete
- **Deleted:** After merge

#### Bugfix Branches

- **Naming Convention:** `bugfix/<bug-description>`
- **Examples:**
  - `bugfix/login-validation`
  - `bugfix/photo-upload-crash`
- **Created From:** `develop`
- **Merged To:** `develop`
- **Lifetime:** Until bug is fixed
- **Deleted:** After merge

#### Hotfix Branches

- **Naming Convention:** `hotfix/<issue-description>`
- **Examples:** `hotfix/security-vulnerability`
- **Created From:** `main`
- **Merged To:** `main` AND `develop`
- **Use Case:** Critical production bugs
- **Lifetime:** Very short, urgent fixes only

#### Personal Development Branches

- **Naming Convention:** `dev/<username>/<task>`
- **Examples:** `dev/kendahl/database-schema`
- **Purpose:** Personal experimentation
- **Merge:** Only after review and testing

### 2.3 Branch Diagram

```
main    ──●────────────────●─────────────●────────▶
          │                │             │
          │                │             │
develop   ├─●──●──●──●──●──●──●──●──●────●────────▶
          │  │  │  │  │  │  │  │  │
          │  └──┘  └──┘  └──┘  └──┘
feature/* │
          │
hotfix/*  └─●──●──┘
```

---

## 3. Commit Conventions

We will follow **Conventional Commits** specification for clear, structured commit messages.

### 3.1 Commit Message Format

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

### 3.2 Commit Types

| Type       | Description              | Example                                            |
| ---------- | ------------------------ | -------------------------------------------------- |
| `feat`     | New feature              | `feat(auth): add user registration endpoint`       |
| `fix`      | Bug fix                  | `fix(report): resolve photo upload issue`          |
| `docs`     | Documentation only       | `docs(readme): update setup instructions`          |
| `style`    | Code style/formatting    | `style(frontend): format components with Prettier` |
| `refactor` | Code restructuring       | `refactor(api): reorganize route handlers`         |
| `test`     | Adding/updating tests    | `test(auth): add unit tests for login`             |
| `chore`    | Maintenance tasks        | `chore(deps): update dependencies`                 |
| `perf`     | Performance improvements | `perf(db): optimize report query`                  |
| `ci`       | CI/CD changes            | `ci(github): add automated testing workflow`       |

### 3.3 Commit Message Examples

#### Good Commits

```bash
feat(auth): implement JWT token generation
fix(upload): handle file size validation error
docs(api): add endpoint documentation for reports
test(user): add integration tests for user CRUD
refactor(database): normalize report schema
```

#### Poor Commits (Avoid)

```bash
fix bug
update code
minor changes
WIP
asdf
```

### 3.4 Commit Best Practices

1. **Atomic commits:** Each commit should represent one logical change
2. **Present tense:** Use "add feature" not "added feature"
3. **Descriptive:** Be specific about what changed
4. **Length:** Subject line should be 50 characters or less
5. **Body:** Add detailed explanation if needed (72 char line width)
6. **References:** Include issue numbers when applicable
   - Example: `fix(login): resolve validation bug (#42)`

---

## 4. Pull Request Process

### 4.1 Creating a Pull Request

**Step-by-step Process:**

1. **Ensure your branch is up-to-date**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git merge develop
   ```

2. **Push your branch**

   ```bash
   git push origin your-feature-branch
   ```

3. **Create PR on GitHub**
   - Go to repository on GitHub
   - Click "Pull requests" tab
   - Click "New pull request"
   - Select base branch (`develop`) and compare branch (your feature branch)
   - Click "Create pull request"

4. **Fill out PR template**

### 4.2 Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #[issue number]

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

How has this been tested?

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged
```

### 4.3 Code Review Process

1. **Assign Reviewers:** Tag at least one team member
2. **Review Timeline:** Reviews should be completed within 24-48 hours
3. **Review Criteria:**
   - Code quality and readability
   - Functionality correctness
   - Test coverage
   - Documentation
   - Security considerations
   - Performance implications

4. **Review Comments:** Use GitHub's review features
   - **Comment:** General feedback
   - **Approve:** Looks good, ready to merge
   - **Request Changes:** Issues that must be addressed

5. **Address Feedback:** Author responds to comments and makes changes

6. **Approval:** At least 1 approval required before merge

7. **Merge:** Use "Squash and merge" for clean history

### 4.4 Merge Strategies

| Strategy             | When to Use                                        |
| -------------------- | -------------------------------------------------- |
| **Squash and merge** | Default for feature branches (keeps history clean) |
| **Rebase and merge** | For small bug fixes (linear history)               |
| **Merge commit**     | For merging develop to main (preserves history)    |

---

## 5. GitHub Project Board

### 5.1 Project Board Setup

**URL:** https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning

**Board Type:** Team Planning Template

### 5.2 Board Columns

| Column          | Description                   | Criteria            |
| --------------- | ----------------------------- | ------------------- |
| **Backlog**     | All planned tasks             | Not yet prioritized |
| **Ready**       | Prioritized, ready for sprint | Defined, estimated  |
| **In Progress** | Currently being worked on     | Assigned, active    |
| **In Review**   | Awaiting code review          | PR submitted        |
| **Done**        | Completed and merged          | Merged to develop   |

### 5.3 Issue Management

#### Creating Issues

**Issue Template:**

```markdown
## Title

Clear, concise description (following commit convention type)

## Description

Detailed description of the task/bug

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Type

- [ ] Feature
- [ ] Bug
- [ ] Documentation
- [ ] Enhancement

## Priority

- [ ] High
- [ ] Medium
- [ ] Low

## Estimated Effort

Story Points: [1, 2, 3, 5, 8]

## Assignee

@username

## Labels

feature, backend, frontend, bug, documentation, etc.
```

#### Issue Labels

| Label              | Color  | Description        |
| ------------------ | ------ | ------------------ |
| `feature`          | Green  | New feature        |
| `bug`              | Red    | Bug fix            |
| `documentation`    | Blue   | Documentation      |
| `enhancement`      | Yellow | Improvement        |
| `backend`          | Purple | Backend work       |
| `frontend`         | Orange | Frontend work      |
| `high-priority`    | Red    | Urgent             |
| `good-first-issue` | Green  | Easy for newcomers |
| `help-wanted`      | Yellow | Needs assistance   |

### 5.4 Linking Issues to PRs

Use keywords in PR descriptions to automatically link and close issues:

- `Closes #123`
- `Fixes #456`
- `Resolves #789`

---

## 6. Team Workflow

### 6.1 Daily Workflow

**Morning:**

1. Pull latest changes from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Check GitHub Project Board for assigned tasks
3. Create feature branch if starting new task
   ```bash
   git checkout -b feature/my-feature
   ```

**During Development:**

1. Make changes and commit frequently
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```
2. Push to remote regularly
   ```bash
   git push origin feature/my-feature
   ```
3. Update issue status on project board

**End of Day:**

1. Push all commits
2. Update issue with progress notes
3. Create PR if feature is complete

### 6.2 Sprint Workflow

**Sprint Start (Every 2 weeks):**

1. Sprint planning meeting
2. Select issues from Backlog to Ready
3. Assign issues to team members
4. Move to In Progress when starting

**During Sprint:**

1. Daily standups (Mon, Wed, Fri)
2. Regular commits and pushes
3. Code reviews within 24-48 hours
4. Update project board status

**Sprint End:**

1. Complete all in-progress PRs
2. Merge approved PRs to develop
3. Sprint review meeting
4. Sprint retrospective
5. Move incomplete items back to backlog

### 6.3 Release Workflow

**Preparing a Release:**

1. Create release branch from develop
   ```bash
   git checkout -b release/v1.0.0 develop
   ```
2. Update version numbers
3. Update CHANGELOG.md
4. Final testing
5. Merge to main
   ```bash
   git checkout main
   git merge release/v1.0.0
   git tag -a v1.0.0 -m "Version 1.0.0"
   ```
6. Merge back to develop
   ```bash
   git checkout develop
   git merge release/v1.0.0
   ```
7. Push tags
   ```bash
   git push origin --tags
   ```
8. Delete release branch

---

## 7. Initial Setup Instructions

### 7.1 For Team Members (First Time Setup)

**Prerequisites:**

- Git installed ([Download](https://git-scm.com/downloads))
- GitHub account created
- Added as collaborator to repository

**Setup Steps:**

1. **Configure Git**

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **Generate SSH Key (Recommended)**

   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

   Add SSH key to GitHub: Settings → SSH and GPG keys → New SSH key

3. **Clone Repository**

   ```bash
   # HTTPS
   git clone https://github.com/kendychae/VIGILUX.git

   # SSH (if configured)
   git clone git@github.com:kendychae/VIGILUX.git
   ```

4. **Navigate to Project**

   ```bash
   cd VIGILUX
   ```

5. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

6. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

7. **Setup Environment Variables**

   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

8. **Verify Setup**

   ```bash
   # Check git status
   git status

   # Check remote
   git remote -v
   ```

### 7.2 Daily Update Routine

```bash
# 1. Start your day by updating local repository
git checkout develop
git pull origin develop

# 2. Create/checkout your feature branch
git checkout -b feature/my-new-feature
# OR
git checkout feature/existing-feature

# 3. Work on your feature...

# 4. Stage and commit changes
git add .
git commit -m "feat(scope): description"

# 5. Push to remote
git push origin feature/my-new-feature

# 6. When feature is complete, create Pull Request on GitHub
```

---

## 8. Common Git Commands

### 8.1 Essential Commands

#### Checking Status and History

```bash
# Check status
git status

# View commit history
git log
git log --oneline
git log --graph --oneline --all

# Show changes
git diff
git diff --staged
```

#### Branching

```bash
# List branches
git branch
git branch -a  # Include remote branches

# Create branch
git branch feature/new-feature

# Switch branch
git checkout feature/new-feature

# Create and switch in one command
git checkout -b feature/new-feature

# Delete branch
git branch -d feature/old-feature
git push origin --delete feature/old-feature  # Delete remote
```

#### Committing

```bash
# Stage files
git add file.js
git add .  # All files

# Commit
git commit -m "feat(scope): description"

# Amend last commit
git commit --amend -m "new message"
```

#### Syncing

```bash
# Fetch changes
git fetch origin

# Pull changes
git pull origin develop

# Push changes
git push origin feature/my-feature

# Force push (use with caution!)
git push origin feature/my-feature --force
```

#### Merging

```bash
# Merge branch into current
git merge feature/other-feature

# Abort merge if conflicts
git merge --abort
```

#### Stashing

```bash
# Save uncommitted changes
git stash

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Clear all stashes
git stash clear
```

### 8.2 Advanced Commands

#### Rebasing

```bash
# Rebase feature branch onto develop
git checkout feature/my-feature
git rebase develop

# Interactive rebase (clean up commits)
git rebase -i HEAD~3
```

#### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick abc123
```

#### Resetting

```bash
# Unstage files
git reset HEAD file.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Reset to remote state
git reset --hard origin/develop
```

#### Tagging

```bash
# Create tag
git tag -a v1.0.0 -m "Version 1.0.0"

# List tags
git tag

# Push tags
git push origin --tags

# Delete tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

---

## 9. Troubleshooting

### 9.1 Common Issues and Solutions

#### Issue: Merge Conflicts

**Solution:**

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Open conflicted files and resolve conflicts
# Look for markers: <<<<<<< HEAD, =======, >>>>>>> branch

# 3. Stage resolved files
git add resolved-file.js

# 4. Commit the merge
git commit -m "fix: resolve merge conflicts"

# 5. Push
git push origin your-branch
```

#### Issue: Accidentally Committed to Wrong Branch

**Solution:**

```bash
# 1. Create new branch from current state
git branch feature/correct-branch

# 2. Reset current branch
git reset --hard HEAD~1

# 3. Switch to new branch
git checkout feature/correct-branch
```

#### Issue: Need to Undo Last Commit

**Solution:**

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1
```

#### Issue: Pushed Sensitive Information

**Solution:**

1. Immediately rotate credentials
2. Remove from history:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch PATH-TO-FILE" \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push: `git push origin --force --all`
4. Notify team

#### Issue: Branch is Behind Remote

**Solution:**

```bash
# Pull latest changes
git pull origin develop

# If you have local commits, use rebase
git pull --rebase origin develop
```

#### Issue: Accidentally Deleted Branch

**Solution:**

```bash
# Find commit SHA
git reflog

# Recreate branch
git checkout -b feature/recovered abc123
```

### 9.2 Getting Help

**Resources:**

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Team Discord/Slack channel
- Ask team members during standup

**Emergency Contact:**

- Project Lead: Kendahl Chae Bingham
- Escalate in team chat if blocked

---

## 10. Best Practices Summary

### ✅ Do's

1. **Commit frequently** with clear messages
2. **Pull before pushing** to avoid conflicts
3. **Create branches** for all features/fixes
4. **Write descriptive PR descriptions**
5. **Review code thoroughly** before approving
6. **Keep commits atomic** (one logical change)
7. **Update project board** regularly
8. **Test before pushing** to shared branches
9. **Communicate blockers** immediately
10. **Document** complex changes in commit body

### ❌ Don'ts

1. **Don't commit** directly to `main` or `develop`
2. **Don't push** sensitive information (.env files)
3. **Don't force push** to shared branches
4. **Don't leave** PRs unreviewed for days
5. **Don't merge** without approval
6. **Don't commit** large binary files
7. **Don't use** generic commit messages
8. **Don't work** on same file simultaneously
9. **Don't ignore** merge conflicts
10. **Don't leave** branches stale for weeks

---

## 11. Checklist for Week 2 Activity

### Git Setup Checklist

- [x] Repository created on GitHub
- [x] README.md with project information
- [x] LICENSE file added
- [x] .gitignore configured
- [x] Initial project structure created
- [x] Collaborators invited
- [ ] All team members cloned repository
- [ ] Branch protection rules set up
- [x] GitHub Project Board created
- [x] Initial issues created
- [x] Git workflow documented
- [x] Commit conventions established

### Documentation Checklist

- [x] Git setup documentation complete
- [x] Branch strategy defined
- [x] Commit conventions documented
- [x] Pull request process documented
- [x] Project board usage explained
- [x] Common commands documented
- [x] Troubleshooting guide included

---

## 12. Revision History

| Version | Date       | Author               | Changes                         |
| ------- | ---------- | -------------------- | ------------------------------- |
| 1.0     | 2026-03-09 | Kendahl Chae Bingham | Initial Git setup documentation |

---

## 13. Approval

This Git setup and workflow has been reviewed and approved by:

**Team Members:**

- Kendahl Chae Bingham - Project Lead ✅
- Samuel Iyen Evbosaru [@terrywhyte001](https://github.com/terrywhyte001) - Backend Developer ✅
- Brenden Taylor Lyon [@richardlyonheart](https://github.com/richardlyonheart) - Frontend Developer ✅

**Course Instructor:** (Pending Review)

**Date:** March 9, 2026

---

## 14. Additional Resources

### Helpful Links

- [Pro Git Book](https://git-scm.com/book/en/v2) - Comprehensive Git guide
- [GitHub Flow](https://guides.github.com/introduction/flow/) - Simple branching model
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message specification
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) - Quick reference

### Team Resources

- Repository: https://github.com/kendychae/VIGILUX
- Project Board: https://github.com/users/kendychae/projects/3
- Discord/Slack: [Team Communication Channel]
- Course Materials: https://byui-cse.github.io/cse499-ww-course/

---

_This document serves as the official Git setup and workflow guide for the VIGILUX project. All team members are expected to follow these guidelines to ensure smooth collaboration and code quality._
