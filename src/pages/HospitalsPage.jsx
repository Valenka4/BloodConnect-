import { motion } from "framer-motion";
import { Hospital, MapPin, Phone } from "lucide-react";

const hospitals = [
  {
    name: "City General Hospital",
    city: "Mumbai",
    phone: "+91 22 4400 1122"
  },
  {
    name: "Red Cross Medical Centre",
    city: "Delhi",
    phone: "+91 11 4500 9834"
  },
  {
    name: "LifeCare Blood Bank",
    city: "Bengaluru",
    phone: "+91 80 4012 7600"
  }
];

export default function HospitalsPage() {
  return (
    <section className="page-shell container">
      <div className="section-heading compact">
        <p className="eyebrow">Hospitals</p>
        <h1>Partner locations and blood banks.</h1>
      </div>
      <motion.div
        animate={{ opacity: 1 }}
        className="card-grid three-up"
        initial={{ opacity: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {hospitals.map((hospital, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            key={hospital.name}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mb-4 text-primary">
              <Hospital size={32} />
            </div>
            <h3 className="mb-2">{hospital.name}</h3>
            <div className="donor-info-row mb-1">
              <MapPin className="opacity-60" size={18} />
              <span className="text-muted">{hospital.city}</span>
            </div>
            <div className="donor-info-row">
              <Phone className="opacity-60" size={18} />
              <span className="text-muted">{hospital.phone}</span>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
