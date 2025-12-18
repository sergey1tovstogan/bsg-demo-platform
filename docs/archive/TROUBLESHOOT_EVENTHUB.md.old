# Troubleshooting: Events Not Appearing in Kafka Event Stream

## Issue
Customer was created successfully (customerId: 190583), event is visible in Azure Portal, but not showing in the Kafka Event Stream UI.

## Quick Diagnosis Steps

### Step 1: Check if Backend is Running
```bash
curl http://localhost:8000/api/v1/health
```

### Step 2: Check Event Hub Consumer Status
```bash
curl http://localhost:8000/api/v1/events/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "running": true,
  "buffer_size": <number>,
  "topic": "modelbank-event-topic",
  "consumer_group": "$Default"
}
```

**If `running: false`** → Event Hub consumer is not started. See "Fix: Start Event Hub Consumer" below.

### Step 3: Check if Events are Being Received
```bash
curl "http://localhost:8000/api/v1/events?limit=10"
```

**If empty array `[]`** → No events in buffer. See "Fix: Events Not Being Received" below.

### Step 4: Test Customer Filter
```bash
curl "http://localhost:8000/api/v1/events?customer_id=190583&limit=10"
```

**If empty** → Events might have different entityid or consumer started after events were sent.

## Common Issues and Fixes

### Issue 1: Event Hub Consumer Not Running

**Symptoms:**
- Health check shows `"running": false`
- Backend logs don't show "Event Hub consumer started"
- Buffer size stays at 0

**Fix:**

1. **Check Environment Variables:**
   ```bash
   # Windows PowerShell
   echo $env:EVENTHUB_CONNECTION_STRING
   echo $env:EVENTHUB_NAME
   ```

2. **Set Environment Variables:**
   ```powershell
   $env:EVENTHUB_CONNECTION_STRING="Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI="
   $env:EVENTHUB_NAME="modelbank-event-topic"
   ```

3. **Restart Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

4. **Check Logs:**
   Look for: `INFO: Event Hub consumer started for topic: modelbank-event-topic`

### Issue 2: Events Not Being Received

**Symptoms:**
- Consumer is running (`running: true`)
- Buffer size is 0
- Events exist in Azure Portal

**Possible Causes:**

1. **Consumer Started After Events Were Sent**
   - The consumer starts from the latest position by default
   - **Fix:** Send a new event after the consumer has started

2. **Wrong Consumer Group**
   - Another consumer might be reading from the same consumer group
   - **Fix:** Use a unique consumer group name

3. **Connection Issues**
   - Check backend logs for errors
   - Verify connection string is correct
   - Check network connectivity to Azure

### Issue 3: Events Not Filtering by Customer ID

**Symptoms:**
- Events appear in `/events` endpoint
- But not when filtering by `customer_id=190583`

**Fix:**
- Verify the event's `entityid` field matches the customerId
- Check event payload structure in Azure Portal
- The frontend now passes `customer_id` parameter automatically

### Issue 4: Frontend Not Fetching Events

**Symptoms:**
- Backend has events
- Frontend shows "No events emitted yet"

**Fix:**
1. **Check Browser Console** for errors
2. **Verify API URL** - Should be `/api/v1/events/recent?customer_id=190583`
3. **Check Network Tab** - Look for failed requests to `/api/v1/events`
4. **Verify Event Store is Enabled** - Check if `ENABLE_REAL_EVENTS: true` in config

## Diagnostic Script

Run the diagnostic script to check everything:

```bash
cd backend
python check_eventhub_status.py
```

This will show:
- Configuration status
- Consumer health
- Recent events
- Customer filter test

## Step-by-Step Verification

1. ✅ **Backend is running**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. ✅ **Event Hub consumer is running**
   ```bash
   curl http://localhost:8000/api/v1/events/health
   # Should show: "running": true
   ```

3. ✅ **Environment variables are set**
   - Check backend logs on startup
   - Should see: "Event Hub consumer started"

4. ✅ **Events are being received**
   ```bash
   curl http://localhost:8000/api/v1/events?limit=5
   # Should return events array
   ```

5. ✅ **Customer filter works**
   ```bash
   curl "http://localhost:8000/api/v1/events?customer_id=190583"
   # Should return events for this customer
   ```

6. ✅ **Frontend can fetch events**
   - Open browser DevTools → Network tab
   - Create a new customer
   - Check for request to `/api/v1/events/recent?customer_id=190583`
   - Verify response contains events

## Quick Fix Checklist

- [ ] Backend is running
- [ ] Environment variables are set (`EVENTHUB_CONNECTION_STRING`, `EVENTHUB_NAME`)
- [ ] Backend was restarted after setting environment variables
- [ ] Event Hub consumer started (check logs)
- [ ] Events are in buffer (check `/events` endpoint)
- [ ] Customer filter works (check `/events?customer_id=190583`)
- [ ] Frontend is calling the API (check browser console)
- [ ] New event sent after consumer started

## Still Not Working?

1. **Check Backend Logs:**
   - Look for errors related to Event Hub
   - Check for "Event Hub consumer started" message
   - Look for any authentication errors

2. **Verify Event Structure:**
   - Check Azure Portal → Event Hub → Events
   - Verify `entityid` field matches customerId (190583)
   - Check event timestamp

3. **Test Direct API Call:**
   ```bash
   curl "http://localhost:8000/api/v1/events/recent?customer_id=190583&minutes=5&limit=10"
   ```

4. **Check Frontend Console:**
   - Open browser DevTools
   - Look for errors in Console tab
   - Check Network tab for failed API calls

## Next Steps

After fixing the issue:
1. Create a new customer to test
2. Verify events appear in Kafka Event Stream
3. Check that events are filtered correctly by customer ID

