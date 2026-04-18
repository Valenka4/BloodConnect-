import { motion } from "framer-motion";
import { Droplet, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

const groups = [
  { key: "stock_a_plus", label: "A+" },
  { key: "stock_a_minus", label: "A-" },
  { key: "stock_b_plus", label: "B+" },
  { key: "stock_b_minus", label: "B-" },
  { key: "stock_o_plus", label: "O+" },
  { key: "stock_o_minus", label: "O-" },
  { key: "stock_ab_plus", label: "AB+" },
  { key: "stock_ab_minus", label: "AB-" }
];

export default function BloodBankDashboard() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/api/bloodbank/stock")
      .then((data) => setStock(data.stock))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api("/api/bloodbank/stock", {
        method: "PUT",
        body: JSON.stringify(stock)
      });
      setMessage("Stock updated successfully!");
    } catch (err) {
      setMessage("Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading stock data...</div>;

  return (
    <div className="dashboard-content">
      <div className="section-heading compact">
        <p className="eyebrow">Inventory Management</p>
        <h1>Blood Inventory Stock</h1>
        <p>Update your current blood unit levels to help hospitals and donors find you.</p>
      </div>

      <form onSubmit={handleUpdate} className="form-card large">
        <div className="stock-grid">
          {groups.map((g) => (
            <div key={g.key} className="stock-item">
              <label className="flex items-center gap-2">
                <Droplet size={18} className="text-primary" />
                {g.label} Units
              </label>
              <input
                type="number"
                min="0"
                value={stock[g.key] || 0}
                onChange={(e) => setStock({ ...stock, [g.key]: parseInt(e.target.value) || 0 })}
                className="w-full mt-1"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button className="button button-primary" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? "Saving..." : "Update Inventory"}
          </button>
          {message && <p className={message.includes("success") ? "text-success" : "text-error"}>{message}</p>}
        </div>
      </form>
    </div>
  );
}
