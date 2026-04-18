import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const initialForm = {
  fullName: "",
  userRole: "donor",
  age: "",
  bloodGroup: "",
  city: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  isAvailable: true,
  licenseNumber: "",
  registrationNumber: "",
  isGovernment: false
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
        userRole: form.userRole,
        city: form.city,
        phone: form.phone,
        email: form.email,
        password: form.password,
      };

      if (form.userRole === "donor") {
        payload.age = Number(form.age);
        payload.bloodGroup = form.bloodGroup;
        payload.isAvailable = form.isAvailable;
      } else if (form.userRole === "bloodbank") {
        payload.licenseNumber = form.licenseNumber;
      } else if (form.userRole === "hospital") {
        payload.registrationNumber = form.registrationNumber;
        payload.isGovernment = form.isGovernment;
      }

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
        <p className="eyebrow">Join BloodConnect</p>
        <h1>A network for everyone.</h1>
        <p>
          Register as a donor, blood bank, or hospital to help strengthen the community.
        </p>
      </div>

      <form className="form-card large" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        
        <div className="role-selector mb-6">
          <label className="block mb-2 font-semibold">I am a...</label>
          <div className="flex gap-4">
            {["donor", "bloodbank", "hospital"].map((role) => (
              <label key={role} className={`role-option ${form.userRole === role ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userRole"
                  value={role}
                  checked={form.userRole === role}
                  onChange={(e) => setForm({ ...form, userRole: e.target.value })}
                  className="hidden"
                />
                <span className="capitalize">{role.replace('bank', ' bank')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <label>
            {form.userRole === 'donor' ? 'Full name' : 'Organization name'}
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              required
            />
          </label>
          
          {form.userRole === "donor" && (
            <>
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
            </>
          )}

          {form.userRole === "bloodbank" && (
            <label>
              License Number
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })}
                required
              />
            </label>
          )}

          {form.userRole === "hospital" && (
            <label>
              Registration Number
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })}
                required
              />
            </label>
          )}

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

        {form.userRole === "donor" && (
          <label className="checkbox-row">
            <input
              checked={form.isAvailable}
              onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
              type="checkbox"
            />
            I am currently available to donate.
          </label>
        )}

        {form.userRole === "hospital" && (
          <label className="checkbox-row">
            <input
              checked={form.isGovernment}
              onChange={(event) => setForm({ ...form, isGovernment: event.target.checked })}
              type="checkbox"
            />
            This is a government-funded hospital.
          </label>
        )}

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

