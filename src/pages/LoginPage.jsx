import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell container auth-wrap">
      <div className="auth-panel">
        <p className="eyebrow">Account access</p>
        <h1>Welcome back to BloodConnect.</h1>
        <p>Log in to manage your donor profile and publish emergency needs.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="form-helper">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
