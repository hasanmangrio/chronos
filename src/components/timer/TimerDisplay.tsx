import { formatCountdown } from '../../utils/formatTime';
import type { TimerStatus } from '../../types';
import styles from './TimerDisplay.module.css';

interface Props {
  remaining: number;
  total: number;
  status: TimerStatus;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDisplay({ remaining, total, status }: Props) {
  const { h, m, s } = formatCountdown(remaining);
  const progress = total > 0 ? remaining / total : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isDone = status === 'done';

  return (
    <div className={`${styles.wrapper} ${isDone ? styles.done : ''}`}>
      <svg className={styles.ring} viewBox="0 0 290 290">
        {/* Track */}
        <circle
          cx="145" cy="145" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
        />
        {/* Progress arc */}
        <circle
          cx="145" cy="145" r={RADIUS}
          fill="none"
          stroke={isDone ? '#e07a5f' : '#4ecca3'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 145 145)"
          style={{ transition: 'stroke-dashoffset 0.15s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className={`${styles.digits} ${isDone ? styles.pulse : ''}`}>
        <span className={styles.time}>
          {h !== '00' && <><span>{h}</span><span className={styles.sep}>:</span></>}
          <span>{m}</span>
          <span className={styles.sep}>:</span>
          <span>{s}</span>
        </span>
        {isDone && <span className={styles.doneLabel}>complete</span>}
      </div>
    </div>
  );
}
