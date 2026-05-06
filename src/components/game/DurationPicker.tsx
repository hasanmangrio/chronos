import { useState } from 'react';
import { PRESET_DURATIONS } from '../../types';
import styles from './DurationPicker.module.css';

interface Props {
  value: number; // ms
  onChange: (ms: number) => void;
}

export function DurationPicker({ value, onChange }: Props) {
  const [customMin, setCustomMin] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handlePreset = (ms: number) => {
    setUseCustom(false);
    setCustomMin('');
    onChange(ms);
  };

  const handleCustom = (raw: string) => {
    setCustomMin(raw);
    const mins = parseInt(raw, 10);
    if (!isNaN(mins) && mins >= 1 && mins <= 480) {
      setUseCustom(true);
      onChange(mins * 60_000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Focus duration</p>
      <div className={styles.presets}>
        {PRESET_DURATIONS.map(d => (
          <button
            key={d.ms}
            className={`${styles.pill} ${!useCustom && value === d.ms ? styles.active : ''}`}
            onClick={() => handlePreset(d.ms)}
          >
            <span className={styles.pillMain}>{d.label}</span>
            <span className={styles.pillSub}>{d.sub}</span>
          </button>
        ))}
      </div>
      <div className={styles.customRow}>
        <input
          type="number"
          className={`${styles.customInput} ${useCustom ? styles.activeInput : ''}`}
          placeholder="—"
          min={1}
          max={480}
          value={customMin}
          onChange={e => handleCustom(e.target.value)}
        />
        <span className={styles.customLabel}>min custom</span>
      </div>
    </div>
  );
}
