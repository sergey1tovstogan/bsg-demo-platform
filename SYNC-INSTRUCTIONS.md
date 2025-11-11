# How to Sync Changes to GitHub

This document explains how to automatically sync your local changes to GitHub.

## Option 1: Use the Sync Script (Recommended)

### Windows (PowerShell):
```powershell
.\sync.ps1 "Your commit message here"
```

### Unix/Mac (Bash):
```bash
chmod +x sync.sh
./sync.sh "Your commit message here"
```

## Option 2: Use Git Aliases

Add these aliases to your git config for quick sync:

```bash
# Add to global config
git config --global alias.sync '!f() { git add . && git commit -m "$1" && git push; }; f'
git config --global alias.acp '!f() { git add . && git commit -m "$1" && git push; }; f'
```

Then use:
```bash
git sync "Your commit message"
# or
git acp "Your commit message"
```

## Option 3: Manual Steps

```bash
# 1. Stage all changes
git add .

# 2. Commit with message
git commit -m "Your commit message"

# 3. Push to GitHub
git push origin feature/frontend
```

## Option 4: Auto-Push Hook (Advanced)

A post-commit hook has been created that will automatically push after every commit.

**Note**: The hook may need to be made executable:
- Windows: Should work automatically
- Unix/Mac: `chmod +x .git/hooks/post-commit`

## Quick Reference

| Method | Command |
|--------|---------|
| Sync Script (Windows) | `.\sync.ps1 "message"` |
| Sync Script (Unix/Mac) | `./sync.sh "message"` |
| Git Alias | `git sync "message"` |
| Manual | `git add . && git commit -m "message" && git push` |

## Tips

- Always write descriptive commit messages
- Make sure you're on the correct branch before syncing
- If push fails, check your internet connection and GitHub access
- Review changes with `git status` before committing

