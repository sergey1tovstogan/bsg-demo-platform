# Event Hub Connection - Configured ✅

## Connection Details

**Namespace:** `bbkeventstoreehnseventstore`  
**Event Hub Name:** `modelbank-event-topic`  
**Consumer Group:** `$Default`  
**Policy:** `RootManageSharedAccessKey`

## Connection String

```
Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=
```

## Configuration Steps

### Option 1: Local Development (.env file)

1. **Create `.env` file** in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. **The connection string is already in `.env.example`** - just copy it to `.env`:
   ```env
   EVENTHUB_CONNECTION_STRING=Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=
   EVENTHUB_NAME=modelbank-event-topic
   ```

3. **Start the backend** - the Event Hub consumer will start automatically

### Option 2: Azure App Service (Production)

**Using Azure Portal:**

1. Go to **App Services** → `bsg-demo-platform-app` → **Configuration**
2. Click **Application settings** tab
3. Click **+ New application setting**
4. Add these settings:

   | Name | Value |
   |------|-------|
   | `EVENTHUB_CONNECTION_STRING` | `Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=` |
   | `EVENTHUB_NAME` | `modelbank-event-topic` |

5. Click **Save**
6. **Restart the App Service** (important!)

**Using Azure CLI:**

```bash
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group <your-resource-group> \
  --settings \
    EVENTHUB_CONNECTION_STRING="Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=" \
    EVENTHUB_NAME="modelbank-event-topic"
```

Then restart:
```bash
az webapp restart --name bsg-demo-platform-app --resource-group <your-resource-group>
```

## Testing the Connection

### Test Script

Run the test script to verify the connection:

```bash
cd backend
python test_eventhub_connection.py
```

Expected output:
```
✅ EVENTHUB_CONNECTION_STRING is set
✅ EVENTHUB_NAME: modelbank-event-topic
✅ Event Hub consumer started successfully
✅ Consumer is healthy and ready to receive events
```

### API Health Check

After starting the backend:

```bash
curl http://localhost:8000/api/v1/events/health
```

Expected response:
```json
{
  "status": "healthy",
  "running": true,
  "buffer_size": 0,
  "topic": "modelbank-event-topic",
  "consumer_group": "$Default"
}
```

### Test Event Retrieval

```bash
# Get all events
curl http://localhost:8000/api/v1/events?limit=10

# Filter by customer ID
curl "http://localhost:8000/api/v1/events?customer_id=190579&limit=10"
```

## What Happens Next

Once configured:

1. ✅ **Backend starts** → Event Hub consumer starts automatically
2. ✅ **Events stream in** → Real-time events from `modelbank-event-topic`
3. ✅ **Events buffer** → Stored in memory (up to 1000 events)
4. ✅ **API available** → `/api/v1/events` endpoint serves events
5. ✅ **Customer filtering** → Filter by `customer_id` parameter
6. ✅ **Frontend displays** → Events appear in Kafka Event Stream component

## Verification Checklist

- [ ] Connection string configured (`.env` or App Service)
- [ ] Backend application started
- [ ] Health check returns "healthy"
- [ ] Events are being received (check buffer_size > 0)
- [ ] Customer filtering works (`?customer_id=190579`)

## Troubleshooting

If the consumer doesn't start:

1. **Check logs** - Look for "Event Hub consumer started" message
2. **Verify connection string** - Ensure it's exactly as shown above
3. **Check permissions** - RootManageSharedAccessKey should have Listen permission
4. **Verify Event Hub exists** - Confirm `modelbank-event-topic` exists in the namespace
5. **Check network** - Ensure the application can reach Azure Service Bus

## Security Note

⚠️ **Important:** The connection string contains sensitive credentials. 
- Never commit `.env` files to version control
- Use Azure Key Vault for production secrets
- Rotate keys regularly (every 90 days recommended)

