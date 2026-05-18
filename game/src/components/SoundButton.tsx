import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { assetUrl } from '../utils/assetUrl';
import './SoundButton.css';

export default function SoundButton() {
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(assetUrl('assets/music.mp3'));
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [soundOn]);

  return (
    <button className="sound-button" onClick={toggleSound} aria-label="Toggle sound">
      <img
        src={assetUrl(soundOn ? 'assets/soundon.png' : 'assets/soundoff.png')}
        alt={soundOn ? 'Sound on' : 'Sound off'}
        width={32}
        height={22}
      />
    </button>
  );
}
