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
                token_response = self.credential.get_token("https://management.azure.com/.default")
                self.access_token = token_response.token
                logger.info("Successfully obtained Azure access token for Cost Management API")
            except Exception as e:
                logger.error(f"Failed to get access token: {e}")
                raise RuntimeError(f"Authentication failed: {str(e)}")
        
        return self.access_token
    
    def _make_api_request(self, url: str, method: str = "GET", data: Dict = None, max_retries: int = 3) -> Dict:
        """Make authenticated API request to Azure REST API with retry logic."""
        token = self._get_access_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "bsg-demo-platform/1.0"
        }
        
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
                        return {}
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    logger.warning(f"API request failed, retrying in 2s: {e}")
                    time.sleep(2)
                    continue
                else:
                    logger.error(f"API request failed after {max_retries} attempts: {e}")
                    return {}
        
        return {}
    
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
            # Default to current month if dates not provided
            if end_date is None:
                end_date = datetime.now()
            if start_date is None:
                start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Use subscription scope
            scope = f"/subscriptions/{self.subscription_id}"
            
            # Query with resource group filter
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
            
            # Try resource group scope first
            rg_scope = f"/subscriptions/{self.subscription_id}/resourceGroups/{resource_group_name}"
            url = f"{self.base_url}{rg_scope}/providers/Microsoft.CostManagement/query?api-version=2022-10-01"
            result = self._make_api_request(url, "POST", query_definition)
            
            # If that fails, try subscription scope
            if not result or not result.get('properties', {}).get('rows'):
                url = f"{self.base_url}{scope}/providers/Microsoft.CostManagement/query?api-version=2022-10-01"
                result = self._make_api_request(url, "POST", query_definition)
            
            if result and 'properties' in result and 'rows' in result['properties'] and result['properties']['rows']:
                return self._parse_cost_result(result, resource_group_name, start_date, end_date)
            else:
                # Try grouped query without filter
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
                
                if grouped_result and 'properties' in grouped_result and 'rows' in grouped_result['properties'] and grouped_result['properties']['rows']:
                    return self._parse_cost_result(grouped_result, resource_group_name, start_date, end_date)
                else:
                    return {
                        'resource_group': resource_group_name,
                        'total_cost': 0.0,
                        'services': {},
                        'error': 'No cost data found for the specified period',
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
        
        for rg_name in resource_group_names:
            cost_data = self.get_resource_group_costs(rg_name, start_date, end_date)
            results.append(cost_data)
            
            # Small delay to avoid rate limiting
            if len(resource_group_names) > 1:
                time.sleep(0.5)
        
        return results
    
    def _parse_cost_result(
        self, 
        result: Dict, 
        resource_group_name: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Parse the cost query result."""
        services = {}
        total_cost = 0.0
        
        if 'properties' in result and 'rows' in result['properties'] and result['properties']['rows']:
            for row in result['properties']['rows']:
                if len(row) >= 5:  # [cost, date, resource_group, service, currency]
                    cost = float(row[0]) if row[0] is not None else 0.0
                    rg_name = row[2] if row[2] else "Unknown"
                    service_name = row[3] if row[3] else "Unknown Service"
                    
                    if rg_name.lower() == resource_group_name.lower():
                        if service_name not in services:
                            services[service_name] = 0.0
                        services[service_name] += cost
                        total_cost += cost
        
        # Calculate projections
        now = datetime.now()
        days_in_month = (now.replace(month=now.month % 12 + 1, day=1) - timedelta(days=1)).day
        days_passed = now.day
        month_progress = days_passed / days_in_month if days_in_month > 0 else 1.0
        
        full_month_projection = total_cost / month_progress if month_progress > 0 else total_cost
        annual_projection = full_month_projection * 12
        
        return {
            'resource_group': resource_group_name,
            'total_cost': round(total_cost, 2),
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

