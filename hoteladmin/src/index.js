import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './AuthContext';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
