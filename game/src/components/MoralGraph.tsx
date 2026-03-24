import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import './MoralGraph.css';

export default function MoralGraph() {
  const { t } = useTranslation();
  const xPerc = useGameStore((s) => s.xPerc);
  const yPerc = useGameStore((s) => s.yPerc);

  return (
    <div className="moral-graph" id="grid">
      <div className="quad q1" />
      <div className="quad q2" />
      <div className="quad q3" />
      <div className="quad q4" />

      <div className="xlabel left">{t('graph.deontology')}</div>
      <div className="xlabel right">{t('graph.consequentialism')}</div>
      <div className="ylabel top">{t('graph.socialContract')}</div>
      <div className="ylabel bottom">{t('graph.libertarianism')}</div>

      <div
        className="graph-point"
        style={{ left: `${xPerc}%`, top: `${yPerc}%` }}
      />
    </div>
  );
}
