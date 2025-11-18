# Data Flow Architecture - Visibility & Layout Updates

## Updates Completed ✅

### 1. Removed Top Labels
**Removed:** "Command", "Query", "Complex Query", "High-Volume Query", "Analytics" labels at top of diagram

**Reason:** Cleaner layout, focusing on the animated content

### 2. Persistent Component Visibility
**Major Change:** All animated components now remain visible after their animation completes

**Previous Behavior:**
- Components would disappear when switching paths
- Core and other components would vanish after animation
- Only currently animating path was visible

**New Behavior:**
- ✅ All animated components stay visible permanently
- ✅ Components accumulate as you play different paths
- ✅ Components only grey out during active playback of OTHER paths
- ✅ When idle/completed, all previously animated components remain at full visibility

### 3. Grey-Out Logic Update
**When Components Grey Out:**
- ONLY during active playback (`playbackState === 'playing'`)
- ONLY for components NOT in the current animation path
- Components in current path stay at full opacity (1.0)
- Other components dim to 30% opacity (0.3 for components, 0.2 for arrows)

**When Components Stay Visible:**
- ✅ After animation completes
- ✅ When switching between paths (no reset)
- ✅ When paused
- ✅ All previously animated components remain visible

### 4. Path Switching Behavior
**Previous:** Switching paths would reset and clear all components
**New:** Switching paths preserves all previously animated components

**How it Works Now:**
1. Play Path 1 → Components appear and stay visible
2. Switch to Path 2 → Path 1 components remain visible
3. Play Path 2 → Path 1 components grey out, Path 2 animates in full color
4. Complete Path 2 → All components from both paths now visible at full opacity
5. Repeat for Path 3 → Build up complete diagram

### 5. Reset Button
**Only the Reset button clears everything:**
- Clears all visible components
- Clears animation history
- Returns to clean slate
- Resets playback state to idle

## Technical Implementation

### New State Variables

```typescript
const [allAnimatedComponents, setAllAnimatedComponents] = useState<Set<string>>(new Set())
```

**Purpose:** Tracks ALL components that have ever been animated across all paths

### Updated Logic

#### Component Rendering:
```typescript
const hasBeenAnimated = allAnimatedComponents.has(component.id)
const isCurrentlyAnimating = visibleComponents.has(component.id)
const shouldShow = hasBeenAnimated || isCurrentlyAnimating
const shouldGrayOut = playbackState === 'playing' && !isInPath && hasBeenAnimated

opacity: shouldGrayOut ? 0.3 : shouldShow ? 1 : 0
```

#### Arrow Rendering:
```typescript
const hasBeenAnimated = allAnimatedComponents.has(arrow.id)
const shouldShow = hasBeenAnimated || isCurrentlyAnimating
const shouldGrayOut = playbackState === 'playing' && !isInPath && hasBeenAnimated

opacity: shouldGrayOut ? 0.2 : shouldShow ? 1 : 0
pathLength: shouldShow ? 1 : 0
```

### Updated Functions

**playSequence():**
- Removed: `setVisibleComponents(new Set())`
- Added: Updates both `visibleComponents` AND `allAnimatedComponents`
- Result: Components persist across path switches

**handleReset():**
- Clears `visibleComponents`
- Clears `allAnimatedComponents` ← New
- Resets `currentStep`
- Returns to `idle` state

**handleStepForward():**
- Updates `visibleComponents`
- Updates `allAnimatedComponents` ← New
- Allows manual stepping to build up diagram

**Path Selection Buttons:**
- Removed: `handleReset()` calls
- Result: Switching paths no longer clears diagram

## User Experience Flow

### Scenario 1: Building the Complete Diagram
1. **Start:** Empty canvas
2. **Play Path 1:** Pub/Sub → Data Hub → Analytics appear
3. **Result:** Path 1 components stay visible ✅
4. **Switch to Path 2:** Path 1 components remain visible ✅
5. **Play Path 2:** Core → Events → Pub/Sub → Microservices animate in
   - Path 1 components grey out during playback
   - Path 2 components animate at full opacity
