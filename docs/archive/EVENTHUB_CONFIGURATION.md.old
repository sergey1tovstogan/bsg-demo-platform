# Azure Event Hub Configuration Guide

This guide explains how to configure the Azure Event Hub connection for the BSG Demo Platform.

## Overview

The platform connects directly to Azure Event Hub to stream events from the `modelbank-event-topic` topic. Events are consumed in real-time and can be filtered by `customerId` for display in the Kafka Event Stream component.

## Required Information

To configure the Event Hub connection, you need:

1. **Event Hub Connection String** - Contains the namespace endpoint and SAS key
2. **Event Hub Name** - The topic/event hub name (default: `modelbank-event-topic`)
3. **Consumer Group** - Consumer group name (default: `$Default`)

## Getting the Connection String from Azure Portal

### Step 1: Navigate to Event Hub Namespace

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Event Hubs** → Your Event Hub Namespace
3. Click on **Shared access policies** in the left sidebar

### Step 2: Get Connection String

1. Click on a policy (e.g., `RootManageSharedAccessKey`) or create a new one
2. Click on **Connection string-primary key** or **Connection string-secondary key**
3. Copy the connection string

**Connection String Format:**
```
Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy-name>;SharedAccessKey=<key>
```

### Step 3: Verify Event Hub Name

1. In the Event Hub Namespace, click on **Event hubs** in the left sidebar
2. Find your event hub (should be `modelbank-event-topic`)
3. Note the exact name (case-sensitive)

## Configuration Methods

### Option 1: Azure App Service (Production)

**Using Azure Portal:**

1. Go to **App Services** → `bsg-demo-platform-app` → **Configuration**
2. Click **Application settings** tab
3. Click **+ New application setting**
4. Add the following settings:

| Name | Value | Description |
|------|-------|-------------|
| `EVENTHUB_CONNECTION_STRING` | `Endpoint=sb://...` | Event Hub connection string |
| `EVENTHUB_NAME` | `modelbank-event-topic` | Event Hub topic name |
| `EVENTHUB_CONSUMER_GROUP` | `$Default` | Consumer group (optional, defaults to $Default) |
| `EVENTHUB_BUFFER_SIZE` | `1000` | Max events to buffer (optional, defaults to 1000) |

5. Click **Save**
6. **Restart the App Service** for changes to take effect

**Using Azure CLI:**

```bash
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group <resource-group-name> \
  --settings \
    EVENTHUB_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>" \
    EVENTHUB_NAME="modelbank-event-topic" \
    EVENTHUB_CONSUMER_GROUP="$Default"
```

### Option 2: Local Development (.env file)

1. Create or edit `.env` file in the project root:

```env
# Azure Event Hub Configuration
EVENTHUB_CONNECTION_STRING=Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>
EVENTHUB_NAME=modelbank-event-topic
EVENTHUB_CONSUMER_GROUP=$Default
EVENTHUB_BUFFER_SIZE=1000
```

2. The `.env` file is automatically loaded by the application (see `app/core/config.py`)

**Note:** Never commit `.env` files to version control. Add `.env` to `.gitignore`.

### Option 3: Environment Variables (Direct)

Set environment variables directly:

**Windows (PowerShell):**
```powershell
$env:EVENTHUB_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>"
$env:EVENTHUB_NAME="modelbank-event-topic"
```

**Linux/Mac:**
```bash
export EVENTHUB_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>"
export EVENTHUB_NAME="modelbank-event-topic"
```

## Required Permissions

The connection string must have the following permissions:

- **Listen** - Required to consume events from the Event Hub
- **Manage** - Optional, but recommended for better control

**To check/update permissions:**

1. Go to Event Hub Namespace → **Shared access policies**
2. Click on your policy
3. Ensure **Listen** checkbox is checked
4. For full control, also check **Manage**

## Verification

### Step 1: Check Configuration

After setting the environment variables, verify they're loaded:

**Using API Health Check:**
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

### Step 2: Test Event Consumption

1. **Start the backend application**
2. **Check logs** for Event Hub connection messages:
   ```
   INFO: Event Hub consumer started for topic: modelbank-event-topic
   ```

3. **Send a test event** to the Event Hub (if you have access)
4. **Query events API:**
   ```bash
   curl http://localhost:8000/api/v1/events?limit=10
   ```

### Step 3: Test Customer Filtering

Filter events by customer ID:
```bash
curl "http://localhost:8000/api/v1/events?customer_id=190579&limit=10"
```

This should return only events where `entityid` equals `190579`.

## Troubleshooting

### Issue: "EVENTHUB_CONNECTION_STRING not configured"

**Solution:**
- Ensure the environment variable is set correctly
- Check for typos in the variable name (must be exactly `EVENTHUB_CONNECTION_STRING`)
- Restart the application after setting environment variables

### Issue: "Event Hub consumer error: Authentication failed"

**Solution:**
- Verify the connection string is correct and complete
- Check that the SAS key hasn't expired
- Ensure the Shared Access Policy has **Listen** permission
- Verify the Event Hub namespace name is correct

### Issue: "Event Hub consumer error: Event Hub not found"

**Solution:**
- Verify `EVENTHUB_NAME` matches the exact Event Hub name (case-sensitive)
- Check that the Event Hub exists in the namespace
- Ensure the connection string points to the correct namespace

### Issue: "No events appearing in buffer"

**Possible causes:**
1. **Consumer started from latest position** - The consumer starts from the latest events by default (`starting_position="-1"`)
   - **Solution:** Wait for new events to arrive, or modify the code to start from earliest events
   
2. **No events being sent** - Verify events are actually being sent to the Event Hub
   - **Solution:** Check Event Hub metrics in Azure Portal

3. **Consumer group issue** - Another consumer might be reading from the same consumer group
   - **Solution:** Use a unique consumer group name

### Issue: "Buffer size limit reached"

**Solution:**
- Increase `EVENTHUB_BUFFER_SIZE` (default: 1000)
- The buffer is circular, so oldest events are automatically removed
- Consider implementing persistent storage if you need to retain more events

## Security Best Practices

1. **Use separate SAS policies** for production vs development
2. **Rotate SAS keys regularly** (every 90 days recommended)
3. **Use Managed Identity** instead of connection strings when possible (future enhancement)
4. **Never commit connection strings** to version control
5. **Use Azure Key Vault** for storing secrets in production

## Next Steps

After configuration:

1. ✅ Verify connection with health check endpoint
2. ✅ Test event consumption
3. ✅ Test customer ID filtering
4. ✅ Monitor Event Hub consumer in application logs
5. ✅ Check Event Hub metrics in Azure Portal

## Support

If you encounter issues:

1. Check application logs for detailed error messages
2. Verify Event Hub configuration in Azure Portal
3. Test connection string with Azure Event Hub Explorer tool
4. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

