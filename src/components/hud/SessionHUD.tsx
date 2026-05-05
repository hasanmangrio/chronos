import { SessionPhase } from '../../types';
import { formatCountdown } from '../../utils/formatTime';
import styles from './SessionHUD.module.css';

interface Props {
  phase: SessionPhase;
  remainingMs: number;
  progress: number;
  speciesLabel: string;
}

export function SessionHUD({ phase, remainingMs, progress, speciesLabel }: Props) {
  const { h, m, s } = formatCountdown(remainingMs);
  const visible = phase === SessionPhase.Growing || phase === SessionPhase.WalkingIn || phase === SessionPhase.Planting;

  return (
    <div className={`${styles.wrapper} ${!visible ? styles.hidden : ''}`}>
      <div className={styles.timerRow}>
        <span className={styles.digits}>
          {h !== '00' && <>{h}<span className={styles.sep}>:</span></>}
          {m}<span className={styles.sep}>:</span>{s}
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className={styles.sub}>{speciesLabel} growing…</p>
    </div>
  );
}
