import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LandingPage from './LandingPage';

function Root() {
  const [showApp, setShowApp] = useState(
    new URLSearchParams(window.location.search).has('app')
  );

  if (showApp) {
    return <App />;
  }

  return <LandingPage onEnter={() => setShowApp(true)} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
