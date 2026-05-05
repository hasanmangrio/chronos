import { useStopwatch } from '../../hooks/useStopwatch';
import { StopwatchDisplay } from './StopwatchDisplay';
import { StopwatchControls } from './StopwatchControls';
import { LapList } from './LapList';
import styles from './StopwatchMode.module.css';

export function StopwatchMode() {
  const sw = useStopwatch();

  return (
    <div className={styles.wrapper}>
      <StopwatchDisplay elapsed={sw.elapsed} />
      <StopwatchControls
        status={sw.status}
        onStart={sw.start}
        onStop={sw.stop}
        onReset={sw.reset}
        onLap={sw.lap}
      />
      <LapList laps={sw.laps} />
    </div>
  );
}
