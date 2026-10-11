import { useState } from "react";
import { useAuth } from "../AuthContext";
import { errMsg } from "../api";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
    if (!password) return setError("Password is required");
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (ex) {
      setError(errMsg(ex));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit} noValidate>
        <h1>🎓 Attendance System</h1>
        <p className="muted">Sign in as Student, Faculty or Administrator</p>
        {error && <div className="alert error">{error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.com" />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <button className="btn btn-primary full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <div className="demo">
          <b>Demo logins</b>
          <div>Admin: admin@college.com / admin123</div>
          <div>Faculty: faculty@college.com / faculty123</div>
          <div>Student: student@college.com / student123</div>
        </div>
      </form>
    </div>
  );
}
