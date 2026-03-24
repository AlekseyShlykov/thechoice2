import { useGameStore } from '../store/gameStore';
import './ProgressDots.css';

export default function ProgressDots() {
  const dot1 = useGameStore((s) => s.dot1Color);
  const dot2 = useGameStore((s) => s.dot2Color);
  const dot3 = useGameStore((s) => s.dot3Color);
  const dot4 = useGameStore((s) => s.dot4Color);
  const dot5 = useGameStore((s) => s.dot5Color);

  const dots = [dot1, dot2, dot3, dot4, dot5];

  return (
    <div className="progress-dots">
      {dots.map((color, i) => (
        <span
          key={i}
          className={`dot ${color === 'green' ? 'dot--active' : ''}`}
        />
      ))}
    </div>
  );
}
