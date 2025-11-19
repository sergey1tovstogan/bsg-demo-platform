# Data Flow Architecture - Exact Layout Implementation

## Summary

Recreated the exact visual layout from the provided diagram with pixel-accurate positioning on an 8px grid. All components remain separate and individually addressable for animation.

## Canvas Specifications

### Dimensions
- **Width**: 900px
- **Height**: 420px (400px content + 20px padding)
- **Coordinate System**: Top-left origin (0,0)
- **Grid System**: 8px base unit for all positioning

### Styling
- **Background**: `#F4F4F6` (light grey)
- **Border**: 2px solid `#3CB5A6` (teal)
- **Border Radius**: 8px
- **Padding**: 16px (2 grid units)

## Component Layout Map

### Static Components (Always Visible)

#### Temenos Core
- **ID**: `temenos_core`
- **File**: `Temenos_Core.png`
- **Position**: x: 16, y: 16
- **Size**: 160 × 232
- **Description**: Large dark blue panel on the left
- **Z-Index**: 2

#### Live Database
- **ID**: `live`
- **File**: `Live.png`
- **Position**: x: 16, y: 264
- **Size**: 56 × 56
- **Description**: Cylinder storage icon
- **Z-Index**: 2

#### Archive Database
- **ID**: `archive`
- **File**: `Archive.png`
- **Position**: x: 88, y: 264
- **Size**: 56 × 56
- **Description**: Cylinder storage icon
- **Z-Index**: 2

#### NVDB (Non-Volatile Database)
- **ID**: `nvdb`
- **File**: `NVDB.png`
- **Position**: x: 16, y: 336
- **Size**: 168 × 56
- **Description**: Wide cylinder storage spanning below Live and Archive
- **Z-Index**: 2

### Animated Components

#### Events (Left Tag)
- **ID**: `events_left`
- **File**: `Events.png`
- **Position**: x: 120, y: 32
- **Size**: 96 × 40
- **Description**: Small horizontal tag overlaying upper Temenos Core
- **Z-Index**: 5
- **Animation**: Path A (Event-Driven)

#### File (Left Tag)
- **ID**: `file_left`
- **File**: `File.png`
- **Position**: x: 120, y: 144
- **Size**: 104 × 48
- **Description**: Small horizontal tag "low volume" overlaying mid Temenos Core
- **Z-Index**: 5
- **Animation**: Path B (ETL Pipeline)

#### Pub/Sub
- **ID**: `pub_sub`
- **File**: `Pub_Sub.png`
- **Position**: x: 320, y: 80
- **Size**: 112 × 64
- **Description**: Message broker panel (Kafka)
- **Z-Index**: 3
- **Animation**: All paths

#### ETL
- **ID**: `etl`
- **File**: `ETL.png`
- **Position**: x: 264, y: 192
- **Size**: 128 × 56
- **Description**: Purple ETL processing panel
- **Z-Index**: 3
- **Animation**: Path B (ETL Pipeline)

#### Data Hub
- **ID**: `data_hub`
- **File**: `Data_Hub.png`
- **Position**: x: 440, y: 192
- **Size**: 136 × 48
- **Description**: Light blue horizontal strip
- **Z-Index**: 2
- **Animation**: Path C (High-Volume Query)

#### Analytics
- **ID**: `analytics`
- **File**: `Analytics.png`
- **Position**: x: 592, y: 192
- **Size**: 104 × 56
- **Description**: Light blue panel "(optional)"
- **Z-Index**: 2
- **Animation**: Path B & Path C

#### ODS (Operational Data Store)
- **ID**: `ods`
- **File**: `ODS.png`
- **Position**: x: 384, y: 232
- **Size**: 48 × 48
- **Description**: Small cylinder under Data Hub area
- **Z-Index**: 4
- **Animation**: Path C (High-Volume Query)

