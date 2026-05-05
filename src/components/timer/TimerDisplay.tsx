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
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F7C948" />
          </linearGradient>
          <linearGradient id="ringGradDone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A65" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
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
          stroke={isDone ? 'url(#ringGradDone)' : 'url(#ringGrad)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 145 145)"
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
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
