import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const root = createRoot(document.getElementById('root')!);

if (/^\/tma\b/.test(window.location.pathname)) {
  import('./tma/TmaApp').then(({ default: TmaApp }) => {
    root.render(
      <StrictMode>
        <TmaApp />
      </StrictMode>
    );
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
