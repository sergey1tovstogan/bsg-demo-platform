# BSG Demo Platform — DEBUGGING (Authoritative)

## Purpose & Scope

This document provides **comprehensive guidance** for debugging the BSG Demo Platform in production (Azure).

It covers:
- How to access backend logs
- How to access frontend logs
- Log analysis and filtering
- Common debugging scenarios
- Cost calculation debugging

This document does NOT:
- Define local development debugging (see LOCAL_DEV.md)
- Replace troubleshooting guides (see TROUBLESHOOTING.md)
- Define observability standards (see OBSERVABILITY.md)

---

## Backend Logs (Azure App Service)

### Method 1: Azure Portal — Log Stream (Real-Time)

**Best for:** Real-time monitoring and immediate debugging

1. Go to https://portal.azure.com
2. Search for `bsg-demo-platform-app` (App Service)
3. In the left menu, under **Monitoring**, click **"Log stream"**
4. You'll see real-time logs as they're generated
5. Filter by clicking the filter icon and entering keywords

**Useful for:**
- Watching API requests in real-time
- Monitoring cost calculation requests
- Seeing authentication errors immediately

---

### Method 2: Azure Portal — Logs (Queryable)

**Best for:** Searching historical logs and filtering by criteria

1. In the App Service, under **Monitoring**, click **"Logs"**
2. Run KQL (Kusto Query Language) queries:

**View recent logs:**
```kusto
AppServiceConsoleLogs
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc
| take 100
```

**Filter by cost-related logs:**
```kusto
AppServiceConsoleLogs
| where Message contains "Cost Management" 
   or Message contains "cost"
   or Message contains "CostService"
| order by TimeGenerated desc
| take 50
```

**Filter by error logs:**
```kusto
AppServiceConsoleLogs
| where Level == "Error" or Level == "Warning"
| where TimeGenerated > ago(24h)
| order by TimeGenerated desc
```

**Filter by specific resource group:**
```kusto
AppServiceConsoleLogs
| where Message contains "tolis-gn" or Message contains "bbkcg"
| order by TimeGenerated desc
```

---

### Method 3: Azure CLI (Command Line)

**Best for:** Scripting and automation

**Stream logs in real-time:**
```bash
az webapp log tail \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

**Stream with filter:**
```bash
az webapp log tail \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --filter "Cost Management"
```

**Download recent logs:**
```bash
az webapp log download \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --log-file logs.zip
```

**View specific log files:**
```bash
az webapp log show \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

---

### Method 4: Kudu/SCM Site (Advanced)

**Best for:** Direct file access and advanced debugging

1. Go to: `https://bsg-demo-platform-app.scm.azurewebsites.net`
2. Click **"Debug console"** → **"CMD"** or **"PowerShell"**
3. Navigate to `LogFiles/Application` to view log files
4. Or use API: `https://bsg-demo-platform-app.scm.azurewebsites.net/api/logs/docker`

---

### Method 5: Application Insights (If Configured)

**Best for:** Advanced analytics and distributed tracing

1. In Azure Portal, search for **Application Insights**
2. Find the resource linked to your App Service
3. Use **"Logs"** to query with KQL
4. Use **"Metrics"** for performance monitoring

---

## Frontend Logs (Azure Static Web Apps)

### Browser Console

**Best for:** Client-side errors and API call debugging

1. Open the application: https://kind-beach-01c0a990f.3.azurestaticapps.net
2. Open browser Developer Tools (F12)
3. Go to **Console** tab
4. Look for errors, warnings, and API call logs

**Filtering:**
- Use browser console filter to search for specific errors
- Check **Network** tab for failed API requests
- Check **Application** tab → **Local Storage** for cached data

---

### Static Web Apps Logs

**Access via Azure Portal:**
1. Go to Azure Portal → Static Web Apps → `bsg-demo-platform-4077`
2. Under **Monitoring**, click **"Logs"**
3. Query deployment and runtime logs

---

## Debugging Cost Calculation

### Step 1: Enable Detailed Logging

The cost service includes detailed logging. When you trigger cost calculation, look for:

**Authentication:**
```
Attempting to get Azure access token for Cost Management API...
Successfully obtained Azure access token (token length: XXX)
```

**API Request:**
```
Cost Management API response for {resource_group_name}:
  Response keys: [...]
  Properties keys: [...]
  Rows count: X
  Columns: [...]
```

**Parsing:**
```
Parsing X cost rows for resource group {resource_group_name}
Column indices: ResourceType=X, ResourceId=Y, Cost=Z
Row 0: ResourceType=..., Cost=..., ResourceId=...
```

### Step 2: Check for Errors

**Common error patterns:**

**Authentication failures:**
```kusto
AppServiceConsoleLogs
| where Message contains "Failed to get access token"
| order by TimeGenerated desc
```

**API errors:**
```kusto
AppServiceConsoleLogs
| where Message contains "Cost Management API" 
   and (Message contains "error" or Message contains "failed")
| order by TimeGenerated desc
```

**Empty responses:**
```kusto
AppServiceConsoleLogs
| where Message contains "No cost data rows returned"
| order by TimeGenerated desc
```

### Step 3: Compare with Working Script

