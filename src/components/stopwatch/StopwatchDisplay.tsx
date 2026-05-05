import { formatStopwatch } from '../../utils/formatTime';
import styles from './StopwatchDisplay.module.css';

interface Props {
  elapsed: number;
}

export function StopwatchDisplay({ elapsed }: Props) {
  const { m, s, cs } = formatStopwatch(elapsed);

  return (
    <div className={styles.wrapper}>
      <span className={styles.main}>
        <span>{m}</span>
        <span className={styles.sep}>:</span>
        <span>{s}</span>
      </span>
      <span className={styles.centiseconds}>.{cs}</span>
    </div>
  );
}
