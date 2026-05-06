import { SessionPhase } from '../types';
import type { ForestState, SessionConfig, TreeStage, TreeSpecies } from '../types';
import { ForestCanvas } from '../components/canvas/ForestCanvas';
import { SessionHUD } from '../components/hud/SessionHUD';
import styles from './SessionScreen.module.css';

interface Props {
  phase: SessionPhase;
  treeStage: TreeStage;
  species: TreeSpecies;
  remainingMs: number;
  progress: number;
  config: SessionConfig | null;
  forest: ForestState;
  onPhaseAnimationComplete: (p: SessionPhase) => void;
  onAbandon: () => void;
}

const SPECIES_LABELS: Record<TreeSpecies, string> = {
  oak:    'oak tree',
  pine:   'pine tree',
  cherry: 'cherry blossom',
  maple:  'maple tree',
};

export function SessionScreen({
  phase, treeStage, species, remainingMs, progress, config,
  forest, onPhaseAnimationComplete, onAbandon,
}: Props) {
  const canAbandon = phase === SessionPhase.Growing || phase === SessionPhase.Planting;
  const speciesLabel = config ? SPECIES_LABELS[config.species] : 'tree';

  const isEnding = phase === SessionPhase.Complete || phase === SessionPhase.Abandoned;

  return (
    <div className={styles.root}>
      <ForestCanvas
        phase={phase}
        treeStage={treeStage}
        species={species}
        forest={forest}
        onPhaseAnimationComplete={onPhaseAnimationComplete}
      />

      <SessionHUD
        phase={phase}
        remainingMs={remainingMs}
        progress={progress}
        speciesLabel={speciesLabel}
      />

      {phase === SessionPhase.Complete && (
        <div className={styles.resultBadge + ' ' + styles.success}>
          <span className={styles.resultEmoji}>🌳</span>
          <span className={styles.resultText}>Tree saved to your forest!</span>
        </div>
      )}

      {phase === SessionPhase.Abandoned && (
        <div className={styles.resultBadge + ' ' + styles.fail}>
          <span className={styles.resultEmoji}>🪓</span>
          <span className={styles.resultText}>Your tree didn't make it…</span>
        </div>
      )}

      {canAbandon && !isEnding && (
        <button className={styles.abandonBtn} onClick={onAbandon}>
          Give up
        </button>
      )}
    </div>
  );
}
