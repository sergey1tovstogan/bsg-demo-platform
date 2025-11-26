#!/usr/bin/env python3
"""
Update cache content in the BSG Demo Platform.

This script updates various cache entries via the API.
Usage: python update_cache_content.py <cache_key> [content_file]

Cache keys:
- public_catalog_tooltip - Public API catalog information
- open_standards_tooltip - Open standards information
"""

import requests
import json
import sys
import os

# Cache content definitions
CACHE_CONTENT = {
    "public_catalog_tooltip": """Temenos' public API catalog is a comprehensive and standardized collection of out-of-the-box RESTful APIs designed to accelerate innovation and integration for banks and financial institutions.

These APIs cover a wide range of banking capabilities, enabling quick and seamless integration with internal systems, external partners, and fintech solutions. The catalog is accessible through the Temenos developer portal, where registered users can explore detailed API documentation, interact with endpoints, and generate developer keys to test APIs in a shared sandbox environment without any contractual commitment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ Broad Coverage
   The APIs span 100% of the business areas within Temenos' core banking solution, supporting diverse banking functions such as payments, accounts, customer management, compliance, and more.

▸ API-First Architecture
   All significant product capabilities are exposed as standard, documented Open APIs, ensuring consistency and ease of use. This approach supports open banking strategies and regulatory compliance, including PSD2, with pre-defined APIs aligned to published specifications like Berlin Group and STET.

▸ RESTful Design
   The APIs follow a REST style compatible with modern web standards, using JSON payloads for data exchange and adhering to semantic versioning to maintain backward compatibility.

▸ Developer Support
   The catalog is supported by a growing developer community and Temenos experts, offering dedicated online resources, low-code integration tools, and interactive API endpoints to facilitate rapid development and deployment.

▸ Extensibility and Innovation
   Banks and fintechs can leverage the catalog to build innovative products and services on top of Temenos' open platform. Integration with Temenos Exchange further enriches offerings by incorporating new fintech technologies.

▸ Sandbox Environment
   The shared sandbox allows developers to experiment and validate integrations in a risk-free setting, accelerating proof-of-concept and development cycles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS BENEFITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The public API catalog empowers banks to innovate rapidly, meet regulatory requirements, and seamlessly integrate with a broad ecosystem, all while benefiting from Temenos' cloud-native, cloud-agnostic, and event-driven architecture.

This capability significantly reduces time to market, enhances agility, and supports continuous innovation in a fast-evolving digital banking landscape.""",
    
    "open_standards_tooltip": """Temenos provides a comprehensive integration architecture that supports modern, open standards for APIs, enabling seamless connectivity with external systems and compliance with industry regulations. The platform's RESTful APIs use JSON payloads and adhere to widely accepted standards such as OpenAPI specifications, ensuring clarity and ease of use for developers. Temenos APIs facilitate interoperability with various third-party systems including payment gateways and financial service providers, aligning with regulatory frameworks like PSD2 and initiatives such as the Berlin Group. This adherence ensures that banks can securely expose and consume APIs in a manner consistent with European and global open banking requirements.

By embracing open standards and protocols, Temenos ensures that banks can quickly and securely connect with the evolving ecosystem of financial services, fostering innovation and compliance without compromising operational integrity.

This open standard API approach empowers banks to innovate rapidly, comply with regulatory mandates like PSD2, and integrate effortlessly with diverse financial ecosystems. It reduces time-to-market for new services, enhances customer experience, and future-proofs banking operations in a competitive landscape."""
}

# Metadata for each cache key
CACHE_METADATA = {
    "public_catalog_tooltip": {
        "source": "formatted",
        "category": "api_catalog"
    },
    "open_standards_tooltip": {
        "source": "formatted",
        "category": "api_standards"
    }
}

def update_cache(cache_key: str, content: str = None, api_url: str = "http://localhost:8000"):
    """Update a cache entry via the API."""
    if cache_key not in CACHE_CONTENT and content is None:
        print(f"Error: Unknown cache key '{cache_key}' and no content provided.")
        print(f"Available cache keys: {', '.join(CACHE_CONTENT.keys())}")
        return False
    
    # Use provided content or default content
    cache_content = content if content else CACHE_CONTENT[cache_key]
    metadata = CACHE_METADATA.get(cache_key, {})
    
    payload = {
        "cache_key": cache_key,
        "content": cache_content,
        "content_type": "text",
        "metadata": metadata
    }
    
    url = f"{api_url}/api/v1/cache/{cache_key}"
    
    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        print(f"✓ Successfully updated cache: {cache_key}")
        print(f"  Response: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to update cache '{cache_key}': {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"  Response: {e.response.text}")
        return False

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python update_cache_content.py <cache_key> [content_file] [api_url]")
        print(f"\nAvailable cache keys: {', '.join(CACHE_CONTENT.keys())}")
        print("\nExamples:")
        print("  python update_cache_content.py public_catalog_tooltip")
        print("  python update_cache_content.py open_standards_tooltip")
        print("  python update_cache_content.py custom_key content.txt")
        print("  python update_cache_content.py public_catalog_tooltip http://localhost:8000")
        sys.exit(1)
    
    cache_key = sys.argv[1]
    content = None
    api_url = "http://localhost:8000"
    
    # Read content from file if provided
    if len(sys.argv) >= 3:
        content_file = sys.argv[2]
        if os.path.exists(content_file):
            with open(content_file, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            # Treat as API URL if file doesn't exist
            api_url = content_file
    
    # API URL override
    if len(sys.argv) >= 4:
        api_url = sys.argv[3]
    
    success = update_cache(cache_key, content, api_url)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

