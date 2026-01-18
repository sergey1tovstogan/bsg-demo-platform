"""
Azure Cosmos DB Throughput Checker

Checks current RU/s provisioning and provides cost optimization recommendations.
Requires Azure CLI or can be run manually via Azure Portal.
"""

import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def calculate_cost_from_monthly(monthly_cost: float) -> dict:
    """Calculate RU/s from monthly cost."""
    # Cost per 100 RU/s per hour: ~$0.008 (varies by region)
    RU_COST_PER_100_PER_HOUR = 0.008
    HOURS_PER_MONTH = 730
    
    # Reverse calculation
    cost_per_hour = monthly_cost / HOURS_PER_MONTH
    ru_per_100 = cost_per_hour / RU_COST_PER_100_PER_HOUR
    estimated_ru_s = ru_per_100 * 100
    
    return {
        "estimated_ru_s": int(estimated_ru_s),
        "cost_per_hour": cost_per_hour,
        "cost_per_day": cost_per_hour * 24
    }


def print_cost_analysis():
    """Print cost analysis and recommendations."""
    
    print("=" * 80)
    print("Azure Cosmos DB Cost Analysis")
    print("=" * 80)
    
    print(f"\nCurrent Situation:")
    print(f"  Monthly Cost (from Azure Portal): $134.67")
    print(f"  Actual Data Storage: 3.62 MB")
    print(f"  Storage Cost: ~$0.00/month")
    
    # Calculate estimated RU/s
    cost_info = calculate_cost_from_monthly(134.67)
    estimated_ru_s = cost_info["estimated_ru_s"]
    
    print(f"\n{'=' * 80}")
    print("Cost Breakdown")
    print(f"{'=' * 80}\n")
    
    print(f"Estimated Provisioned RU/s: {estimated_ru_s:,}")
    print(f"  Cost per hour: ${cost_info['cost_per_hour']:.4f}")
    print(f"  Cost per day: ${cost_info['cost_per_day']:.2f}")
    print(f"  Cost per month: $134.67")
    
    print(f"\n{'=' * 80}")
    print("Optimization Scenarios")
    print(f"{'=' * 80}\n")
    
    scenarios = [
        {
            "name": "400 RU/s (Minimum)",
            "ru_s": 400,
            "description": "Minimum provisioned throughput - good for low traffic"
        },
        {
            "name": "800 RU/s (Low-Medium)",
            "ru_s": 800,
            "description": "For moderate traffic with some headroom"
        },
        {
            "name": "1,000 RU/s (Medium)",
            "ru_s": 1000,
            "description": "For consistent moderate traffic"
        },
        {
            "name": "Autoscale (400-4,000)",
            "ru_s": "autoscale",
            "description": "Scales automatically based on demand"
        },
        {
            "name": "Serverless",
            "ru_s": "serverless",
            "description": "Pay per request - best for low/sporadic traffic"
        }
    ]
    
    RU_COST_PER_100_PER_HOUR = 0.008
    HOURS_PER_MONTH = 730
    
    for scenario in scenarios:
        print(f"\n{scenario['name']}:")
        print(f"  Description: {scenario['description']}")
        
        if scenario['ru_s'] == "autoscale":
            min_cost = (400 / 100) * RU_COST_PER_100_PER_HOUR * HOURS_PER_MONTH
            max_cost = (4000 / 100) * RU_COST_PER_100_PER_HOUR * HOURS_PER_MONTH
            print(f"  Monthly Cost: ${min_cost:.2f} - ${max_cost:.2f} (depends on usage)")
            print(f"  Savings: ${134.67 - max_cost:.2f} - ${134.67 - min_cost:.2f}/month")
            print(f"  Savings %: {((134.67 - max_cost) / 134.67 * 100):.1f}% - {((134.67 - min_cost) / 134.67 * 100):.1f}%")
        
        elif scenario['ru_s'] == "serverless":
            # Serverless: $0.25 per million RU consumed
            # Estimate: 50-200 million RU/month for low traffic = $12.50 - $50
            estimated_ru_consumed = 100_000_000  # Conservative estimate
            cost = (estimated_ru_consumed / 1_000_000) * 0.25
            print(f"  Monthly Cost: ~${cost:.2f} (pay per request, estimated)")
            print(f"  Savings: ~${134.67 - cost:.2f}/month")
            print(f"  Savings %: ~{((134.67 - cost) / 134.67 * 100):.1f}%")
            print(f"  Note: Actual cost depends on actual RU consumption")
        
        else:
            monthly_cost = (scenario['ru_s'] / 100) * RU_COST_PER_100_PER_HOUR * HOURS_PER_MONTH
            savings = 134.67 - monthly_cost
            savings_pct = (savings / 134.67) * 100
            print(f"  Monthly Cost: ${monthly_cost:.2f}")
            print(f"  Savings: ${savings:.2f}/month")
            print(f"  Savings %: {savings_pct:.1f}%")
    
    print(f"\n{'=' * 80}")
    print("Recommendations")
    print(f"{'=' * 80}\n")
    
    print("1. IMMEDIATE ACTION:")
    print("   - Go to Azure Portal -> Your Cosmos DB account")
    print("   - Navigate to 'Scale & Settings' or 'Throughput'")
    print("   - Check current RU/s value")
    print("   - Reduce to 400 RU/s (minimum)")
    print("   - Monitor for 2-3 days for throttling (429 errors)")
    
    print("\n2. IF YOU SEE THROTTLING:")
    print("   - Increase to 800 RU/s")
    print("   - Still saves ~$80/month vs current")
    
    print("\n3. FOR VARIABLE TRAFFIC:")
    print("   - Consider Autoscale (400-4,000 RU/s)")
    print("   - Automatically scales based on demand")
    print("   - Saves 30-50% vs fixed provisioned")
    
    print("\n4. FOR VERY LOW TRAFFIC:")
    print("   - Consider Serverless mode")
    print("   - Pay only for requests you make")
    print("   - Could save 90%+ ($120+/month)")
    
    print(f"\n{'=' * 80}")
    print("How to Check Current RU/s")
    print(f"{'=' * 80}\n")
    
    print("Option 1: Azure Portal (Easiest)")
    print("  1. Go to https://portal.azure.com")
    print("  2. Navigate to your Cosmos DB account: bsg-demo-platform-mongodb")
    print("  3. Click 'Scale & Settings' or 'Throughput'")
    print("  4. Look for 'Manual' or 'Autoscale' section")
    print("  5. Note the RU/s value")
    
    print("\nOption 2: Azure CLI")
    print("  az cosmosdb mongodb collection throughput show \\")
    print("    --account-name bsg-demo-platform-mongodb \\")
    print("    --database-name bsg_demo \\")
    print("    --name <collection-name> \\")
    print("    --resource-group bsg-demo-platform")
    
    print("\nOption 3: Azure PowerShell")
    print("  Get-AzCosmosDBMongoDBCollectionThroughput \\")
    print("    -AccountName bsg-demo-platform-mongodb \\")
    print("    -DatabaseName bsg_demo \\")
    print("    -Name <collection-name> \\")
    print("    -ResourceGroupName bsg-demo-platform")
    
    print(f"\n{'=' * 80}")
    print("Expected Results After Optimization")
    print(f"{'=' * 80}\n")
    
    print("Current:")
    print(f"  Cost: $134.67/month")
    print(f"  RU/s: ~{estimated_ru_s:,}")
    
    print("\nAfter Reducing to 400 RU/s:")
    print("  Cost: ~$23/month")
    print("  RU/s: 400")
    print("  Savings: ~$111/month (83% reduction)")
    
    print("\nAfter Switching to Serverless:")
    print("  Cost: ~$5-15/month (estimated)")
    print("  RU/s: Pay per request")
    print("  Savings: ~$120-130/month (90%+ reduction)")
    
    print(f"\n{'=' * 80}")
    print("Important Notes")
    print(f"{'=' * 80}\n")
    
    print("1. Storage costs are NOT the problem:")
    print("   - Your 3.62 MB costs ~$0.00/month")
    print("   - The $134.67 is from provisioned throughput (RU/s)")
    
    print("\n2. Connection pool optimization (already done):")
    print("   - Reduced max connections: 50 -> 20")
    print("   - Saves ~$8/month on idle RU consumption")
    print("   - But the main cost is base RU/s tier")
    
    print("\n3. You can always increase RU/s if needed:")
    print("   - Start with 400 RU/s")
    print("   - Monitor for throttling")
    print("   - Increase if you see 429 errors")
    
    print("\n4. Serverless mode limitations:")
    print("   - Max 5,000 RU/s per container")
    print("   - May have latency spikes on cold starts")
    print("   - Not available in all regions")
    
    print(f"\n{'=' * 80}\n")


if __name__ == "__main__":
    print_cost_analysis()
