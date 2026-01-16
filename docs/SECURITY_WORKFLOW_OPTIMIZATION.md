# Security Workflow Optimization

## Problem

The security workflow (`security.yml`) was running on **every push to develop**, consuming approximately **648 minutes/month** of GitHub Actions free tier time.

**This is wasteful because:**
- Security scans are expensive (dependency scans, CodeQL, container scanning)
- Running on every commit is overkill for development branches
- Most security issues don't need immediate detection on every push

## Solution

Optimized the security workflow to run:

1. **Weekly scheduled scans** (every Monday at 2 AM UTC)
   - Catches security issues regularly without wasting resources
   - Good for ongoing security monitoring

2. **On PRs to main** (important code review)
   - Ensures security checks before merging to main
   - Critical for production code quality

3. **Manual dispatch** (on-demand)
   - Available when you need immediate security checks
   - Useful for urgent security audits

4. **NOT on every push to develop**
   - Saves ~648 minutes/month
   - Development branches don't need constant security scanning

## Changes Made

### Before:
```yaml
on:
  push:
    branches: [main, develop]  # ❌ Runs on every push
  pull_request:
    branches: [main, develop]
```

### After:
```yaml
on:
  schedule:
    - cron: '0 2 * * 1'  # ✅ Weekly (Monday 2 AM UTC)
  pull_request:
    branches:
      - main  # ✅ Only on PRs to main
  workflow_dispatch:  # ✅ Manual trigger
```

## Estimated Savings

**Before:**
- ~20-25 pushes/day to develop
- ~600-750 pushes/month
- ~648 minutes/month wasted on security scans

**After:**
- ~4 scheduled scans/month (weekly)
- ~5-10 PRs to main/month
- ~50-100 minutes/month (90% reduction)

**Savings: ~550-600 minutes/month** 🎉

## What's Scanned

1. **Dependency Vulnerability Scan**
   - Python dependencies (safety check)
   - Node.js dependencies (npm audit)

2. **CodeQL Analysis**
   - Static code analysis
   - Security and quality queries
   - Python and JavaScript

3. **Container Image Security Scan**
   - Docker image vulnerability scanning (Trivy)
   - Only on schedule/manual (not on PRs)

## When to Run Manually

Run the security workflow manually when:
- You've added new dependencies
- You've made significant security-related changes
- You need an urgent security audit
- Before a major release

**How to run manually:**
1. Go to GitHub → Actions
2. Select "Security Scanning" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Best Practices

1. **Don't disable the workflow** - Weekly scans are important
2. **Review security alerts** - Check GitHub Security tab regularly
3. **Fix critical issues** - Address high/critical vulnerabilities promptly
4. **Use manual scans** - When you need immediate feedback

## Monitoring

Check security scan results:
- GitHub → Security tab → Code scanning alerts
- GitHub → Security tab → Dependabot alerts
- Workflow run summaries in Actions tab

---

**Last Updated**: January 2025
