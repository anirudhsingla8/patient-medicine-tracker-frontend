import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import DashboardPage from './features/dashboard/DashboardPage';
import MedicinesListPage from './features/medicines/pages/MedicinesListPage';
import ProfilesListPage from './features/profiles/ProfilesListPage';
import ProfileMedicinesListPage from './features/medicines/pages/ProfileMedicinesListPage';
import SchedulesListPage from './features/schedules/SchedulesListPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Redirect root to app dashboard */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="medicines" element={<MedicinesListPage />} />
          <Route path="profiles" element={<ProfilesListPage />} />
          <Route path="profiles/:profileId/medicines" element={<ProfileMedicinesListPage />} />
          <Route path="medicines/:medicineId/schedules" element={<SchedulesListPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
