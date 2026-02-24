---
description: Stop all running platform services
---

// turbo-all
1. Kill backend processes
```bash
pkill -f 'python3 -m uvicorn app.main:app' || true
```

2. Kill frontend processes
```bash
pkill -f 'vite' || true
```
