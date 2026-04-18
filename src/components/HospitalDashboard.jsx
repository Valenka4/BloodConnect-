import { motion } from "framer-motion";
import { Activity, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function HospitalDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/api/dashboard").then(setStats).catch(console.error);
  }, []);

  return (
    <div className="dashboard-content">
      <div className="section-heading compact">
        <p className="eyebrow">Hospital Services</p>
        <h1>Medical Center Dashboard</h1>
        <p>Coordinate emergency blood requirements and manage hospital requests.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Active Patient Requests</span>
          <strong>{stats?.openEmergencies ?? "--"}</strong>
        </div>
        <div className="stat-card">
          <span>Total Network Donors</span>
          <strong>{stats?.totalDonors ?? "--"}</strong>
        </div>
      </div>

      <div className="card-grid mt-8">
        <Link to="/emergency" className="info-card action-card">
          <div className="mb-4 text-primary">
            <Plus size={32} />
          </div>
          <h3>New Emergency Request</h3>
          <p>Instantly alert the donor network about an urgent blood requirement.</p>
        </Link>

        <Link to="/search" className="info-card action-card">
          <div className="mb-4 text-primary">
            <Search size={32} />
          </div>
          <h3>Search Donors</h3>
          <p>Find specific blood groups and contact donors directly in your city.</p>
        </Link>

        <Link to="/hospitals" className="info-card action-card">
          <div className="mb-4 text-primary">
            <Activity size={32} />
          </div>
          <h3>Blood Bank Directory</h3>
          <p>Find and contact specialized blood banks for inventory procurement.</p>
        </Link>
      </div>
    </div>
  );
}
