# Initial Git Push Instructions

## ⚠️ IMPORTANT: Read Before Pushing

This guide will help you push your local VIGILUX project to GitHub.

---

## Prerequisites

1. ✅ GitHub account created
2. ✅ Repository created at: https://github.com/kendychae/VIGILUX
3. ✅ Git installed on your computer
4. ✅ All project files created locally

---

## Step-by-Step Push Instructions

### Step 1: Configure Git (First Time Only)

Open PowerShell/Terminal and run:

```powershell
# Set your name
git config --global user.name "Kendahl Chae Bingham"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

### Step 2: Navigate to Project Directory

```powershell
cd "C:\Users\kendy\OneDrive\VIGILUX"
```

### Step 3: Initialize Git Repository

```powershell
# Initialize git
git init

# Verify initialization
git status
```

### Step 4: Add Remote Repository

```powershell
# Add GitHub repository as remote
git remote add origin https://github.com/kendychae/VIGILUX.git

# Verify remote
git remote -v
```

You should see:

```
origin  https://github.com/kendychae/VIGILUX.git (fetch)
origin  https://github.com/kendychae/VIGILUX.git (push)
```

### Step 5: Create and Switch to Main Branch

```powershell
# Create main branch
git branch -M main
```

### Step 6: Stage All Files

```powershell
# Add all files to staging
git add .

# Verify files are staged
git status
```

### Step 7: Create Initial Commit

```powershell
# Create initial commit
git commit -m "chore: initial project setup with complete skeleton structure"
```

### Step 8: Push to GitHub

**Option A: HTTPS (Easier for first time):**

```powershell
git push -u origin main
```

You'll be prompted for your GitHub credentials. If you have 2FA enabled, you'll need to use a Personal Access Token (PAT) instead of your password.

**Option B: SSH (More secure, requires setup):**

First, generate SSH key (if not already done):

```powershell
ssh-keygen -t ed25519 -C "your.email@example.com"
```

Add the key to your GitHub account:

1. Copy key: `cat ~/.ssh/id_ed25519.pub` (Mac/Linux) or `type $env:USERPROFILE\.ssh\id_ed25519.pub` (Windows)
2. Go to GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste and save

Then change remote URL:

```powershell
git remote set-url origin git@github.com:kendychae/VIGILUX.git
git push -u origin main
```

---

## Step 9: Create and Push Develop Branch

```powershell
# Create develop branch
git checkout -b develop

# Push develop branch
git push -u origin develop
```

---

## Step 10: Verify on GitHub

1. Go to https://github.com/kendychae/VIGILUX
2. You should see:
   - ✅ All files and folders
   - ✅ README.md displayed
   - ✅ Two branches: main and develop

---

## Setting Up Branch Protection (Optional but Recommended)

1. Go to repository Settings
2. Click "Branches" in left sidebar
3. Click "Add rule"
4. Branch name pattern: `main`
5. Check:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
6. Click "Create" or "Save changes"

Repeat for `develop` branch.

---

## Adding Team Members as Collaborators

1. Go to repository Settings
2. Click "Collaborators and teams"
3. Click "Add people"
4. Enter GitHub username or email for:
   - Samuel Iyen Evbosaru (@terrywhyte001)
   - Brenden Taylor Lyon (@richardlyonheart)
5. Set permission to "Write"
6. Send invitation

---

## Troubleshooting

### Issue: "Repository not found" or "Permission denied"

**Solution:**

- Verify repository URL: `git remote -v`
- Check you're logged into correct GitHub account
- Ensure repository exists and is accessible

### Issue: "Authentication failed"

**Solution:**

- If using HTTPS with 2FA, create Personal Access Token:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token with `repo` scope
  3. Use token as password when pushing

### Issue: "Failed to push some refs"

**Solution:**

```powershell
# Pull any remote changes first
git pull origin main --allow-unrelated-histories

# Then push again
git push -u origin main
```

### Issue: Large files causing problems

**Solution:**

- Check .gitignore is working
- Remove node_modules if accidentally staged:
  ```powershell
  git rm -r --cached node_modules
  git commit -m "fix: remove node_modules from git"
  ```

---

## Verification Checklist

After pushing, verify:

- [ ] Repository visible at https://github.com/kendychae/VIGILUX
- [ ] README.md displays correctly
- [ ] All folders present (backend, frontend, docs, .github)
- [ ] .gitignore working (no node_modules)
- [ ] LICENSE file visible
- [ ] Two branches exist (main, develop)
- [ ] Team members invited as collaborators

---

## Next Steps After Pushing

1. **Team Setup:**
   - Share repository link with team
   - Team members clone repository
   - Team members setup development environment

2. **Project Board:**
   - Link project board to repository
   - Create initial issues
   - Move issues to appropriate columns

3. **Development:**
   - Team members create feature branches
   - Begin Sprint 1 work
   - Follow Git workflow from git-setup.md

---

## Quick Reference

```powershell
# Initialize and push (first time)
git init
git remote add origin https://github.com/kendychae/VIGILUX.git
git branch -M main
git add .
git commit -m "chore: initial project setup"
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Future commits
git add .
git commit -m "type(scope): message"
git push
```

---

## Getting Help

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Docs:** https://docs.github.com/
- **Team Chat:** Contact team members
- **Course Support:** Contact instructor

---

## Important Notes

⚠️ **Never commit:**

- `.env` files with real credentials
- `node_modules/` directories
- Large binary files
- Sensitive information

✅ **Always:**

- Pull before pushing
- Write meaningful commit messages
- Review files before committing
- Check .gitignore is working

---

**Good luck with your first push! 🚀**

Once pushed, you can mark Week 2 activities as complete and submit the Canvas assignments.
