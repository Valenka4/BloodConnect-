import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const initialForm = {
  fullName: "",
  age: "",
  bloodGroup: "",
  city: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  isAvailable: true
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        fullName: form.fullName,
        age: Number(form.age),
        bloodGroup: form.bloodGroup,
        city: form.city,
        phone: form.phone,
        email: form.email,
        password: form.password,
        isAvailable: form.isAvailable
      };
      await register(payload);
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
        <p className="eyebrow">Donor onboarding</p>
        <h1>Join the network that answers faster.</h1>
        <p>
          Register once and your profile becomes searchable in the Neon-backed donor
          database.
        </p>
      </div>

      <form className="form-card large" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <div className="form-grid">
          <label>
            Full name
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              required
            />
          </label>
          <label>
            Age
            <input
              type="number"
              min="18"
              max="65"
              value={form.age}
              onChange={(event) => setForm({ ...form, age: event.target.value })}
              required
            />
          </label>
          <label>
            Blood group
            <select
              value={form.bloodGroup}
              onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}
              required
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label>
            City
            <input
              type="text"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              required
            />
          </label>
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
          <label>
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({ ...form, confirmPassword: event.target.value })
              }
              required
            />
          </label>
        </div>
        <label className="checkbox-row">
          <input
            checked={form.isAvailable}
            onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
            type="checkbox"
          />
          I am currently available to donate.
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="form-helper">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}
