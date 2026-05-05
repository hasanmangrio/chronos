import { formatStopwatch } from '../../utils/formatTime';
import styles from './LapList.module.css';

interface Props {
  laps: number[];
}

function fmt(ms: number): string {
  const { m, s, cs } = formatStopwatch(ms);
  return `${m}:${s}.${cs}`;
}

export function LapList({ laps }: Props) {
  if (laps.length === 0) return null;

  return (
    <div className={styles.container}>
      {[...laps].reverse().map((lap, revIdx) => {
        const idx = laps.length - 1 - revIdx;
        const prev = laps[idx - 1];
        const delta = prev !== undefined ? lap - prev : null;

        return (
          <div key={idx} className={styles.row}>
            <span className={styles.num}>Lap {idx + 1}</span>
            <span className={styles.time}>{fmt(lap)}</span>
            {delta !== null && (
              <span className={`${styles.delta} ${delta <= 0 ? styles.faster : styles.slower}`}>
                {delta <= 0 ? '-' : '+'}{fmt(Math.abs(delta))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
