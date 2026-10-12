
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

    const cleanEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(cleanEmail, password);
    } catch (ex) {
      setError(errMsg(ex));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form
        className="login-card"
        onSubmit={submit}
        noValidate
      >
        <h1>🎓 Attendance System</h1>

        <p className="muted">
          Sign in as Student, Faculty or Administrator
        </p>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="you@college.com"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="btn btn-primary full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

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
