import { Navigate } from "react-router-dom";
import { useAuth } from "../functions/useAuth";

export default function ProtectedRoute({ children, requiredRole }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" replace />;
  return children;
}
