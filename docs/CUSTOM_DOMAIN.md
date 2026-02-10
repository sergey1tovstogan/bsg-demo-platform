# Custom Domain: demo-platform.bsg.temenos.com

The platform supports the custom domain `https://demo-platform.bsg.temenos.com` in addition to the default Azure Static Web Apps URL.

## Azure Configuration

1. **Azure Portal** → **Static Web Apps** → `bsg-demo-platform-4077`
2. **Custom domains** → **Add**
3. Enter: `demo-platform.bsg.temenos.com`
4. Add the CNAME record in your DNS provider:
   - **Name**: `demo-platform.bsg` (or full subdomain as required)
   - **Value**: `kind-beach-01c0a990f.3.azurestaticapps.net`
5. Wait for validation (Azure will verify the CNAME)

## Code Configuration

The following are already configured in the codebase:

- **Backend CORS**: `demo-platform.bsg.temenos.com` is allowed in `main.py` and `config.py`
- **Frontend API**: When hostname is `demo-platform.bsg.temenos.com`, the app uses the direct backend URL for API calls (same as azurestaticapps.net)

No code changes are needed when adding the custom domain—only Azure and DNS configuration.
