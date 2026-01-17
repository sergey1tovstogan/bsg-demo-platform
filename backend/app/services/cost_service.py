"""
Azure Cost Management Service

Provides cost calculation functionality using Azure Cost Management REST API.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from app.core.logging import get_logger
from azure.identity import DefaultAzureCredential
import requests
import time
import json

logger = get_logger(__name__)


class CostService:
    """Service for calculating Azure costs using Cost Management API."""
    
    def __init__(self, subscription_id: str):
        """Initialize the cost service."""
        self.subscription_id = subscription_id
        self.base_url = "https://management.azure.com"
        self.credential = DefaultAzureCredential()
        self.access_token: Optional[str] = None
    
    def _get_access_token(self) -> str:
        """Get access token for Azure Management API."""
        if self.access_token is None:
            try:
                logger.info("Attempting to get Azure access token for Cost Management API...")
                token_response = self.credential.get_token("https://management.azure.com/.default")
                self.access_token = token_response.token
                logger.info(f"Successfully obtained Azure access token for Cost Management API (token length: {len(self.access_token)})")
            except Exception as e:
                logger.error(f"Failed to get access token: {e}", exc_info=True)
                raise RuntimeError(f"Authentication failed: {str(e)}")
        
        return self.access_token
    
    def _make_api_request(self, url: str, method: str = "GET", data: Dict = None, max_retries: int = 3) -> Dict:
        """Make authenticated API request to Azure REST API with retry logic."""
        try:
            token = self._get_access_token()
        except Exception as e:
            logger.error(f"Failed to get access token for Cost Management API: {e}")
            return {
                "error": f"Authentication failed: {str(e)}. Please verify Azure credentials are configured correctly.",
                "status_code": 401
            }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "bsg-demo-platform/1.0"
        }
        
        last_error = None
        for attempt in range(max_retries):
            try:
                if method == "GET":
                    response = requests.get(url, headers=headers, timeout=30)
                elif method == "POST":
                    response = requests.post(url, headers=headers, json=data, timeout=30)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                # Handle rate limiting (429) with exponential backoff
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) * 2  # 2, 4, 8 seconds
                        logger.warning(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error("Rate limit exceeded after all retries")
                        return {"error": "Rate limit exceeded", "status_code": 429}
                
                # Check for HTTP errors
                if response.status_code >= 400:
                    error_detail = {}
                    try:
                        error_detail = response.json()
                    except:
                        error_detail = {"message": response.text[:200]}
                    
                    # Extract more detailed error message
                    error_message = "Unknown error"
                    if isinstance(error_detail, dict):
                        if 'error' in error_detail and isinstance(error_detail['error'], dict):
                            error_message = error_detail['error'].get('message', str(error_detail.get('message', 'Unknown error')))
                        elif 'message' in error_detail:
                            error_message = error_detail['message']
                        else:
                            error_message = str(error_detail)
                    else:
                        error_message = str(error_detail)
                    
                    logger.error(f"Cost Management API request failed with status {response.status_code}: {error_message}")
                    return {
                        "error": f"HTTP {response.status_code}: {error_message}",
                        "status_code": response.status_code,
                        "detail": error_detail
                    }
                
                response.raise_for_status()
                result_json = response.json()
                
                # Log response structure for debugging (first 500 chars to avoid huge logs)
                logger.debug(f"Cost Management API response structure: {str(result_json)[:500]}")
                if isinstance(result_json, dict):
                    logger.debug(f"Response top-level keys: {list(result_json.keys())}")
                    if 'properties' in result_json:
                        logger.debug(f"Properties keys: {list(result_json['properties'].keys()) if isinstance(result_json['properties'], dict) else 'Not a dict'}")
                
                return result_json
                
            except requests.exceptions.Timeout as e:
                last_error = f"Request timeout: {str(e)}"
                if attempt < max_retries - 1:
                    logger.warning(f"Request timeout, retrying in 2s: {e}")
                    time.sleep(2)
                    continue
                else:
                    logger.error(f"Request timeout after {max_retries} attempts: {e}")
                    return {"error": last_error, "status_code": 504}
            except requests.exceptions.RequestException as e:
                last_error = str(e)
                if attempt < max_retries - 1:
                    logger.warning(f"API request failed, retrying in 2s: {e}")
                    time.sleep(2)
                    continue
                else:
                    logger.error(f"API request failed after {max_retries} attempts: {e}")
                    return {"error": last_error, "status_code": 500}
        
        return {"error": last_error or "Unknown error", "status_code": 500}
    
    def get_resource_group_costs(
        self, 
        resource_group_name: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get cost data for a specific resource group.
        
        Args:
            resource_group_name: Name of the resource group
            start_date: Start date for cost calculation (defaults to first day of current month)
            end_date: End date for cost calculation (defaults to current date)
            
        Returns:
            Dictionary with cost information including total cost, service breakdown, and projections
        """
        try:
            # Default to current month if dates not provided (matching working script)
            if end_date is None:
                end_date = datetime.now()
            if start_date is None:
                # First day of current month
                start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Use subscription scope
            scope = f"/subscriptions/{self.subscription_id}"
            
            # Query with resource group filter (matching working script structure)
            query_definition = {
                "type": "ActualCost",
                "timeframe": "Custom",
                "timePeriod": {
                    "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                    "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                },
                "dataset": {
                    "granularity": "Daily",
                    "aggregation": {
                        "totalCost": {
                            "name": "PreTaxCost",
                            "function": "Sum"
                        }
                    },
                    "grouping": [
                        {
                            "type": "Dimension",
                            "name": "ResourceGroup"
                        },
                        {
                            "type": "Dimension",
                            "name": "ServiceName"
                        }
                    ],
                    "filter": {
                        "dimensions": {
                            "name": "ResourceGroup",
                            "operator": "In",
                            "values": [resource_group_name]
                        }
                    }
                }
            }
            
            # Make REST API call - try resource group scope first (matching working script)
            rg_scope = f"/subscriptions/{self.subscription_id}/resourceGroups/{resource_group_name}"
            url = f"{self.base_url}{rg_scope}/providers/Microsoft.CostManagement/query?api-version=2022-10-01"
            result = self._make_api_request(url, "POST", query_definition)
            
            # If that fails, try subscription scope (matching working script)
            if not result or result.get('error') or not result.get('properties', {}).get('rows'):
                logger.info(f"Resource group scope query failed or returned no data, trying subscription scope")
                url = f"{self.base_url}{scope}/providers/Microsoft.CostManagement/query?api-version=2022-10-01"
                result = self._make_api_request(url, "POST", query_definition)
            
            # Check if the result contains an error
            if result.get('error'):
                error_msg = result.get('error', 'Unknown error')
                status_code = result.get('status_code', 500)
                error_detail = result.get("detail", {})
                
                # If still has error, format it properly
                if result.get('error'):
                    # Provide more specific error messages based on status code
                    error_msg = result.get('error', 'Unknown error')
                    if status_code == 403:
                        error_msg = f'Permission denied. Verify you have "Cost Management Reader" role on subscription "{self.subscription_id}". You may need to contact your Azure administrator to grant this role.'
                    elif status_code == 404:
                        error_msg = f'Resource group "{resource_group_name}" not found or cost data not available. Cost data may take 24-48 hours to appear after resource creation.'
                    elif status_code == 429:
                        error_msg = f'Rate limit exceeded. Azure Cost Management API is throttling requests. Please wait a few minutes and try again.'
                    elif "timeout" in error_msg.lower() or status_code == 504:
                        error_msg = f'Request timeout. Azure Cost Management API is taking too long to respond. Try again later or select fewer resource groups.'
                    elif status_code >= 500:
                        error_msg = f'Azure Cost Management API server error ({status_code}). The service may be experiencing issues. Please try again later.'
                    
                    return {
                        'resource_group': resource_group_name,
                        'total_cost': 0.0,
                        'services': {},
                        'error': error_msg,
                        'error_detail': error_detail,
                        'status_code': status_code,
                        'start_date': start_date.isoformat(),
                        'end_date': end_date.isoformat()
                    }
            
            # Check if we got valid data
            # IMPORTANT: Check for error first before checking rows
            if result.get('error'):
                # Already handled above, but double-check
                error_msg = result.get('error', 'Unknown error')
                return {
                    'resource_group': resource_group_name,
                    'total_cost': 0.0,
                    'services': {},
                    'error': f'Cost Management API error: {error_msg}. Please verify you have "Cost Management Reader" role on the subscription.',
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            
            # Log the full response structure for debugging
            logger.info(f"Cost Management API response for {resource_group_name}:")
            logger.info(f"  Response type: {type(result)}")
            logger.info(f"  Response keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
            if isinstance(result, dict) and 'properties' in result:
                props = result['properties']
                logger.info(f"  Properties keys: {list(props.keys()) if isinstance(props, dict) else 'Not a dict'}")
                if 'rows' in props:
                    rows = props['rows']
                    logger.info(f"  Rows type: {type(rows)}")
                    logger.info(f"  Rows count: {len(rows) if isinstance(rows, list) else 'Not a list'}")
                    if isinstance(rows, list) and len(rows) > 0:
                        logger.info(f"  First row sample: {rows[0] if len(rows) > 0 else 'N/A'}")
                if 'columns' in props:
                    columns = props.get('columns', [])
                    logger.info(f"  Columns: {[col.get('name', '') for col in columns] if isinstance(columns, list) else 'Not a list'}")
                    logger.info(f"  Columns count: {len(columns) if isinstance(columns, list) else 0}")
            
            # Check if we got valid data with rows (matching working script logic)
            if result and isinstance(result, dict) and 'properties' in result:
                props = result['properties']
                rows = props.get('rows', [])
                if rows and isinstance(rows, list) and len(rows) > 0:
                    logger.info(f"✓ Found {len(rows)} cost rows for {resource_group_name}, parsing...")
                    parsed_result = self._parse_cost_result(result, resource_group_name, start_date, end_date)
                    logger.info(f"✓ Parsed result: total_cost={parsed_result.get('total_cost', 0)}, services={len(parsed_result.get('services', {}))}")
                    return parsed_result
                else:
                    logger.warning(f"⚠ No cost data rows returned for {resource_group_name} (empty rows array: {rows}), trying grouped query without filter")
                    logger.debug(f"Full response structure: {json.dumps(result, indent=2, default=str)[:1000]}")
            else:
                logger.warning(f"⚠ No cost data returned for {resource_group_name} (missing properties/rows), trying grouped query without filter")
                logger.debug(f"Full response: {result}")
            
            # Try grouped query without filter as fallback (matching working script)
            grouped_query = {
                "type": "ActualCost",
                "timeframe": "Custom",
                "timePeriod": {
                    "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                    "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                },
                "dataset": {
                    "granularity": "Daily",
                    "aggregation": {
                        "totalCost": {
                            "name": "PreTaxCost",
                            "function": "Sum"
                        }
                    },
                    "grouping": [
                        {
                            "type": "Dimension",
                            "name": "ResourceGroup"
                        },
                        {
                            "type": "Dimension",
                            "name": "ServiceName"
                        }
                    ]
                }
            }
            
            grouped_result = self._make_api_request(url, "POST", grouped_query)
            
            # Check for errors in grouped result
            if grouped_result.get('error'):
                error_msg = grouped_result.get('error', 'Unknown error')
                return {
                    'resource_group': resource_group_name,
                    'total_cost': 0.0,
                    'services': {},
                    'error': f'Cost Management API error: {error_msg}. Please verify you have "Cost Management Reader" role on the subscription.',
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            
            if grouped_result and 'properties' in grouped_result and 'rows' in grouped_result['properties']:
                rows = grouped_result['properties']['rows']
                if rows and len(rows) > 0:
                    return self._parse_cost_result(grouped_result, resource_group_name, start_date, end_date)
            
            # No data found - return with helpful message
            return {
                'resource_group': resource_group_name,
                'total_cost': 0.0,
                'services': {},
                'error': 'No cost data found for the specified period. Cost data may take 24-48 hours to appear after resource creation.',
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
                
        except Exception as e:
            logger.error(f"Error getting costs for resource group {resource_group_name}: {e}", exc_info=True)
            return {
                'resource_group': resource_group_name,
                'total_cost': 0.0,
                'services': {},
                'error': f'Cost Management API error: {str(e)}',
                'start_date': start_date.isoformat() if start_date else None,
                'end_date': end_date.isoformat() if end_date else None
            }
    
    def get_multiple_resource_group_costs(
        self,
        resource_group_names: List[str],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get cost data for multiple resource groups.
        
        Args:
            resource_group_names: List of resource group names
            start_date: Start date for cost calculation
            end_date: End date for cost calculation
            
        Returns:
            List of cost information dictionaries
        """
        results = []
        total = len(resource_group_names)
        
        logger.info(f"Fetching costs for {total} resource groups...")
        
        # For large batches, reduce delay and process more efficiently
        delay = 0.2 if total > 20 else 0.5
        
        for idx, rg_name in enumerate(resource_group_names, 1):
            try:
                logger.info(f"Processing resource group {idx}/{total}: {rg_name}")
                cost_data = self.get_resource_group_costs(rg_name, start_date, end_date)
                results.append(cost_data)
                
                # Reduced delay for large batches to speed up processing
                if idx < total:  # Don't delay after last item
                    time.sleep(delay)
            except Exception as e:
                logger.error(f"Error fetching costs for {rg_name}: {e}")
                # Add error result instead of failing completely
                results.append({
                    'resource_group': rg_name,
                    'total_cost': 0.0,
                    'services': {},
                    'error': f'Error fetching costs: {str(e)}',
                    'start_date': start_date.isoformat() if start_date else None,
                    'end_date': end_date.isoformat() if end_date else None
                })
        
        logger.info(f"Completed fetching costs for {len(results)} resource groups")
        return results
    
    def _parse_cost_result(
        self, 
        result: Dict, 
        resource_group_name: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Parse the cost query result (matching working script logic)."""
        services = {}
        total_cost = 0.0
        
        if 'properties' not in result or 'rows' not in result['properties']:
            return {
                'resource_group': resource_group_name,
                'total_cost': 0.0,
                'services': {},
                'error': 'Invalid response structure from Cost Management API',
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        
        rows = result['properties']['rows']
        
        if not rows:
            return {
                'resource_group': resource_group_name,
                'total_cost': 0.0,
                'services': {},
                'error': 'No cost data rows returned',
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        
        # Parse rows - format is [cost, date, resource_group, service, currency] (matching working script)
        logger.info(f"Parsing {len(rows)} cost rows for resource group {resource_group_name}")
        
        for idx, row in enumerate(rows):
            if len(row) >= 5:  # [cost, date, resource_group, service, currency]
                try:
                    cost = float(row[0]) if row[0] is not None else 0.0
                    rg_name = row[2] if row[2] else "Unknown"
                    service_name = row[3] if row[3] else "Unknown Service"
                    
                    # Filter by resource group name (case-insensitive, matching working script)
                    if rg_name.lower() == resource_group_name.lower():
                        if service_name not in services:
                            services[service_name] = 0.0
                        services[service_name] += cost
                        total_cost += cost
                        
                        if idx < 5:  # Log first 5 matching rows for debugging
                            logger.info(f"Row {idx}: ResourceGroup={rg_name}, Service={service_name}, Cost={cost}")
                except (ValueError, IndexError, TypeError) as e:
                    logger.warning(f"Error parsing cost row {idx}: {e}, row: {row}, row type: {type(row)}")
                    continue
            else:
                logger.warning(f"Row {idx} has insufficient columns ({len(row)}), expected at least 5. Row: {row}")
        
        logger.info(f"Parsed costs for {resource_group_name}: total=${total_cost:.2f}, services={len(services)}")
        
        # Calculate projections
        now = datetime.now()
        days_in_month = (now.replace(month=now.month % 12 + 1, day=1) - timedelta(days=1)).day
        days_passed = now.day
        month_progress = days_passed / days_in_month if days_in_month > 0 else 1.0
        
        full_month_projection = total_cost / month_progress if month_progress > 0 else total_cost
        annual_projection = full_month_projection * 12
        
        # Extract currency from response (matching working script)
        currency = result.get('properties', {}).get('currency', 'USD')
        
        return {
            'resource_group': resource_group_name,
            'total_cost': round(total_cost, 2),
            'currency': currency,
            'services': {k: round(v, 2) for k, v in services.items()},
            'error': None,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'projections': {
                'full_month': round(full_month_projection, 2),
                'annual': round(annual_projection, 2),
                'month_progress': round(month_progress * 100, 1),
                'days_passed': days_passed,
                'days_in_month': days_in_month
            }
        }

