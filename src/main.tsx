import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('WardWise NG could not find the root element.');

createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
