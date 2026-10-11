import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const HOME = { ADMIN: "/admin", FACULTY: "/faculty", STUDENT: "/student" };

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return children;
}
