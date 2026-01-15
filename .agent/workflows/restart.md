---
description: Restart both frontend and backend services
---

// turbo-all
1. Stop all services
```bash
pkill -f 'python3 -m uvicorn app.main:app' || true
pkill -f 'vite' || true
```

2. Wait for ports to clear
```bash
sleep 2
```

3. Start services
```bash
./start.sh
```
