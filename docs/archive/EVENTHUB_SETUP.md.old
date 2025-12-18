# Event Hub Setup - Quick Start Guide

## What You Need to Provide

To configure the Azure Event Hub connection, I need the following information from you:

### 1. Event Hub Connection String

**What it looks like:**
```
Endpoint=sb://<your-namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy-name>;SharedAccessKey=<your-key>
```

**How to get it:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Event Hubs Namespace**
3. Click **Shared access policies** → Select a policy (or create one)
4. Copy the **Connection string-primary key**

**Important:** The policy must have **Listen** permission (at minimum).

### 2. Event Hub Name (Topic Name)

**Default:** `modelbank-event-topic`

**How to verify:**
1. In your Event Hub Namespace, go to **Event hubs**
2. Find the event hub you want to connect to
3. Copy the exact name (it's case-sensitive)

### 3. Consumer Group (Optional)

**Default:** `$Default`

You can use the default consumer group unless you need a specific one.

## Quick Configuration

### For Local Development

Create or edit `.env` file in the project root:

```env
EVENTHUB_CONNECTION_STRING=Endpoint=sb://<your-namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>
EVENTHUB_NAME=modelbank-event-topic
```

### For Azure App Service (Production)

**Option 1: Azure Portal**
1. Go to **App Services** → `bsg-demo-platform-app` → **Configuration**
2. Add application setting: `EVENTHUB_CONNECTION_STRING` = (your connection string)
3. Add application setting: `EVENTHUB_NAME` = `modelbank-event-topic`
4. Click **Save** and **Restart** the App Service

**Option 2: Azure CLI**
```bash
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group <your-resource-group> \
  --settings \
    EVENTHUB_CONNECTION_STRING="Endpoint=sb://..." \
    EVENTHUB_NAME="modelbank-event-topic"
```

## Testing the Connection

After configuration, test the connection:

```bash
cd backend
python test_eventhub_connection.py
```

Or check the health endpoint:
```bash
curl http://localhost:8000/api/v1/events/health
```

## What Happens Next

Once configured:

1. ✅ The Event Hub consumer will start automatically when the backend starts
2. ✅ Events will be streamed in real-time from `modelbank-event-topic`
3. ✅ Events will be buffered in memory (up to 1000 events by default)
4. ✅ You can filter events by customer ID: `/api/v1/events?customer_id=190579`
5. ✅ Events will appear in the Kafka Event Stream component in the frontend

## Need Help?

See the detailed guide: [docs/EVENTHUB_CONFIGURATION.md](docs/EVENTHUB_CONFIGURATION.md)

## Summary

**I need from you:**
1. ✅ Event Hub connection string (with Listen permission)
2. ✅ Event Hub name (confirm it's `modelbank-event-topic` or provide the correct name)

**You can provide:**
- The connection string and event hub name
- Or just confirm if you want me to help you find them in Azure Portal

