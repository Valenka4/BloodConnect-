import { motion } from "framer-motion";
import { Activity, Heart, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Search className="text-primary" size={28} />,
    title: "Fast donor discovery",
    text: "Search live donor records by blood group and city instead of relying on scattered contact lists."
  },
  {
    icon: <Activity className="text-primary" size={28} />,
    title: "Emergency broadcast",
    text: "Publish urgent requests so nearby donors can spot critical needs quickly."
  },
  {
    icon: <ShieldCheck className="text-primary" size={28} />,
    title: "Verified profiles",
    text: "Keep donor details in one secure database with login, profile management, and updates."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="hero-copy"
            initial={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow">
              <Heart className="inline-block mr-2" fill="currentColor" size={16} /> Live
              donor network
            </p>
            <h1>Find the right blood donor before time runs out.</h1>
            <p className="hero-text">
              BloodConnect connects life-savers with those in urgent need. Powered by a
              real-time database for instant search and global reach.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/register">
                Become a donor
              </Link>
              <Link className="button button-secondary" to="/search">
                Find blood
              </Link>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="hero-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="pulse-ring" />
            <div className="hero-card">
              <p className="hero-card-label">Emergency readiness</p>
              <div className="metric-row">
                <div>
                  <strong>24/7</strong>
                  <span>active visibility</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>blood groups</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>free network</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-shell container">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Designed for speed, clarity, and action.</h2>
        </div>
        <motion.div
          className="card-grid three-up"
          initial="hidden"
          variants={containerVariants}
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.article
              className="info-card"
              key={feature.title}
              variants={itemVariants}
            >
              <div className="mb-4">{feature.icon}</div>
              <span className="card-kicker">Feature 0{index + 1}</span>
              <h3 className="mt-2">{feature.title}</h3>
              <p>{feature.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </>
  );
}

