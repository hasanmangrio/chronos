import { useState, useCallback, useEffect } from 'react';
import { SessionPhase } from './types';
import type { SessionConfig } from './types';
import { useForest } from './hooks/useForest';
import { useGameSession } from './hooks/useGameSession';
import { useAmbientSound } from './hooks/useAmbientSound';
import { SetupScreen } from './screens/SetupScreen';
import { SessionScreen } from './screens/SessionScreen';
import { ForestCanvas } from './components/canvas/ForestCanvas';
import { SoundToggle } from './components/sound/SoundToggle';
import { VolumeSlider } from './components/sound/VolumeSlider';
import styles from './App.module.css';

type Screen = 'setup' | 'session';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const { forest, saveTree, recordAbandoned } = useForest();
  const sound = useAmbientSound();

  const handleComplete = useCallback((config: SessionConfig) => {
    saveTree(config);
  }, [saveTree]);

  const session = useGameSession(handleComplete, recordAbandoned);

  const handleStart = useCallback((config: SessionConfig) => {
    session.startSession(config);
    setScreen('session');
  }, [session]);

  const handleAbandon = useCallback(() => {
    session.abandonSession();
  }, [session]);

  useEffect(() => {
    if (session.phase === SessionPhase.Idle && screen === 'session') {
      setScreen('setup');
    }
  }, [session.phase, screen]);

  return (
    <div className={styles.root}>
      {screen === 'setup' ? (
        <>
          <ForestCanvas
            phase={SessionPhase.Idle}
            treeStage={0}
            species="oak"
            forest={forest}
            onPhaseAnimationComplete={() => {}}
          />
          <SetupScreen forest={forest} onStart={handleStart} />
        </>
      ) : (
        <SessionScreen
          phase={session.phase}
          treeStage={session.treeStage}
          species={session.config?.species ?? 'oak'}
          remainingMs={session.remainingMs}
          progress={session.progress}
          config={session.config}
          forest={forest}
          onPhaseAnimationComplete={session.onPhaseAnimationComplete}
          onAbandon={handleAbandon}
        />
      )}

      <div className={styles.soundControls}>
        <VolumeSlider volume={sound.volume} onChange={sound.setVolume} visible={sound.isOn} />
        <SoundToggle isOn={sound.isOn} onToggle={sound.toggle} />
      </div>
    </div>
  );
}
