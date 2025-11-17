# Data Flow Architecture - Static Components Update

## Changes Completed ✅

### 1. Static Base Components
**New Feature:** Core components (Temenos Core, Live, Archive, NVDB) are now always visible

**Why:**
- These components are common to all animation paths
- They serve as the foundation/starting point for all data flows
- Users can see the base architecture immediately without animation

**Components Made Static:**
- ✅ `Temenos_Core.png` - Core banking system (Temenos Wealth)
- ✅ `Live.png` - Live operational database
- ✅ `Archive.png` - Archive database
- ✅ `NVDB.png` - Non-volatile database

### 2. Updated Layout
**Positioning adjusted to match screenshot:**
- Temenos Core: x: 50, y: 80, width: 280, height: 300
- Live database: x: 50, y: 400, width: 80, height: 80
- Archive database: x: 145, y: 400, width: 80, height: 80
- NVDB: x: 240, y: 400, width: 90, height: 80

**Layout matches screenshot:**
- Core is positioned on the left
- Three databases (Live, Archive, NVDB) are in a row below Core

### 3. Simplified Animation Sequences
**Before:** Each path included Core + databases animation (12-16 steps)
**After:** Paths only animate the dynamic components (5-8 steps)

**Path A (Event-Driven) - Now 5 steps:**
```
Events → Pub/Sub → Microservices
```
Removed: Core, Live, Archive, NVDB (now static)

**Path B (ETL Pipeline) - Now 8 steps:**
```
File → ETL → Data Warehouse → Analytics
```
Removed: Core, Live, Archive, NVDB (now static)

**Path C (High-Volume Query) - Unchanged (8 steps):**
```
Pub/Sub → Data Hub → Analytics
```
(This path didn't include Core/DBs originally)

### 4. Responsive Canvas
**Changed:**
- Previous: Fixed width (1250px) with horizontal scroll
- New: Responsive width with minimum 800px
- Height: Reduced from 680px to 600px for better screen fit

**Benefits:**
- Images scale dynamically to fit screen
- Better mobile/tablet experience
- Cleaner layout on different screen sizes

### 5. Technical Implementation

#### Separated Component Lists
```typescript
// Static components (always visible)
const staticComponents: ComponentItem[] = [
  { id: 'core', ... },
  { id: 'live', ... },
  { id: 'archive', ... },
  { id: 'nvdb', ... },
]

// Animated components (fade in during paths)
const animatedComponents: ComponentItem[] = [
  { id: 'events', ... },
  { id: 'file', ... },
  // ... all other components
]
```

#### Rendering Logic
**Static components:**
- Always visible (no animation)
- No grey-out effect
- Rendered as regular divs (not motion.div)

**Animated components:**
- Fade in with animation
- Grey out during other path playback
- Rendered with Framer Motion

### 6. Animation Timing Improvements
**Path A (Event-Driven):**
- Total duration: 8 seconds (down from 11 seconds)
- Events → 0s
- Arrow → 2s
- Pub/Sub → 4s
- Arrow → 6s
- Microservices → 8s

**Path B (ETL Pipeline):**
- Total duration: 12 seconds (down from 15 seconds)
- File → 0s
- Arrow → 2s
- ETL → 4s
- Arrows → 5-6s
- Data Warehouse → 8s
- Arrow → 10s
- Analytics → 12s

## Files Modified

### Main Component
**File:** `frontend/src/components/data-architecture/DataArchitectureContent.tsx`

**Changes:**
- Line 40-49: Added `staticComponents` array with Core + databases
- Line 51-72: Created `animatedComponents` array (excluding static ones)
- Line 74: Removed unused `allComponents` variable
- Line 94-125: Updated animation sequences (removed static components)
- Line 377-381: Made canvas responsive (min-width: 800px, height: 600px)
- Line 429-473: Added separate rendering for static components
- Line 475-531: Updated animated components rendering

## Visual Behavior

### On Page Load
✅ Core and databases (Live, Archive, NVDB) are immediately visible
✅ All other components are hidden
✅ Diagram shows the foundation architecture

### During Animation
✅ Static components remain visible at all times
✅ Animated components fade in as per selected path
✅ Non-active path components grey out (if previously animated)

### After Animation
✅ Static components stay at full opacity
✅ All animated components remain visible
✅ Complete diagram shows all paths

## Testing Checklist

### ✅ Static Components
- [ ] Core (Temenos_Core.png) is visible on page load
- [ ] Live, Archive, NVDB databases are visible on page load
- [ ] Static components never disappear during animation
- [ ] Static components never grey out

### ✅ Animation Paths
- [ ] Path 1: Pub/Sub → Data Hub → Analytics (8 steps)
- [ ] Path 2: Events → Pub/Sub → Microservices (5 steps)
- [ ] Path 3: File → ETL → Data Warehouse → Analytics (8 steps)

### ✅ Layout
- [ ] Core positioned on left side
- [ ] Databases in horizontal row below Core
- [ ] Layout matches provided screenshot
- [ ] Canvas is responsive (works on different screen sizes)

### ✅ Functionality
- [ ] Play/pause works correctly
- [ ] Step forward/backward works
- [ ] Keyboard shortcuts (1, 2, 3, Space) work
- [ ] Tooltips appear on hover (including static components)
- [ ] Reset button works as expected

## Next Steps

As mentioned, the next phase will be **adjusting component positions** to precisely match the PowerPoint layout.

**Ready to adjust:**
- Events and File positioning (inside Core box)
- Other component X/Y coordinates
- Arrow paths and connections
- Fine-tuning spacing and alignment

---

**Status:** ✅ Complete and Ready to Test
**Updated:** November 13, 2025
**Next Phase:** Layout Positioning Adjustments
