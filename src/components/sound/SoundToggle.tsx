import styles from './SoundToggle.module.css';

interface Props {
  isOn: boolean;
  onToggle: () => void;
}

export function SoundToggle({ isOn, onToggle }: Props) {
  return (
    <button
      className={`${styles.btn} ${isOn ? styles.on : ''}`}
      onClick={onToggle}
      title={isOn ? 'Mute ambient sound' : 'Play ambient sound'}
      aria-label={isOn ? 'Mute ambient sound' : 'Play ambient sound'}
    >
      {isOn ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      )}
      <span className={styles.label}>{isOn ? 'Sounds on' : 'Sounds off'}</span>
    </button>
  );
}
