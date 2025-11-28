import { useState } from 'react'
import type { AnimationPath } from '../types'

/**
 * Props for the usePathSelection hook
 */
interface UsePathSelectionProps {
  /** Initial path to select on mount (defaults to 'path-c') */
  initialPath?: AnimationPath
  /** Callback invoked when path changes */
  onPathChange?: (path: AnimationPath) => void
}

/**
 * Return value from the usePathSelection hook
 */
interface UsePathSelectionReturn {
  /** Currently selected animation path */
  selectedPath: AnimationPath
  /** Setter for manually updating the selected path */
  setSelectedPath: React.Dispatch<React.SetStateAction<AnimationPath>>
  /** Helper function to select a path and trigger the onPathChange callback */
  selectPath: (path: AnimationPath) => void
}

/**
 * Custom hook for managing path selection.
 *
 * Provides state management for switching between different animation paths
 * (path-a, path-b, path-c). Handles path selection with optional change callbacks.
 *
 * @param props - Configuration for path selection behavior
 * @returns Path state and selection controls
 *
 * @example
 * ```tsx
 * const { selectedPath, selectPath } = usePathSelection({
 *   initialPath: 'path-c',
 *   onPathChange: (path) => console.log('Switched to', path),
 * })
 *
 * // Later in UI
 * <button onClick={() => selectPath('path-a')}>Path 1</button>
 * ```
 *
 * **Available Paths:**
 * - `path-c` (Path 1): Event-driven processing → Pub/Sub → Microservices
 * - `path-b` (Path 2): Batch processing → Pub/Sub → Fork → ETL/DataHub
 * - `path-a` (Path 3): Real-time streaming → Pub/Sub → Fork → ETL/DataHub
 */
export function usePathSelection({
  initialPath = 'path-c',
  onPathChange,
}: UsePathSelectionProps = {}): UsePathSelectionReturn {
  const [selectedPath, setSelectedPath] = useState<AnimationPath>(initialPath)

  const selectPath = (path: AnimationPath) => {
    setSelectedPath(path)
    onPathChange?.(path)
  }

  return {
    selectedPath,
    setSelectedPath,
    selectPath,
  }
}
