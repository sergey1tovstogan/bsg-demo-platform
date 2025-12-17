"""
Seed script to populate observability content in MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, UTC

# MongoDB connection - use the same URL as the backend
MONGODB_URL = os.getenv(
    "DATABASE_URL",
    "mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@"
)
DATABASE_NAME = "bsg_demo"

observability_content = [
    {
        "component_id": "observability",
        "content_id": "obs-intro",
        "title": "Introduction to Observability",
        "type": "educational",
        "order": 1,
        "body_json": {
            "subtitle": "Learn the fundamentals of observability and why it matters for modern systems",
            "story": {
                "scenario": "Your application crashes at 3 AM. Users are complaining, but you don't know why.",
                "monitoring": "Monitoring tells you: \"Error rate is high.\" But not why or how to fix it.",
                "observability": "Observability tells you: \"This specific request failed because the database connection timed out after the config change at 2:47 AM.\"",
                "analogy": "Monitoring is like a car's dashboard warning light. Observability is like having a full diagnostic tool that shows you exactly what's wrong and where."
            }
        },
        "content_metadata": {
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
    },
    {
        "component_id": "observability",
        "content_id": "obs-big-picture",
        "title": "The Big Picture",
        "type": "educational",
        "order": 2,
        "body_json": {
            "monitoring": {
                "question": "Is something wrong?",
                "points": [
                    "Predefined dashboards showing known metrics",
                    "Alerts when thresholds are crossed",
                    "Answers questions you know to ask",
                    "Limited to what you planned to measure"
                ]
            },
            "observability": {
                "question": "Why is something wrong?",
                "points": [
                    "Dynamic exploration of system behavior",
                    "Correlation across multiple data sources",
                    "Answers questions you didn't know to ask",
                    "Adapts to new, unexpected problems"
                ]
            },
            "analogy": {
                "heading": "Think of it this way:",
                "dashboard": "A car's dashboard tells you the speed and fuel level (monitoring)",
                "toolkit": "A mechanic's toolkit lets you understand why the engine is making that noise (observability)"
            }
        },
        "content_metadata": {
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
    },
    {
        "component_id": "observability",
        "content_id": "obs-pillars",
        "title": "The Three Pillars of Observability",
        "type": "educational",
        "order": 3,
        "body_json": {
            "subtitle": "Understanding the foundation: Metrics, Logs, and Traces",
            "pillars": [
                {
                    "name": "Metrics",
                    "color": "red",
                    "description": "Numerical measurements over time that show system health at a glance",
                    "examples": [
                        "CPU usage: 85%",
                        "Request rate: 1,200 req/sec",
                        "Error rate: 0.5%",
                        "Response time: 150ms (p99)"
                    ],
                    "summary": "Metrics answer: \"What is happening right now?\""
                },
                {
                    "name": "Logs",
                    "color": "blue",
                    "description": "Timestamped records of events that happened in your system",
                    "examples": [
                        "\"2024-01-15 10:23:45 [ERROR] Database connection timeout\"",
                        "\"User login successful: user_id=12345\"",
                        "\"Payment processed: transaction_id=abc-123\"",
                        "\"API rate limit exceeded for client X\""
                    ],
                    "summary": "Logs answer: \"What happened and when?\""
                },
                {
                    "name": "Traces",
                    "color": "green",
                    "description": "The journey of a single request through your distributed system",
                    "examples": [
                        "Request → API Gateway → Auth Service → Database",
                        "Shows timing for each step",
                        "Reveals bottlenecks and failures",
                        "Tracks requests across microservices"
                    ],
                    "summary": "Traces answer: \"Where is the problem in the request flow?\""
                }
            ],
            "together": {
                "heading": "How They Work Together",
                "steps": [
                    "Metrics alert you that response times spiked",
                    "Logs show error messages from a specific service",
                    "Traces reveal that a downstream database call is slow"
                ]
            }
        },
        "content_metadata": {
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
    },
    {
        "component_id": "observability",
        "content_id": "obs-stack",
        "title": "The Observability Stack",
        "type": "educational",
        "order": 4,
        "body_json": {
            "subtitle": "From data collection to insights - the complete pipeline",
            "tiers": [
                {
                    "name": "Collector",
                    "color": "purple",
                    "subheading": "Gather data from everywhere",
                    "items": [
                        "Application code",
                        "Infrastructure",
                        "Network",
                        "Cloud services"
                    ],
                    "examples": [
                        "OpenTelemetry",
                        "Prometheus exporters",
                        "Fluentd/Fluent Bit",
                        "Telegraf"
                    ]
                },
                {
                    "name": "Storage",
                    "color": "blue",
                    "subheading": "Store and index your data",
                    "items": [
                        "Time-series databases",
                        "Log aggregation",
                        "Trace storage",
                        "Long-term retention"
                    ],
                    "examples": [
                        "Prometheus",
                        "Elasticsearch",
                        "Jaeger",
                        "Tempo",
                        "Loki"
                    ]
                },
                {
                    "name": "Visualization",
                    "color": "pink",
                    "subheading": "Make sense of your data",
                    "items": [
                        "Dashboards",
                        "Query interfaces",
                        "Alerting",
                        "Analysis tools"
                    ],
                    "examples": [
                        "Grafana",
                        "Kibana",
                        "Azure Monitor",
                        "Datadog"
                    ]
                }
            ],
            "flow": {
                "heading": "Data Flow Example",
                "steps": [
                    "Your application emits metrics, logs, and traces",
                    "OpenTelemetry collector gathers this telemetry",
                    "Data is sent to appropriate backends (Prometheus, Loki, Tempo)",
                    "Grafana queries and displays unified dashboards",
                    "You gain insights and set up alerts"
                ]
            }
        },
        "content_metadata": {
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
    },
    {
        "component_id": "observability",
        "content_id": "obs-temenos-stack",
        "title": "Observability in Temenos",
        "type": "educational",
        "order": 5,
        "body_json": {
            "subtitle": "How Temenos implements cloud-native observability with OpenTelemetry and industry-standard tools",
            "architecture": {
                "product_container": {
                    "name": "Product Container",
                    "components": [
                        {
                            "name": "Transact Core Banking",
                            "library": "OTEL libraries",
                            "progress": 90
                        },
                        {
                            "name": "Infinity APIs",
                            "library": "OTEL libraries",
                            "progress": 85
                        },
                        {
                            "name": "Legacy Components",
                            "library": "Prometheus exporters",
                            "progress": 70
                        }
                    ],
                    "info": [
                        "Automatic instrumentation via OTEL SDKs",
                        "Custom business metrics exported",
                        "Distributed tracing enabled by default"
                    ]
                },
                "sidecar_container": {
                    "name": "Side-car Container",
                    "component": {
                        "name": "OpenTelemetry Collector",
                        "description": "Receives, processes, and exports telemetry data"
                    },
                    "info": [
                        "Deployed as a sidecar in each pod",
                        "Batches and forwards data to backends",
                        "Provides uniform telemetry collection"
                    ]
                },
                "aggregation": {
                    "name": "Aggregation & Visualization",
                    "tools": [
                        {
                            "name": "Prometheus",
                            "type": "Metrics",
                            "color": "orange"
                        },
                        {
                            "name": "Loki",
                            "type": "Logs",
                            "color": "blue"
                        },
                        {
                            "name": "Tempo",
                            "type": "Traces",
                            "color": "yellow"
                        },
                        {
                            "name": "Grafana",
                            "type": "Dashboards",
                            "color": "orange-600"
                        }
                    ],
                    "info": [
                        "Unified observability platform",
                        "Correlated metrics, logs, and traces",
                        "Pre-built Temenos dashboards"
                    ]
                }
            },
            "features": [
                {
                    "title": "Standardized Telemetry",
                    "description": "Using OpenTelemetry ensures vendor-neutral, future-proof observability"
                },
                {
                    "title": "Automatic Correlation",
                    "description": "Trace IDs link metrics, logs, and traces for seamless investigation"
                },
                {
                    "title": "Cloud-Native Ready",
                    "description": "Works seamlessly with Kubernetes, Azure Monitor, and other cloud platforms"
                }
            ],
            "flow": {
                "heading": "Observability Flow in Temenos",
                "steps": [
                    {
                        "text": "Transact application emits metrics, logs, and traces using OTEL SDKs",
                        "color": "blue"
                    },
                    {
                        "text": "OpenTelemetry Collector (sidecar) receives and processes telemetry",
                        "color": "purple"
                    },
                    {
                        "text": "Data is exported to Prometheus (metrics), Loki (logs), and Tempo (traces)",
                        "color": "green"
                    },
                    {
                        "text": "Grafana provides unified dashboards with full-stack visibility",
                        "color": "orange"
                    }
                ]
            }
        },
        "content_metadata": {
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
    }
]


async def seed_content():
    """Seed observability content into MongoDB"""
    client = None
    try:
        print(f"Connecting to MongoDB at {MONGODB_URL}...")
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]

        # Test connection
        await client.admin.command('ping')
        print("✓ Connected to MongoDB")

        # Delete existing observability content
        result = await db.content.delete_many({"component_id": "observability"})
        print(f"✓ Deleted {result.deleted_count} existing observability content items")

        # Insert new content
        result = await db.content.insert_many(observability_content)
        print(f"✓ Inserted {len(result.inserted_ids)} new observability content items")

        # Verify insertion
        count = await db.content.count_documents({"component_id": "observability"})
        print(f"✓ Total observability content items in database: {count}")

        print("\n✅ Observability content seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding content: {e}")
        raise
    finally:
        if client:
            client.close()
            print("✓ MongoDB connection closed")


if __name__ == "__main__":
    asyncio.run(seed_content())
