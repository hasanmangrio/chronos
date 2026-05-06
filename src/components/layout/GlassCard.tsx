import type { ReactNode } from 'react';
import styles from './GlassCard.module.css';

interface Props {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: Props) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      {children}
    </div>
  );
}