6. **Result:** Both Path 1 and Path 2 components now visible ✅
7. **Switch to Path 3:** All previous components remain
8. **Play Path 3:** ETL pipeline animates
   - Previous paths grey out during playback
9. **Final Result:** Complete diagram with ALL paths visible ✅

### Scenario 2: Replaying a Path
1. **After building complete diagram:** All components visible
2. **Press "1" to replay Path 1:** Path 1 animates again
   - Path 2 and Path 3 components grey out
   - Path 1 components re-animate at full opacity
3. **Complete:** All components back to full visibility

### Scenario 3: Using Reset
1. **Complete diagram visible**
2. **Click Reset button**
3. **Result:** Everything clears, back to empty canvas
4. **Ready to start fresh**

## Visual States Summary

| State | Path Components | Other Paths | Arrows |
|-------|----------------|-------------|--------|
| **Idle (before animation)** | Hidden (0) | Hidden (0) | Hidden (0) |
| **Playing Path X** | Full opacity (1.0) | Grey (0.3) | Full/Grey (1.0/0.2) |
| **Completed/Paused** | Full opacity (1.0) | Full opacity (1.0) | Full opacity (1.0) |
| **After Reset** | Hidden (0) | Hidden (0) | Hidden (0) |

## Files Modified

### Main Component:
**File:** `frontend/src/components/data-architecture/DataArchitectureContent.tsx`

**Changes:**
- Line 37: Added `allAnimatedComponents` state
- Line 130-153: Updated `playSequence()` to track all animated components
- Line 206-211: Updated `handleReset()` to clear both state variables
- Line 213-224: Updated `handleStepForward()` to track animated components
- Line 315-353: Removed `handleReset()` from path selection buttons
- Line 387: Removed top labels section
- Line 398-434: Updated arrow rendering logic with new visibility rules
- Line 438-479: Updated component rendering logic with new visibility rules
- Line 479: Updated tooltip condition to use `shouldShow`

## Testing Checklist

### ✅ Components Persist After Animation
- [ ] Play Path 1 → Components stay visible after completion
- [ ] Play Path 2 → Path 1 components remain visible
- [ ] Play Path 3 → All previous paths remain visible

### ✅ Grey-Out During Playback
- [ ] Playing Path 1 → Other paths grey out (if previously animated)
- [ ] Playing Path 2 → Path 1 and 3 grey out
- [ ] Playing Path 3 → Path 1 and 2 grey out

### ✅ Path Switching
- [ ] Switch between paths without losing previous components
- [ ] Path selection works while idle
- [ ] Cannot switch during active playback

### ✅ Reset Functionality
- [ ] Reset button clears everything
- [ ] Can start fresh animation after reset
- [ ] Reset works at any stage

### ✅ Tooltips
- [ ] Tooltips work on all animated components
- [ ] Tooltips work on greyed-out components
- [ ] Tooltips show correct information

### ✅ Keyboard Shortcuts
- [ ] Press 1, 2, 3 to switch and play paths
- [ ] Space to play/pause
- [ ] Arrow keys for step forward/back

## Known Behavior

### Expected:
- **Temenos_Core.png** and databases (Live, Archive, NVDB) appear in Path 2 and Path 3, stay visible ✅
- **Pub/Sub** appears in all three paths, stays visible after first appearance ✅
- **Complete diagram** shows ALL components from all paths after playing all three ✅

### Grey-Out Effect:
- **During playback ONLY:** Non-active paths become grey
- **After completion:** All paths return to full color
- **Idle state:** All previously animated components at full color

## Next Steps

As mentioned, the next phase will be **adjusting component positions** in the diagram to match your PowerPoint layout more precisely.

**Ready to adjust:**
- Component X/Y coordinates
- Component widths/heights
- Arrow paths and connections
- Spacing and alignment

---

**Status:** ✅ Complete and Ready to Test
**Updated:** November 13, 2025
**Next Phase:** Layout Positioning Adjustments
