import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <div className="brand">🎓 Student Attendance Management System</div>
      <div className="nav-right">
        <span>{user?.name} <span className="badge">{user?.role}</span></span>
        <button className="btn btn-light" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
