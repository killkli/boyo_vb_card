import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { ProfileSelector } from './pages/ProfileSelector';
import { ProfileCreator } from './pages/ProfileCreator';
import { useUser } from './contexts/UserContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/profile-select" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter basename="/boyo_vb_card">
      <Routes>
        <Route path="/profile-select" element={<ProfileSelector />} />
        <Route path="/profile-create" element={<ProfileCreator />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:level"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
