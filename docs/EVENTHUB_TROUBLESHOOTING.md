# EventHub Connection Troubleshooting Guide

## Quick Diagnostics

### 1. Test Backend Container App Directly

Test if the backend Container App is responding:

```bash
# Test general health endpoint
curl https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1/health

# Test EventHub health endpoint specifically
curl https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1/components/data-architecture/events/health
```

**Expected Response (JSON):**
```json
{
  "status": "healthy",
  "connected": true,
  "running": true,
  "events_buffered": 0
}
```

**If you get HTML instead:**
- The Container App might not be deployed
- There might be a routing issue
- The Container App might be returning an error page

### 2. Check Container App Status

In Azure Portal:
1. Go to Container Apps
2. Find `bsg-demo-backend`
3. Check:
   - **Status**: Should be "Running"
   - **Revision Status**: Should be "Active"
   - **Replicas**: Should show active replicas

### 3. Check Container App Logs

In Azure Portal:
1. Navigate to your Container App
2. Go to **Log stream** or **Monitoring → Logs**
3. Look for:
   - Application startup logs
   - Error messages
   - EventHub connection attempts
   - Any 404/405 errors

Key things to check:
- Is the EventHub adapter starting on startup?
- Are there any connection errors?
- Is the EventHub configuration loaded?

### 4. Check EventHub Configuration

The EventHub adapter requires:
- `EVENTHUB_CONNECTION_STRING` (in MongoDB settings or environment variables)
- `EVENTHUB_NAME` (default: `modelbank-event-topic`)
- `EVENTHUB_CONSUMER_GROUP` (default: `$Default`)

Check if these are configured in the Container App environment variables.

## Common Issues

### Issue: HTML Response with Status 200

**Symptom:** Backend endpoint returns HTML instead of JSON with status 200

**Possible Causes:**
1. Container App not deployed or not running
2. Container App returning default/error page
3. Routing misconfiguration in Container App
4. Container App crashing on startup

**Solution:**
1. Verify Container App is running in Azure Portal
2. Check Container App logs for errors
3. Restart the Container App if needed
4. Verify the latest code is deployed

### Issue: 404 Not Found

**Symptom:** Backend endpoint returns 404

**Possible Causes:**
1. Route not registered
2. Path mismatch
3. Backend not deployed with latest code

**Solution:**
1. Verify route exists in backend code
2. Check that backend deployment completed
3. Verify the endpoint path matches exactly

### Issue: EventHub Not Connecting

**Symptom:** Health check shows `connected: false`

**Possible Causes:**
1. EventHub configuration missing
2. Invalid connection string
3. Network connectivity issues
4. EventHub adapter not starting

**Solution:**
1. Verify EventHub configuration in MongoDB or environment variables
2. Check Container App logs for EventHub startup errors
3. Use the `/events/start` endpoint to manually start the adapter
4. Check network connectivity to Azure EventHub

## Restart Procedure

If restart is needed:

1. **Azure Portal:**
   - Go to Container Apps
   - Select `bsg-demo-backend`
   - Click **Restart** or update the revision

2. **Check Logs After Restart:**
   - Look for "Event Hub adapter started successfully"
   - Check for any configuration errors
   - Verify EventHub connection

3. **Verify After Restart:**
   - Test health endpoint
   - Check EventHub health endpoint
   - Verify connection status in UI

## Manual EventHub Start

If EventHub adapter failed to start, you can manually start it:

```bash
# POST request to start endpoint
curl -X POST https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1/components/data-architecture/events/start
```

Expected response:
```json
{
  "success": true,
  "message": "Event Hub adapter started successfully",
  "status": "healthy"
}
```