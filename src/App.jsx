import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Admin1Login from "./pages/Admin1Login";
import Admin2Login from "./pages/Admin2Login";
import Staff from "./pages/Staff";
import Staff1Login from "./pages/Staff1Login";
import Staff2Login from "./pages/Staff2Login";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin1" element={<Admin1Login />} />
        <Route path="/staff1" element={<Staff1Login />} />
        <Route path="/admin2" element={<Admin2Login />} />
        <Route path="/staff2" element={<Staff2Login />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute requiredRole="staff">
            <Staff />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
