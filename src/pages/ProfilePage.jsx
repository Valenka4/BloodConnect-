import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bloodGroup: user?.bloodGroup || "",
    city: user?.city || "",
    phone: user?.phone || "",
    age: user?.age || "",
    isAvailable: user?.isAvailable || false
  });
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const data = await api("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        age: Number(form.age)
      })
    });
    setMessage(data.message);
    await refreshProfile();
  }

  return (
    <section className="page-shell container split-layout profile-layout">
      <div className="profile-summary">
        <p className="eyebrow">Profile</p>
        <h1>{user?.fullName}</h1>
        <p>Your donor record lives in Neon and is used by live donor search.</p>
        <div className="stats-grid single-column">
          <article className="stat-card">
            <span>Blood group</span>
            <strong>{user?.bloodGroup}</strong>
          </article>
          <article className="stat-card">
            <span>City</span>
            <strong>{user?.city}</strong>
          </article>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Edit profile</h2>
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
        </div>
        <label className="checkbox-row">
          <input
            checked={form.isAvailable}
            onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
            type="checkbox"
          />
          Mark me available for donation searches.
        </label>
        {message ? <p className="inline-message">{message}</p> : null}
        <button className="button button-primary" type="submit">
          Save changes
        </button>
      </form>
    </section>
  );
}
