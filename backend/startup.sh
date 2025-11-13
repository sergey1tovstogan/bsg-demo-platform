#!/bin/bash
# Startup script for Azure App Service
cd /home/site/wwwroot
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker --timeout 120 --access-logfile - --error-logfile -
