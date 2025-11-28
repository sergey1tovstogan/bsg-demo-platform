# Data Architecture Hooks

This directory contains custom React hooks for the Data Architecture component. These hooks encapsulate complex stateful logic and provide a clean, reusable API for managing animations, data flows, and user interactions.

## Overview

The hooks in this directory were extracted from the main `DataArchitectureContent.tsx` component as part of a refactoring effort to:

- **Reduce component complexity** (~500 lines removed from main component)
- **Improve code reusability** (hooks can be used across components)
- **Enhance testability** (hooks can be tested independently)
- **Separate concerns** (UI vs. business logic)

## Available Hooks

### `useDataFlow`

Manages the lifecycle of animated dots (business and data events) as they move through the data architecture diagram.

**Purpose:**
- Spawns business and data event dots at timed intervals
- Handles transitions between animation segments
- Manages cleanup of completed animations

**Key Features:**
- Automatic spawning based on selected path
- Path-specific transition logic
- Dot splitting at fork points (Path 2/3)
- Interval cleanup on unmount

**Usage:**
```tsx
const { activeDataFlows, setActiveDataFlows, setShouldStartSpawning } = useDataFlow({
  selectedPath: 'path-c',
  shouldStartSpawning: true,
  shouldSpawnContinuously: false,
})
```

**Data Flow Paths:**
- **Business Events:** Events → Pub/Sub → Microservices
- **Data Events (Path 1):** Events → Pub/Sub (end)
- **Data Events (Path 2/3):** Events → Pub/Sub → Fork → Split → ETL/DataHub

---

### `useAnimationPlayback`

Manages playback controls for the animation (play, pause, reset, step forward/back).

**Purpose:**
- Track current playback state (idle, playing, paused, completed)
- Provide handlers for playback controls
- Manage state transitions between playback modes

**Key Features:**
- State machine for playback states
- Callback support for custom behavior
- Memoized handlers with `useCallback`

**Usage:**
```tsx
const { playbackState, handlePlay, handlePause, handleReset } = useAnimationPlayback({
  onPlay: () => console.log('Animation started'),
  onPause: () => console.log('Animation paused'),
  onReset: () => resetAllState(),
})
```

**State Transitions:**
```
idle → playing → paused → playing
           ↓
      completed → playing (restart)
```

---

### `usePathSelection`

Manages selection of animation paths (Path 1, Path 2, Path 3).

**Purpose:**
- Track currently selected path
- Provide helper to change paths with callbacks
- Support initial path configuration

**Key Features:**
- Simple path state management
- Optional change callbacks
- Default path support

**Usage:**
```tsx
const { selectedPath, selectPath } = usePathSelection({
  initialPath: 'path-c',
  onPathChange: (path) => console.log('Switched to', path),
})

// Later in UI
<button onClick={() => selectPath('path-a')}>Path 1</button>
```

**Available Paths:**
- `path-c` (Path 1): Event-driven processing
- `path-b` (Path 2): Batch processing
- `path-a` (Path 3): Real-time streaming

---

## Architecture

### Hook Dependencies

```
DataArchitectureContent.tsx
  ├── usePathSelection (path state)
  ├── useDataFlow (animation logic)
  │   └── uses: selectedPath from usePathSelection
  └── useAnimationPlayback (playback controls)
```

### Data Flow

1. **User selects path** → `usePathSelection` updates `selectedPath`
2. **selectedPath changes** → `useDataFlow` spawns/transitions dots accordingly
3. **User clicks play** → `useAnimationPlayback` manages playback state
4. **Dots animate** → `useDataFlow` handles transitions and cleanup

### Type Safety

All hooks use TypeScript interfaces for:
- **Props interfaces:** Define input parameters
- **Return interfaces:** Define return values
- **Type imports:** Reference shared types from `../types.ts`

---

## Implementation Details

### `useDataFlow` Internals

**Spawning Logic:**
- Business events spawn first after `SPAWNING_START_DELAY` (1000ms)
- Data events spawn `DATA_EVENT_DELAY` (500ms) after business events
- Recurring spawning every `BUSINESS_EVENT_INTERVAL` (5000ms)
- Only spawns for `path-a`, `path-c`, or when `shouldSpawnContinuously` is true

