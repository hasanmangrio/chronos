import { useState } from 'react';
import type { Mode } from './types';
import { NatureBackground } from './components/canvas/NatureBackground';
import { GlassCard } from './components/layout/GlassCard';
import { ModeSwitch } from './components/ui/ModeSwitch';
import { TimerMode } from './components/timer/TimerMode';
import { StopwatchMode } from './components/stopwatch/StopwatchMode';
import { SoundToggle } from './components/sound/SoundToggle';
import { VolumeSlider } from './components/sound/VolumeSlider';
import { useAmbientSound } from './hooks/useAmbientSound';
import styles from './App.module.css';

export default function App() {
  const [mode, setMode] = useState<Mode>('timer');
  const sound = useAmbientSound();

  return (
    <div className={styles.root}>
      <NatureBackground />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.wordmark}>Chronos</h1>
          <p className={styles.tagline}>Time, made peaceful</p>
        </header>

        <ModeSwitch mode={mode} onChange={setMode} />

        <GlassCard className={styles.card}>
          {mode === 'timer' ? <TimerMode /> : <StopwatchMode />}
        </GlassCard>
      </main>

      <div className={styles.soundControls}>
        <VolumeSlider
          volume={sound.volume}
          onChange={sound.setVolume}
          visible={sound.isOn}
        />
        <SoundToggle isOn={sound.isOn} onToggle={sound.toggle} />
      </div>
    </div>
  );
}
