# Test Event Hub Connection

## Quick Test Instructions

### Step 1: Set Environment Variables

**Windows PowerShell:**
```powershell
$env:EVENTHUB_CONNECTION_STRING="Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI="
$env:EVENTHUB_NAME="modelbank-event-topic"
```

**Windows CMD:**
```cmd
set EVENTHUB_CONNECTION_STRING=Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=
set EVENTHUB_NAME=modelbank-event-topic
```

**Linux/Mac:**
```bash
export EVENTHUB_CONNECTION_STRING="Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI="
export EVENTHUB_NAME="modelbank-event-topic"
```

### Step 2: Run Test Script

```bash
cd backend
python test_eventhub_connection.py
```

### Step 3: Expected Output

You should see:
```
✅ EVENTHUB_CONNECTION_STRING is set
✅ EVENTHUB_NAME: modelbank-event-topic
✅ Event Hub consumer started successfully
✅ Consumer is healthy and ready to receive events
```

## Alternative: Test via Backend API

### Step 1: Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

### Step 2: Check Health Endpoint

Open browser or use curl:
```
http://localhost:8000/api/v1/events/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "running": true,
  "buffer_size": 0,
  "topic": "modelbank-event-topic",
  "consumer_group": "$Default"
}
```

### Step 3: Check Backend Logs

Look for these log messages:
```
INFO: Event Hub consumer started for topic: modelbank-event-topic
INFO: Buffered event: <event-id> (customerId: <id>)
```

### Step 4: Test Event Retrieval

```bash
# Get all events
curl http://localhost:8000/api/v1/events?limit=10

# Filter by customer ID
curl "http://localhost:8000/api/v1/events?customer_id=190579&limit=10"
```

## Troubleshooting

### If you see "EVENTHUB_CONNECTION_STRING not configured"

- Ensure environment variables are set in the same terminal session
- Or create a `.env` file in the project root with:
  ```
  EVENTHUB_CONNECTION_STRING=Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=
  EVENTHUB_NAME=modelbank-event-topic
  ```

### If you see "Authentication failed"

- Verify the connection string is correct
- Check that the SAS key hasn't expired
- Ensure RootManageSharedAccessKey has Listen permission

### If you see "Event Hub not found"

- Verify the Event Hub name is exactly `modelbank-event-topic` (case-sensitive)
- Check that the Event Hub exists in the namespace

### If buffer_size stays at 0

- This is normal if no events are currently being sent to the Event Hub
- Wait for new events to arrive
- Check Event Hub metrics in Azure Portal to verify events are being sent

## Success Indicators

✅ Health endpoint returns `"status": "healthy"`  
✅ Backend logs show "Event Hub consumer started"  
✅ `buffer_size` increases when events arrive  
✅ Events API returns data (when events are available)  
✅ Customer filtering works (`?customer_id=190579`)