**Transition Logic:**
- Checks dot age every `ANIMATION_CHECK_INTERVAL` (16ms ~ 60fps)
- Transitions occur when dot age exceeds `SEGMENT_DURATIONS[segment]`
- Uses `TRANSITION_BUFFER` (100ms) to ensure smooth transitions
- Dots split into two at fork points (Path 2/3 only)

**Cleanup:**
- Clears spawning intervals on unmount
- Clears transition intervals on unmount
- Removes completed dots from state

### `useAnimationPlayback` Internals

**State Management:**
- Uses `useState` for `playbackState`
- All handlers are memoized with `useCallback`
- Dependencies properly tracked for callback updates

**Handler Logic:**
- `handlePlay`: Starts from idle/completed, resumes from paused
- `handlePause`: Only pauses if currently playing
- `handleReset`: Always calls onReset callback
- `handleStepForward/Back`: Direct callback invocation

### `usePathSelection` Internals

**State Management:**
- Simple `useState` for path tracking
- `selectPath` helper combines state update + callback

**Default Behavior:**
- Defaults to `path-c` if no initialPath provided
- Supports all optional parameters

---

## Configuration Dependencies

These hooks rely on configuration files in `../config/`:

- **`transitions.config.ts`:**
  - `TIMING` constants (delays, intervals)
  - `SEGMENT_DURATIONS` (how long dots stay in each segment)

- **`components.config.ts`:**
  - Component and arrow definitions (used for rendering)

- **`animations.config.ts`:**
  - Path sequences and metadata

---

## Testing Recommendations

### Unit Testing Hooks

Use `@testing-library/react-hooks` for isolated hook testing:

```tsx
import { renderHook, act } from '@testing-library/react-hooks'
import { useDataFlow } from './useDataFlow'

test('spawns dots when shouldStartSpawning is true', () => {
  const { result } = renderHook(() => useDataFlow({
    selectedPath: 'path-c',
    shouldStartSpawning: true,
    shouldSpawnContinuously: false,
  }))

  // Wait for spawning delay
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 1100))
  })

  expect(result.current.activeDataFlows.length).toBeGreaterThan(0)
})
```

### Integration Testing

Test hooks together in the context of `DataArchitectureContent.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataArchitectureContent from '../DataArchitectureContent'

test('switching paths updates data flows', async () => {
  render(<DataArchitectureContent />)

  const path2Button = screen.getByText(/Path 2/i)
  await userEvent.click(path2Button)

  // Assert data flows updated
})
```

---

## Performance Considerations

### `useDataFlow`
- Uses `setInterval` for continuous animation checks (runs at 60fps)
- Consider reducing `ANIMATION_CHECK_INTERVAL` if performance issues arise
- Dots are automatically cleaned up when animation completes

### `useAnimationPlayback`
- All handlers are memoized with `useCallback`
- No performance concerns (minimal state updates)

### `usePathSelection`
- Trivial state management
- No performance concerns

---

## Future Enhancements

Potential improvements for these hooks:

1. **useDataFlow:**
   - Add support for custom transition curves
   - Implement dot collision detection
   - Add support for dynamic path generation

2. **useAnimationPlayback:**
   - Add playback speed control (0.5x, 1x, 2x)
   - Implement timeline scrubbing
   - Add loop/repeat functionality

3. **usePathSelection:**
   - Add path validation
   - Implement path preloading
   - Add transition animations between paths

---

## Related Files

- **Main Component:** `../DataArchitectureContent.tsx`
- **Type Definitions:** `../types.ts`
- **Configuration:** `../config/`
  - `components.config.ts`
  - `animations.config.ts`
  - `transitions.config.ts`
- **Barrel Export:** `../config/index.ts`

---

## Migration Notes

These hooks were extracted during Phase 2 refactoring (Steps 8-11):

- **Step 8:** Created `useDataFlow` hook (~240 lines)
- **Step 9:** Created `useAnimationPlayback` hook (~70 lines)
- **Step 10:** Created `usePathSelection` hook (~35 lines)
- **Step 11:** Created barrel export (`config/index.ts`)

**Result:** Main component reduced from ~1036 lines to ~500 lines (48% reduction).

---

## Questions?

For questions about these hooks, refer to:
- JSDoc comments in each hook file
- Type definitions in `../types.ts`
- Configuration files in `../config/`
