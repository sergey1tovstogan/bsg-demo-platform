import { useState, useCallback } from 'react'
import type { PlaybackState } from '../types'

/**
 * Props for the useAnimationPlayback hook
 */
interface UseAnimationPlaybackProps {
  /** Callback invoked when play is triggered */
  onPlay?: () => void
  /** Callback invoked when pause is triggered */
  onPause?: () => void
  /** Callback invoked when reset is triggered */
  onReset?: () => void
  /** Callback invoked when stepping forward */
  onStepForward?: () => void
  /** Callback invoked when stepping backward */
  onStepBack?: () => void
}

/**
 * Return value from the useAnimationPlayback hook
 */
interface UseAnimationPlaybackReturn {
  /** Current playback state (idle, playing, paused, completed) */
  playbackState: PlaybackState
  /** Setter for manually updating playback state */
  setPlaybackState: React.Dispatch<React.SetStateAction<PlaybackState>>
  /** Handler for play button - starts or resumes animation */
  handlePlay: () => void
  /** Handler for pause button - pauses running animation */
  handlePause: () => void
  /** Handler for reset button - stops and resets animation */
  handleReset: () => void
  /** Handler for step forward button - advances animation one step */
  handleStepForward: () => void
  /** Handler for step back button - rewinds animation one step */
  handleStepBack: () => void
}

/**
 * Custom hook for managing animation playback controls.
 *
 * Provides state management and event handlers for controlling animation playback,
 * including play, pause, reset, and step-by-step navigation. Manages transitions
 * between different playback states (idle, playing, paused, completed).
 *
 * @param props - Optional callbacks for playback events
 * @returns Playback state and control handlers
 *
 * @example
 * ```tsx
 * const { playbackState, handlePlay, handlePause, handleReset } = useAnimationPlayback({
 *   onPlay: () => console.log('Animation started'),
 *   onPause: () => console.log('Animation paused'),
 *   onReset: () => console.log('Animation reset'),
 * })
 * ```
 *
 * **State Transitions:**
 * - `idle` → `playing` (via handlePlay)
 * - `playing` → `paused` (via handlePause)
 * - `paused` → `playing` (via handlePlay)
 * - `completed` → `playing` (via handlePlay - restarts)
 * - any → `idle` (via handleReset)
 */
export function useAnimationPlayback({
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBack,
}: UseAnimationPlaybackProps = {}): UseAnimationPlaybackReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')

  const handlePlay = useCallback(() => {
    if (playbackState === 'idle' || playbackState === 'completed') {
      onPlay?.()
    } else if (playbackState === 'paused') {
      setPlaybackState('playing')
      onPlay?.()
    }
  }, [playbackState, onPlay])

  const handlePause = useCallback(() => {
    if (playbackState === 'playing') {
      setPlaybackState('paused')
      onPause?.()
    }
  }, [playbackState, onPause])

  const handleReset = useCallback(() => {
    onReset?.()
  }, [onReset])

  const handleStepForward = useCallback(() => {
    onStepForward?.()
  }, [onStepForward])

  const handleStepBack = useCallback(() => {
    onStepBack?.()
  }, [onStepBack])

  return {
    playbackState,
    setPlaybackState,
    handlePlay,
    handlePause,
    handleReset,
    handleStepForward,
    handleStepBack,
  }
}
