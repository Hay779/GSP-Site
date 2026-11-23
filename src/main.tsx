// Polices hébergées sur le site (pas d'appel à Google Fonts : plus rapide et conforme RGPD).
import '@fontsource-variable/dm-sans/opsz.css';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
