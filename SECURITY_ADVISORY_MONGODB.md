# Security Advisory: MongoDB Vulnerability CVE-2025-14847 (MongoBleed)

## ⚠️ Critical Security Vulnerability

**CVE-2025-14847 (MongoBleed)** is a critical vulnerability affecting MongoDB servers that allows unauthenticated clients to leak uninitialized heap memory, potentially exposing sensitive data like passwords, credentials, and API keys.

**CVSS Score**: 8.7 (Critical)  
**Status**: Active exploitation confirmed (CISA catalog)

---

## ✅ Good News for Our Project

**Our project is NOT directly affected** because:
- ✅ We use **Azure Cosmos DB (MongoDB API)** - a managed service (not self-hosted MongoDB)
- ✅ We only use MongoDB **client libraries** (`pymongo`, `motor`) - these are NOT affected
- ✅ No local MongoDB server installations detected

---

## 🔍 What You Need to Do

### Step 1: Verify Your Local Environment

Run the vulnerability check script to ensure you don't have any local MongoDB servers:

```bash
cd backend
python scripts/check_mongodb_vulnerability.py
```

**What the script checks:**
- Local MongoDB server on `localhost:27017`
- MongoDB Docker containers
- MongoDB server processes running on your machine

**Expected output**: Should show `[OK] No local MongoDB servers found`

### Step 2: If MongoDB is Found Locally

If the script detects a local MongoDB server, you have two options:

**Option A: Remove it** (if unused)
- Uninstall MongoDB from your system
- Remove any MongoDB Docker containers

**Option B: Update it** (if you need it)
Update to a patched version:
- MongoDB 8.2.3+ (if using 8.2.x)
- MongoDB 8.0.17+ (if using 8.0.x)
- MongoDB 7.0.28+ (if using 7.0.x)
- MongoDB 6.0.27+ (if using 6.0.x)
- MongoDB 5.0.32+ (if using 5.0.x)
- MongoDB 4.4.30+ (if using 4.4.x)

**Temporary Workaround** (if upgrade not immediately possible):
- Disable zlib-uncompress in MongoDB configuration
- ⚠️ Only use this if it doesn't affect your workflow

### Step 3: Verify Azure Cosmos DB (Infrastructure Team)

The infrastructure team should verify that Azure Cosmos DB MongoDB API is patched:
- Check MongoDB API version in Azure Portal
- Account: `bsg-demo-platform-mongodb`
- Contact Azure Support if needed (Azure typically patches managed services automatically)

---

## 📋 Quick Checklist

- [ ] Run `python backend/scripts/check_mongodb_vulnerability.py`
- [ ] Verify no local MongoDB servers found
- [ ] If MongoDB found, remove or update it
- [ ] Report results to security team

---

## 📚 More Information

- **Full Assessment**: See `MONGODB_VULNERABILITY_ASSESSMENT.md`
- **CVE Details**: https://nvd.nist.gov/vuln/detail/CVE-2025-14847
- **MongoDB Security Update**: https://www.mongodb.com/company/blog/news/mongodb-server-security-update-december-2025

---

## ❓ Questions?

If you have any concerns or questions:
1. Check the full assessment document: `MONGODB_VULNERABILITY_ASSESSMENT.md`
2. Contact the security team
3. Verify Azure Cosmos DB status with infrastructure team

---

**Remember**: This vulnerability affects MongoDB **servers**, not client libraries. Our project uses Azure Cosmos DB (managed service) and client libraries only, so we're in a good position. However, everyone should verify their local environments.
