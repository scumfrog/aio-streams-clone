import { Routes, Route, Navigate } from 'react-router-dom';
import Configure from './pages/Configure';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/configure" element={<Configure />} />
      <Route path="/dashboard/:userId" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
