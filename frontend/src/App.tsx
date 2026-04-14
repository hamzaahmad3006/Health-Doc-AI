import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/Login/Login";
import RegisterPage from "./pages/auth/Register/Register";
import OverviewPage from "./pages/dashboard/Overview/Overview";
import DocumentsPage from "./pages/dashboard/Documents/Documents";
import MedicationsPage from "./pages/dashboard/Medications/Medications";
import SettingsPage from "./pages/dashboard/Settings/Settings";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes managed by DashboardLayout */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/overview" replace />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
