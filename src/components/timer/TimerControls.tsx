import type { TimerStatus } from '../../types';
import styles from './TimerControls.module.css';

interface Props {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function TimerControls({ status, onStart, onPause, onResume, onReset }: Props) {
  const primaryLabel =
    status === 'idle' || status === 'done' ? 'Start'
    : status === 'running' ? 'Pause'
    : 'Resume';

  const primaryAction =
    status === 'idle' || status === 'done' ? onStart
    : status === 'running' ? onPause
    : onResume;

  return (
    <div className={styles.row}>
      <button className={styles.primary} onClick={primaryAction}>
        {primaryLabel}
      </button>
      {status !== 'idle' && (
        <button className={styles.ghost} onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}
