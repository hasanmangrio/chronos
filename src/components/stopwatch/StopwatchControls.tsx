import type { StopwatchStatus } from '../../types';
import styles from './StopwatchControls.module.css';

interface Props {
  status: StopwatchStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onLap: () => void;
}

export function StopwatchControls({ status, onStart, onStop, onReset, onLap }: Props) {
  return (
    <div className={styles.row}>
      {status === 'idle' && (
        <button className={styles.primary} onClick={onStart}>Start</button>
      )}
      {status === 'running' && (
        <>
          <button className={styles.secondary} onClick={onLap}>Lap</button>
          <button className={styles.primary} onClick={onStop}>Stop</button>
        </>
      )}
      {status === 'stopped' && (
        <>
          <button className={styles.ghost} onClick={onReset}>Reset</button>
          <button className={styles.primary} onClick={onStart}>Resume</button>
        </>
      )}
    </div>
  );
}
