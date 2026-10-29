import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrolling; keep navigation tests focused on app behaviour.
window.scrollTo = () => undefined;
