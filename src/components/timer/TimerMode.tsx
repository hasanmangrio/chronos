import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { DigitInput } from '../ui/DigitInput';
import styles from './TimerMode.module.css';

export function TimerMode() {
  const timer = useTimer();

  return (
    <div className={styles.wrapper}>
      {timer.status === 'idle' ? (
        <div className={styles.inputs}>
          <DigitInput value={timer.inputH} max={23} label="hrs" onChange={(v) => timer.setInput('h', v)} />
          <span className={styles.colon}>:</span>
          <DigitInput value={timer.inputM} max={59} label="min" onChange={(v) => timer.setInput('m', v)} />
          <span className={styles.colon}>:</span>
          <DigitInput value={timer.inputS} max={59} label="sec" onChange={(v) => timer.setInput('s', v)} />
        </div>
      ) : (
        <TimerDisplay
          remaining={timer.remaining}
          total={timer.total}
          status={timer.status}
        />
      )}

      <TimerControls
        status={timer.status}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onReset={timer.reset}
      />
    </div>
  );
}
