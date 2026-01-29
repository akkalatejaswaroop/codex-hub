import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import GuidelinesPage from './pages/Guidelines';
import ExamPage from './pages/Exam';
import AdminPage from './pages/Admin';
import ResultPage from './pages/Result';
import WaitingPage from './pages/WaitingRoom';
import { isMobile, isTablet } from 'react-device-detect';
import { Monitor } from 'lucide-react';

function App() {
  if ((isMobile || isTablet) && !window.location.pathname.includes('/network-logs') && !window.location.pathname.includes('/admin')) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Monitor size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Desktop Device Required</h1>
        <p className="text-zinc-400 max-w-sm">
          The Codex Examination Platform is strictly optimized for Desktop use to ensure exam integrity. Please access this URL from a computer.
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/network-logs" element={<AdminPage />} />
        <Route path="/admin" element={<Navigate to="/network-logs" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