If your local script works but the app doesn't:

1. Check authentication method:
   - Script uses: `az rest` (Azure CLI authentication)
   - Backend uses: `DefaultAzureCredential` (Managed Identity)

2. Verify Managed Identity has permissions:
   - Role: "Cost Management Reader" on subscription
   - Check: Azure Portal → Subscription → Access control (IAM)

3. Check API response structure:
   - Logs show exact response structure
   - Compare with script output format

---

## Enabling Detailed Logging

### Backend Logging Levels

Set in Azure App Service Configuration:

```bash
# Enable verbose logging
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --settings LOG_LEVEL=DEBUG

# Enable application logging
az webapp log config \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --application-logging filesystem \
  --level verbose

# Enable web server logging
az webapp log config \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --web-server-logging filesystem
```

---

## Common Debugging Scenarios

### Scenario 1: Cost Calculation Returns $0

**Step 1: Check if cost calculation is triggered**

Search for cost-related API calls:
```kusto
AppServiceConsoleLogs
| where Message contains "cost" or Message contains "Cost"
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc
```

**Step 2: Check authentication**

Look for token acquisition:
```kusto
AppServiceConsoleLogs
| where Message contains "Attempting to get Azure access token" 
   or Message contains "Successfully obtained Azure access token"
   or Message contains "Failed to get access token"
| order by TimeGenerated desc
```

**Step 3: Check API request/response**

Look for API responses:
```kusto
AppServiceConsoleLogs
| where Message contains "Cost Management API response"
| order by TimeGenerated desc
| take 30
```

Expected log messages:
- `"Attempting to get Azure access token for Cost Management API..."`
- `"Successfully obtained Azure access token (token length: XXX)"`
- `"Cost Management API response for {resource_group_name}"`
- `"Response keys: [...]"`
- `"Properties keys: [...]"`
- `"Rows count: X"`
- `"Columns: [...]"`

**Step 4: Check parsing**

Look for parsing logs:
```kusto
AppServiceConsoleLogs
| where Message contains "Parsing" and Message contains "cost rows"
   or Message contains "Column indices"
   or Message contains "Error parsing cost row"
| order by TimeGenerated desc
```

**Step 5: Check for errors**

Look for any errors:
```kusto
AppServiceConsoleLogs
| where Level == "Error" or Level == "Warning"
| where Message contains "cost" or Message contains "Cost Management"
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc
```

**Common Issues:**

1. **No logs found**: Cost calculation may not be triggered
   - Check if "Include Cost Analysis" checkbox is enabled
   - Verify resource groups are selected

2. **Authentication fails**: `"Failed to get access token"`
   - Managed Identity may not have permissions
   - Check Azure Portal → Subscription → Access control (IAM)

3. **No rows returned**: `"Rows count: 0"`
   - Cost data may take 24-48 hours to appear
   - Verify date range (uses last full calendar month)

4. **Parsing errors**: `"Error parsing cost row"` or `"Could not find required columns"`
   - API response structure may have changed
   - Check column names in logs

**Quick Query (All Cost Logs):**
```kusto
AppServiceConsoleLogs
| where Message contains "Cost Management"
   or (Message contains "cost" and Message contains "service")
| where TimeGenerated > ago(24h)
| order by TimeGenerated desc
| take 100
```

---

### Scenario 2: API Calls Failing

**Check logs for:**
1. CORS errors
2. Authentication errors
3. Network timeouts
4. Rate limiting (429 errors)

**Query:**
```kusto
AppServiceConsoleLogs
| where Level == "Error" or Level == "Warning"
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc
```

---

### Scenario 3: RAG API Not Working

**Check logs for:**
1. JWT token validation
2. RAG API connection errors
3. Timeout errors

**Query:**
```kusto
AppServiceConsoleLogs
| where Message contains "RAG" or Message contains "rag"
| order by TimeGenerated desc
| take 30
```

---

## Log Format

The platform uses structured JSON logging:

```json
{
  "timestamp": "2026-01-16T17:30:00Z",
  "level": "INFO",
  "logger": "app.services.cost_service",
  "message": "Parsing 5 cost rows for resource group tolis-gn",
  "module": "cost_service",
  "function": "_parse_cost_result",
  "line": 462
}
```

**Key fields:**
- `timestamp` - UTC timestamp
- `level` - Log level (DEBUG, INFO, WARNING, ERROR)
- `logger` - Logger name (shows which module)
- `message` - Log message
- `module` - Python module name
- `function` - Function name
- `line` - Line number

---

## Best Practices

1. **Start with Log Stream** for real-time issues
2. **Use Logs queries** for historical analysis
3. **Filter by time range** to narrow down issues
4. **Search for specific keywords** (error messages, resource names)
5. **Compare timestamps** with user-reported issues
6. **Check authentication logs first** for permission issues

---

## Related Documentation

- **OBSERVABILITY.md** - Logging standards and observability rules
- **TROUBLESHOOTING.md** - Common issues and solutions
- **DEPLOYMENT.md** - Deployment procedures
- **LOCAL_DEV.md** - Local development debugging

---

Last updated: 2026-01-16
Maintained by the BSG Team
