import { motion } from "framer-motion";
import { AlertCircle, Hospital, MapPin, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const initialForm = {
  patientName: "",
  bloodGroup: "",
  city: "",
  hospital: "",
  contactNumber: "",
  notes: ""
};

export default function EmergencyPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadRequests() {
    try {
      const data = await api("/api/emergency-requests");
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      setError("Login is required before posting an emergency request.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api("/api/emergency-requests", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm(initialForm);
      await loadRequests();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell container split-layout">
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Post emergency request</h2>
          <label>
            Patient name
            <input
              required
              type="text"
              value={form.patientName}
              onChange={(event) => setForm({ ...form, patientName: event.target.value })}
            />
          </label>
          <label>
            Blood group needed
            <select
              required
              value={form.bloodGroup}
              onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}
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
              required
              type="text"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>
          <label>
            Hospital
            <input
              required
              type="text"
              value={form.hospital}
              onChange={(event) => setForm({ ...form, hospital: event.target.value })}
            />
          </label>
          <label>
            Contact number
            <input
              required
              type="tel"
              value={form.contactNumber}
              onChange={(event) =>
                setForm({ ...form, contactNumber: event.target.value })
              }
            />
          </label>
          <label>
            Notes
            <textarea
              placeholder="Ward details, urgency, or special instructions"
              rows="4"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
          {error ? (
            <p className="form-error">
              <AlertCircle className="inline mr-2" size={16} />
              {error}
            </p>
          ) : null}
          <button className="button button-primary" disabled={saving} type="submit">
            {saving ? (
              "Submitting..."
            ) : (
              <>
                <Plus size={18} /> Submit request
              </>
            )}
          </button>
        </form>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="request-column"
        initial={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="section-heading compact">
          <p className="eyebrow">Active requests</p>
          <h1>Urgent needs from the community.</h1>
        </div>
        <motion.div className="stack-list" layout>
          {requests.map((request) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="info-card emergency-card"
              initial={{ opacity: 0, y: 10 }}
              key={request.id}
              layout
            >
              <div className="donor-card-head">
                <h3>{request.patientName}</h3>
                <span className="badge">{request.bloodGroup}</span>
              </div>
              <div className="donor-info-row mt-2">
                <Hospital size={16} />
                <span>{request.hospital}</span>
              </div>
              <div className="donor-info-row">
                <MapPin size={16} />
                <span>{request.city}</span>
              </div>
              <div className="donor-info-row">
                <Phone size={16} />
                <span>{request.contactNumber}</span>
              </div>
              {request.notes ? <p className="mt-2 text-muted">{request.notes}</p> : null}
              <div className="mt-3 text-xs opacity-60">Posted by {request.postedBy}</div>
            </motion.article>
          ))}
          {requests.length === 0 && (
            <p className="text-muted">No active emergency requests found.</p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
