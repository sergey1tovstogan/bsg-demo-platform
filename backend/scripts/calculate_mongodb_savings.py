"""
MongoDB Cost Savings Calculator

Calculates potential monthly savings based on optimizations made.
This script provides estimates without requiring database access.
"""

# Azure Cosmos DB MongoDB API Pricing (as of 2024)
# These are approximate - check Azure pricing calculator for exact rates
STORAGE_COST_PER_GB_MONTH = 0.25  # $0.25 per GB per month for storage
RU_COST_PER_100_RU_HOUR = 0.008  # ~$0.008 per 100 RU/s per hour (varies by region and tier)
# Note: This is approximate - actual costs depend on provisioned throughput tier

# Cache size estimates (based on code analysis)
# RAG responses are typically 5-10 KB each (JSON with ~5000-10000 chars)
# Component info is typically 2-5 KB each
AVG_RAG_RESPONSE_SIZE_KB = 7.5  # Average RAG response size
AVG_COMPONENT_INFO_SIZE_KB = 3.5  # Average component info size

# Typical usage estimates (adjust based on your actual usage)
# These are conservative estimates - actual usage may be higher
ESTIMATED_COMPONENTS = 50  # Number of unique components being cached
ESTIMATED_RAG_QUERIES_PER_DAY = 200  # Average RAG queries per day (increased for more realistic estimate)
ESTIMATED_COMPONENT_LOOKUPS_PER_DAY = 200  # Component info lookups per day


