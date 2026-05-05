import styles from './DigitInput.module.css';

interface Props {
  value: number;
  max: number;
  label: string;
  onChange: (n: number) => void;
}

export function DigitInput({ value, max, label, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <input
        type="number"
        className={styles.input}
        value={value}
        min={0}
        max={max}
        onChange={(e) => {
          const v = Math.min(max, Math.max(0, parseInt(e.target.value, 10) || 0));
          onChange(v);
        }}
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
