import { useState } from 'react';
import type { ForestState, SessionConfig } from '../types';
import { SPECIES } from '../types';
import { DurationPicker } from '../components/game/DurationPicker';
import { ForestStats } from '../components/game/ForestStats';
import styles from './SetupScreen.module.css';

interface Props {
  forest: ForestState;
  onStart: (config: SessionConfig) => void;
}

function randomSpecies(): SessionConfig['species'] {
  return SPECIES[Math.floor(Math.random() * SPECIES.length)];
}

export function SetupScreen({ forest, onStart }: Props) {
  const [durationMs, setDurationMs] = useState(25 * 60_000);

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>Chronos</h1>
        <p className={styles.tagline}>Grow a forest, one focus session at a time</p>
      </header>

      <div className={styles.card}>
        <ForestStats forest={forest} />
        <div className={styles.divider} />
        <DurationPicker value={durationMs} onChange={setDurationMs} />
        <button
          className={styles.plantBtn}
          onClick={() => onStart({ durationMs, species: randomSpecies() })}
        >
          <span className={styles.plantIcon}>🌱</span>
          Plant a tree
        </button>
      </div>
    </div>
  );
}
