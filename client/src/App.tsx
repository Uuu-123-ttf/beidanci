import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { ReviewPage } from './pages/ReviewPage';
import { WordsPage } from './pages/WordsPage';
import { WordBooksPage } from './pages/WordBooksPage';
import { ImportPage } from './pages/ImportPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/wordbooks" element={<WordBooksPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/review" replace />} />
      </Routes>
    </AuthProvider>
  );
}