#### SDS (Staging Data Store)
- **ID**: `sds`
- **File**: `SDS.png`
- **Position**: x: 512, y: 232
- **Size**: 48 × 48
- **Description**: Small cylinder under Data Hub
- **Z-Index**: 4
- **Animation**: Path C (High-Volume Query)

#### ADS (Analytical Data Store)
- **ID**: `ads`
- **File**: `ADS.png`
- **Position**: x: 608, y: 232
- **Size**: 48 × 48
- **Description**: Small cylinder under Analytics area
- **Z-Index**: 4
- **Animation**: Path C (High-Volume Query)

#### Data Warehouse
- **ID**: `data_warehouse`
- **File**: `DWH.png`
- **Position**: x: 264, y: 296
- **Size**: 432 × 48
- **Description**: Long purple horizontal bar at bottom
- **Z-Index**: 2
- **Animation**: Path B (ETL Pipeline)

#### Microservices
- **ID**: `microservices`
- **File**: `Microservices.png`
- **Position**: x: 560, y: 64
- **Size**: 208 × 120
- **Description**: Light blue panel with Holdings/Party services
- **Z-Index**: 2
- **Animation**: Path A (Event-Driven)

#### Events (Vertical Tag)
- **ID**: `events_vertical`
- **File**: `Events.png`
- **Position**: x: 544, y: 80
- **Size**: 24 × 88
- **Description**: Vertical tag on left edge of Microservices
- **Z-Index**: 5
- **Animation**: Path A (Event-Driven)

## Arrow Connections

### Path C (High-Volume Query - "Buy")

