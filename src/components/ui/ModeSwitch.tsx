import type { Mode } from '../../types';
import styles from './ModeSwitch.module.css';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.tab} ${mode === 'timer' ? styles.active : ''}`}
        onClick={() => onChange('timer')}
      >
        Timer
      </button>
      <button
        className={`${styles.tab} ${mode === 'stopwatch' ? styles.active : ''}`}
        onClick={() => onChange('stopwatch')}
      >
        Stopwatch
      </button>
    </div>
  );
}
