import { motion } from "framer-motion";
import { Activity, Edit, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BloodBankDashboard from "../components/BloodBankDashboard";
import HospitalDashboard from "../components/HospitalDashboard";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/api/dashboard").then((data) => setStats(data)).catch(console.error);
  }, []);

  if (user?.userRole === "bloodbank") {
    return (
      <section className="page-shell container">
        <BloodBankDashboard />
      </section>
    );
  }

  if (user?.userRole === "hospital") {
    return (
      <section className="page-shell container">
        <HospitalDashboard />
      </section>
    );
  }

  return (
    <section className="page-shell container">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="section-heading compact"
        initial={{ opacity: 0, y: -20 }}
      >
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, {user?.fullName?.split(" ")[0]}.</h1>
      </motion.div>

      <div className="stats-grid">
        <motion.article 
          animate={{ opacity: 1, scale: 1 }}
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.1 }}
        >
          <span>Total donors</span>
          <strong>{stats?.totalDonors ?? "--"}</strong>
        </motion.article>
        <motion.article 
          animate={{ opacity: 1, scale: 1 }}
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.2 }}
        >
          <span>Available now</span>
          <strong>{stats?.availableDonors ?? "--"}</strong>
        </motion.article>
        <motion.article 
          animate={{ opacity: 1, scale: 1 }}
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.3 }}
        >
          <span>Open requests</span>
          <strong>{stats?.openEmergencies ?? "--"}</strong>
        </motion.article>
      </div>

      <div className="card-grid three-up mt-5">
        <Link className="info-card action-card" to="/search">
          <div className="mb-4 text-primary">
            <Search size={28} />
          </div>
          <h3>Find blood</h3>
          <p>Search real donor records by group and city.</p>
        </Link>
        <Link className="info-card action-card" to="/emergency">
          <div className="mb-4 text-primary">
            <Activity size={28} />
          </div>
          <h3>Post emergency</h3>
          <p>Create a request that appears instantly to the community.</p>
        </Link>
        <Link className="info-card action-card" to="/profile">
          <div className="mb-4 text-primary">
            <Edit size={28} />
          </div>
          <h3>Update profile</h3>
          <p>Change city, contact details, and donor availability.</p>
        </Link>
      </div>
    </section>
  );
}
