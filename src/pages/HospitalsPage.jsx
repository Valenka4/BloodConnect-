import { motion } from "framer-motion";
import { Hospital, MapPin, Phone, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function HospitalsPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const query = filter ? `?role=${filter}` : "";
    api(`/api/partners${query}`)
      .then((data) => setPartners(data.partners))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <section className="page-shell container">
      <div className="section-heading compact">
        <p className="eyebrow">Medical Network</p>
        <h1>Verified partners and blood banks.</h1>
        <p>Connect with registered institutions for blood procurement and emergency support.</p>
      </div>

      <div className="filter-card mb-8">
        <label>
          Filter by Type
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Partners</option>
            <option value="bloodbank">Blood Banks</option>
            <option value="hospital">Hospitals</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="loading-state">Syncing with network...</div>
      ) : (
        <motion.div
          animate={{ opacity: 1 }}
          className="card-grid three-up"
          initial={{ opacity: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {partners.map((partner, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              key={partner.id}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mb-4 text-primary">
                {partner.user_role === 'hospital' ? <Hospital size={32} /> : <Building2 size={32} />}
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="m-0">{partner.full_name}</h3>
                <span className="badge">{partner.user_role === 'bloodbank' ? 'Blood Bank' : 'Hospital'}</span>
              </div>
              <div className="donor-info-row mb-1">
                <MapPin className="opacity-60" size={18} />
                <span className="text-muted">{partner.city}</span>
              </div>
              <div className="donor-info-row">
                <Phone className="opacity-60" size={18} />
                <span className="text-muted">{partner.phone}</span>
              </div>
            </motion.article>
          ))}
          {partners.length === 0 && <p className="col-span-full text-center py-10 opacity-50">No partners found in this category.</p>}
        </motion.div>
      )}
    </section>
  );
}
