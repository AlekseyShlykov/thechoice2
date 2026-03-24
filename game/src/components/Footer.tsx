import SoundButton from './SoundButton';
import ProgressDots from './ProgressDots';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="game-footer">
      <SoundButton />
      <ProgressDots />
      <button
        className="site-button"
        onClick={() => window.open('https://buildtounderstand.dev/', '_blank')}
        aria-label="Visit site"
      >
        <img src="assets/site.png" alt="Site" width={32} height={22} />
      </button>
    </footer>
  );
}