def calculate_savings():
    """Calculate potential monthly savings."""
    
    print("=" * 80)
    print("MongoDB Cost Savings Calculation")
    print("=" * 80)
    print(f"\nAzure Cosmos DB Pricing Assumptions:")
    print(f"  Storage: ${STORAGE_COST_PER_GB_MONTH:.2f} per GB per month")
    print(f"  RU/s: ${RU_COST_PER_100_RU_HOUR:.2f} per 100 RU/s per hour")
    
    print(f"\n{'=' * 80}")
    print("Current Cache Configuration (After Optimization)")
    print(f"{'=' * 80}\n")
    
    # Calculate storage with 3-day TTL (current optimized)
    rag_cache_size_3day = (ESTIMATED_RAG_QUERIES_PER_DAY * 3 * AVG_RAG_RESPONSE_SIZE_KB) / 1024  # MB
    component_cache_size_3day = (ESTIMATED_COMPONENTS * AVG_COMPONENT_INFO_SIZE_KB) / 1024  # MB
    
    # Calculate storage with 7-day TTL (previous)
    rag_cache_size_7day = (ESTIMATED_RAG_QUERIES_PER_DAY * 7 * AVG_RAG_RESPONSE_SIZE_KB) / 1024  # MB
    component_cache_size_7day = (ESTIMATED_COMPONENTS * AVG_COMPONENT_INFO_SIZE_KB) / 1024  # MB
    
    # Other cache (Azure resources, AKS namespaces) - short TTL, minimal impact
    other_cache_size = 10  # MB (estimated)
    
    total_cache_3day = rag_cache_size_3day + component_cache_size_3day + other_cache_size
    total_cache_7day = rag_cache_size_7day + component_cache_size_7day + other_cache_size
    
    print(f"Cache Storage (3-day TTL - Current):")
    print(f"  RAG responses: {rag_cache_size_3day:.2f} MB")
    print(f"  Component info: {component_cache_size_3day:.2f} MB")
    print(f"  Other cache: {other_cache_size:.2f} MB")
    print(f"  Total: {total_cache_3day:.2f} MB ({total_cache_3day/1024:.3f} GB)")
    
    print(f"\nCache Storage (7-day TTL - Previous):")
    print(f"  RAG responses: {rag_cache_size_7day:.2f} MB")
    print(f"  Component info: {component_cache_size_7day:.2f} MB")
    print(f"  Other cache: {other_cache_size:.2f} MB")
    print(f"  Total: {total_cache_7day:.2f} MB ({total_cache_7day/1024:.3f} GB)")
    
    # Calculate savings
    storage_saved_mb = total_cache_7day - total_cache_3day
    storage_saved_gb = storage_saved_mb / 1024
    
    print(f"\n{'=' * 80}")
    print("Monthly Savings Calculation")
    print(f"{'=' * 80}\n")
    
    # Storage savings
    monthly_storage_savings = storage_saved_gb * STORAGE_COST_PER_GB_MONTH
    
    print(f"Storage Savings:")
    print(f"  Cache size reduction: {storage_saved_mb:.2f} MB ({storage_saved_gb:.3f} GB)")
    print(f"  Monthly storage cost savings: ${monthly_storage_savings:.2f}")
    
    # Connection pool savings (harder to quantify, but reduces idle RU consumption)
    # Reduced from 50/10 to 20/5 connections
    # Note: Actual RU savings depend on provisioned throughput tier
    # If using autoscale or serverless, savings are in reduced peak RU consumption
    # If using provisioned throughput, this reduces the minimum RU/s needed
    # Conservative estimate: 30 fewer idle connections * ~5 RU/s each = 150 RU/s reduction
    idle_ru_reduction = (50 - 20) * 5  # 150 RU/s reduction (conservative)
    monthly_ru_savings = (idle_ru_reduction / 100) * RU_COST_PER_100_RU_HOUR * 24 * 30
    
    print(f"\nConnection Pool Savings:")
    print(f"  RU/s reduction: {idle_ru_reduction} RU/s (from 50 to 20 max connections)")
    print(f"  Monthly RU cost savings: ${monthly_ru_savings:.2f}")
    
    # Total savings
    total_monthly_savings = monthly_storage_savings + monthly_ru_savings
    
    print(f"\n{'=' * 80}")
    print("TOTAL MONTHLY SAVINGS")
    print(f"{'=' * 80}\n")
    print(f"Storage optimization: ${monthly_storage_savings:.2f}/month")
    print(f"Connection pool optimization: ${monthly_ru_savings:.2f}/month")
    print(f"{'-' * 40}")
    print(f"TOTAL: ${total_monthly_savings:.2f}/month")
    print(f"Annual savings: ${total_monthly_savings * 12:.2f}/year")
    
    # Additional potential savings
    print(f"\n{'=' * 80}")
    print("Additional Optimization Potential")
    print(f"{'=' * 80}\n")
    
    # If we reduce to 1-day TTL
    rag_cache_size_1day = (ESTIMATED_RAG_QUERIES_PER_DAY * 1 * AVG_RAG_RESPONSE_SIZE_KB) / 1024
    component_cache_size_1day = (ESTIMATED_COMPONENTS * AVG_COMPONENT_INFO_SIZE_KB) / 1024
    total_cache_1day = rag_cache_size_1day + component_cache_size_1day + other_cache_size
    
    additional_savings_gb = (total_cache_3day - total_cache_1day) / 1024
    additional_monthly_savings = additional_savings_gb * STORAGE_COST_PER_GB_MONTH
    
    print(f"If TTL reduced to 1 day:")
    print(f"  Additional cache reduction: {additional_savings_gb * 1024:.2f} MB ({additional_savings_gb:.3f} GB)")
    print(f"  Additional monthly savings: ${additional_monthly_savings:.2f}")
    print(f"  Total potential monthly savings: ${total_monthly_savings + additional_monthly_savings:.2f}")
    
    print(f"\n{'=' * 80}")
    print("Recommendations")
    print(f"{'=' * 80}\n")
    print(f"[OK] Current optimizations save: ${total_monthly_savings:.2f}/month")
    print(f"[TIP] Further reduce TTL to 1 day: +${additional_monthly_savings:.2f}/month")
    print(f"[TIP] Run cleanup script regularly: Prevents accumulation of expired entries")
    print(f"[TIP] Monitor actual usage: Run analyze_mongodb_usage.py to see real numbers")
    
    print(f"\n{'=' * 80}")
    print("Note: Actual savings depend on your real usage patterns.")
    print("Run 'python scripts/analyze_mongodb_usage.py' for accurate analysis.")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    calculate_savings()
