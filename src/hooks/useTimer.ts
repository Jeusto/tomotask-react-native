import { useAppStateChange } from '@/hooks';
import { useNotification } from '@/hooks';
import { useSound } from '@/hooks';
import type { TimerMode, TimerState } from '@/models';
import { useAppSettingsStore } from '@/stores/settingsStore';
import { useTodolistStore } from '@/stores/todolistStore';
import { useRef, useState } from 'react';

const alarmSoundFile = require('@/../assets/audio/alarm-kitchen.mp3');

/**
 * Custom hook to handle the timer state
 */
export const useTimer = () => {
  const { playSound, stopSound } = useSound(alarmSoundFile);
  const { scheduleNotification, cancelNotification } = useNotification();
  const { incrementPomodoroCount } = useTodolistStore();
  const { settings } = useAppSettingsStore();

  const TIMER_MODES: Record<
    TimerMode,
    { duration: number; nextMode: TimerMode }
  > = {
    Focus: {
      duration: settings.pomodoro.focusDuration * 60 * 1000,
      nextMode: 'Short Break',
    },
    'Short Break': {
      duration: settings.pomodoro.shortBreakDuration * 60 * 1000,
      nextMode: 'Focus',
    },
    'Long Break': {
      duration: settings.pomodoro.longBreakDuration * 60 * 1000,
      nextMode: 'Focus',
    },
  };

  const leaveAppTimestamp = useRef<number | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentPomodoroCount, setCurrentPomodoroCount] = useState<number>(0);
  const [timerState, setTimerState] = useState<TimerState>({
    countdown: TIMER_MODES.Focus.duration,
    mode: 'Focus',
    isRunning: false,
  });

  // If the app goes into the background, save the timestamp so that we can
  // calculate how much time has passed when the app comes back to the foreground
  useAppStateChange({
    onChangeFromActiveToBackground: () => {
      leaveAppTimestamp.current = Date.now();
    },
    onChangeFromBackgroundToActive: () => {
      removeElapsedTimeFromTimer();
    },
  });

  /**
   * Remove the elapsed time from the timer countdown
   */
  const removeElapsedTimeFromTimer = () => {
    if (leaveAppTimestamp.current && timerState.isRunning) {
      const currentTimestamp = Date.now();
      const elapsedMilliseconds = currentTimestamp - leaveAppTimestamp.current;
      const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

      if (elapsedSeconds > 0) {
        setTimerState((prev) => ({
          ...prev,
          countdown: Math.max(0, prev.countdown - elapsedMilliseconds),
        }));

        leaveAppTimestamp.current = null;
      }
    }
  };

  /**
   * Start the countdown and set the timer interval
   */
  const startCountdown = () => {
    const id = setInterval(
      () =>
        setTimerState((prev) => ({
          ...prev,
          countdown: prev.countdown - 1000,
        })),
      1000,
    );

    setTimerState({ ...timerState, isRunning: true });
    setIntervalId(id);
    scheduleNotification(
      `Time's up!`,
      `Time for the next mode: "${TIMER_MODES[timerState.mode].nextMode}"`,
      timerState.countdown / 1000,
    );
  };

  /**
   * Stop the countdown and clear the timer interval
   */
  const stopCountdown = () => {
    if (intervalId) clearInterval(intervalId);
    cancelNotification();
  };

  /**
   * Toggle the timer between running and stopped depending on the current state
   */
  const toggleTimer = () => {
    timerState.isRunning ? stopCountdown() : startCountdown();

    stopSound();
    setTimerState({
      ...timerState,
      isRunning: !timerState.isRunning,
    });
  };

  /**
   * Set the next timer mode based on the current mode
   * and the current pomodoro count
   */
  const setNextTimerMode = () => {
    const currentMode = TIMER_MODES[timerState.mode];
    const newPomodoroCount = currentPomodoroCount + 1;

    if (timerState.mode === 'Focus') {
      incrementPomodoroCount();
      setCurrentPomodoroCount(currentPomodoroCount + 1);
    }

    if (
      timerState.mode === 'Focus' &&
      newPomodoroCount === settings.pomodoro.longBreakInterval
    ) {
      setTimerMode('Long Break');
      setCurrentPomodoroCount(0);
    } else {
      setTimerMode(currentMode.nextMode);
    }
  };

  /**
   * Set the timer mode and reset the countdown
   * @param mode The timer mode to set
   */
  const setTimerMode = (mode: TimerMode) => {
    setTimerState({
      ...timerState,
      mode,
      countdown: TIMER_MODES[mode].duration,
      isRunning: settings.pomodoro.autoStartNextRound,
    });

    if (!settings.pomodoro.autoStartNextRound) {
      stopCountdown();
      startCountdown();
    }

    cancelNotification();
  };

  return {
    countdown: timerState.countdown,
    mode: timerState.mode,
    isRunning: timerState.isRunning,
    toggleTimer,
    setNextTimerMode,
    setTimerMode,
  };
};
