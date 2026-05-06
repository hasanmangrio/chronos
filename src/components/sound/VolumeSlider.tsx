import styles from './VolumeSlider.module.css';

interface Props {
  volume: number;
  onChange: (v: number) => void;
  visible: boolean;
}

export function VolumeSlider({ volume, onChange, visible }: Props) {
  return (
    <div className={`${styles.wrapper} ${visible ? styles.visible : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      </svg>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={1}
        step={0.02}
        value={volume}
        disabled={!visible}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ '--fill': `${volume * 100}%` } as React.CSSProperties}
      />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    </div>
  );
}