#### Pub/Sub → Data Hub
- **ID**: `arrow-pubsub-datahub`
- **Path**: `M 432 112 L 440 216`
- **Style**: Dashed (#F59E0B orange)
- **Label**: "Buy"

#### Data Hub → Analytics
- **ID**: `arrow-datahub-analytics`
- **Path**: `M 576 216 L 592 220`
- **Style**: Solid (#3B82F6 blue)

### Path A (Event-Driven)

#### Events → Pub/Sub
- **ID**: `arrow-events-pubsub`
- **Path**: `M 216 52 L 320 112`
- **Style**: Dashed (#F59E0B orange)

#### Pub/Sub → Events Vertical (→ Microservices)
- **ID**: `arrow-pubsub-microservices`
- **Path**: `M 432 112 L 544 112`
- **Style**: Dashed (#F59E0B orange)

### Path B (ETL Pipeline)

#### File → ETL
- **ID**: `arrow-file-etl`
- **Path**: `M 172 192 L 264 220`
- **Style**: Solid (#14B8A6 teal)

#### ETL → Data Warehouse
- **ID**: `arrow-etl-warehouse`
- **Path**: `M 328 248 L 480 296`
- **Style**: Solid (#8B5CF6 purple)

#### Pub/Sub → ETL ("Build")
- **ID**: `arrow-pubsub-etl`
- **Path**: `M 376 144 L 328 192`
- **Style**: Dashed (#F59E0B orange)
- **Label**: "Build"

#### Data Warehouse → Analytics
- **ID**: `arrow-warehouse-analytics`
- **Path**: `M 696 320 L 644 248`
- **Style**: Dashed (#6366F1 indigo)
- **Label**: "Extracts"

## Animation Sequences

### Path C: High-Volume Query (8 steps, 10s total)
```
0s    → pub_sub appears
2s    → arrow-pubsub-datahub animates (Buy)
4s    → data_hub appears
5s    → ods appears
5.5s  → sds appears
6s    → ads appears
8s    → arrow-datahub-analytics animates
10s   → analytics appears
```

### Path A: Event-Driven (6 steps, 8s total)
```
0s    → events_left appears
2s    → arrow-events-pubsub animates
4s    → pub_sub appears
6s    → arrow-pubsub-microservices animates
7s    → events_vertical appears
8s    → microservices appears
```

### Path B: ETL Pipeline (8 steps, 12s total)
```
0s    → file_left appears
2s    → arrow-file-etl animates
4s    → etl appears
5s    → arrow-pubsub-etl animates (Build)
6s    → arrow-etl-warehouse animates
8s    → data_warehouse appears
10s   → arrow-warehouse-analytics animates (Extracts)
12s   → analytics appears
```

## Z-Order Layers (Back to Front)

1. **Background** (z-index: 0)
   - Light grey (#F4F4F6) panel with teal border

2. **Large Structural Blocks** (z-index: 2)
   - temenos_core (Temenos Core)
   - data_hub (Data Hub strip)
   - analytics (Analytics panel)
   - data_warehouse (DWH bar)
   - microservices (Microservices panel)

3. **Mid Elements** (z-index: 3)
   - pub_sub (Pub/Sub)
   - etl (ETL)

4. **Cylinders** (z-index: 4)
   - ods, sds, ads (Data stores)
   - live, archive, nvdb (Core databases)

5. **Small Tags/Labels** (z-index: 5)
   - events_left (Events horizontal)
   - file_left (File horizontal)
   - events_vertical (Events vertical)

6. **Arrows** (z-index: 1, rendered in SVG layer)
   - All connection arrows

## Color Palette

### Component Colors (from PNG assets)
- **Temenos Core**: Dark navy (#283054)
- **ETL**: Purple (#8B5CF6)
- **Data Warehouse**: Purple (#9333EA)
- **Pub/Sub**: Grey (#6B7280)
- **Data Hub**: Light blue (#DBEAFE)
- **Analytics**: Light blue (#DBEAFE)
- **Microservices**: Light blue (#E0E7FF)
- **Tags**: Light purple/grey

### Arrow Colors
- **Orange Dashed**: #F59E0B (Buy/Build labels)
- **Blue Solid**: #3B82F6 (Standard connections)
- **Teal Solid**: #14B8A6 (File to ETL)
- **Purple Solid**: #8B5CF6 (ETL to DWH)
- **Indigo Dashed**: #6366F1 (Extracts label)

## Grid System

All coordinates align to 8px grid:
- Valid x positions: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88...
- Valid y positions: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88...
- Valid widths: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96...
- Valid heights: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96...

## Component Addressability

Each component has a stable, semantic ID:
- Static: `temenos_core`, `live`, `archive`, `nvdb`
- Animated: `events_left`, `file_left`, `pub_sub`, `etl`, `data_hub`, `analytics`, `ods`, `sds`, `ads`, `data_warehouse`, `microservices`, `events_vertical`
- Arrows: `arrow-pubsub-datahub`, `arrow-datahub-analytics`, `arrow-events-pubsub`, `arrow-pubsub-microservices`, `arrow-file-etl`, `arrow-etl-warehouse`, `arrow-pubsub-etl`, `arrow-warehouse-analytics`

All components can be individually transformed:
- `opacity`: 0 to 1
- `scale`: 0.8 to 1
- `filter`: greyscale for inactive paths
- Future: translate, rotate, etc.

## Technical Implementation

### File
`frontend/src/components/data-architecture/DataArchitectureContent.tsx`

### Key Features
- Framer Motion for smooth animations
- SVG for arrow rendering with path animation
- Absolute positioning for pixel-perfect layout
- 8px grid system for consistency
- Separate static vs. animated component lists
- Individual component addressability
- Tooltips on hover
- Keyboard controls (1, 2, 3, Space)
- Play/pause/step controls
- Path-specific grey-out during playback

### Rendering Approach
1. Static components render as regular `<div>` (no animation)
2. Animated components render as `<motion.div>` (Framer Motion)
3. Arrows render as SVG `<path>` with stroke animation
4. All use `object-contain` for image scaling
5. All positioned absolutely within 900×420 canvas

---

**Status**: ✅ Exact Layout Implemented
**Grid**: 8px base unit
**Addressability**: All components individually accessible
**Animation Ready**: Framer Motion integrated
**Updated**: November 17, 2025
