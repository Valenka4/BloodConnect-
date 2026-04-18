import { motion } from "framer-motion";
import { Locate, Phone, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function SearchPage() {
  const [filters, setFilters] = useState({ bloodGroup: "", city: "" });
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("Search for available donors near you.");

  async function handleSubmit(event) {
    event.preventDefault();
    setSearching(true);
    setMessage("");

    try {
      const params = new URLSearchParams();
      if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
      if (filters.city) params.set("city", filters.city);
      const query = params.toString();
      const data = await api(`/api/donors${query ? `?${query}` : ""}`);
      setResults(data.donors);
      if (!data.donors.length) {
        setMessage("No donors matched this search yet.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="page-shell container">
      <div className="section-heading compact">
        <p className="eyebrow">Donor search</p>
        <h1>Search the live donor directory.</h1>
      </div>

      <form className="filter-card" onSubmit={handleSubmit}>
        <label>
          Blood group
          <select
            value={filters.bloodGroup}
            onChange={(event) =>
              setFilters({ ...filters, bloodGroup: event.target.value })
            }
          >
            <option value="">Any group</option>
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
            placeholder="Search city..."
            type="text"
            value={filters.city}
            onChange={(event) => setFilters({ ...filters, city: event.target.value })}
          />
        </label>
        <button className="button button-primary" disabled={searching} type="submit">
          {searching ? (
            "Searching..."
          ) : (
            <>
              <SearchIcon size={18} /> Search donors
            </>
          )}
        </button>
      </form>

      {message ? <p className="inline-message">{message}</p> : null}

      <motion.div
        animate={{ opacity: 1 }}
        className="card-grid three-up"
        initial={{ opacity: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {results.map((donor) => (
          <motion.article
            animate={{ opacity: 1, scale: 1 }}
            className="donor-card"
            initial={{ opacity: 0, scale: 0.95 }}
            key={donor.id}
          >
            <div className="donor-card-head">
              <span className="badge">{donor.bloodGroup}</span>
              <span className={donor.isAvailable ? "status on" : "status off"}>
                {donor.isAvailable ? "Available" : "Busy"}
              </span>
            </div>
            <h3>{donor.fullName}</h3>
            <div className="donor-info-row">
              <Locate size={16} />
              <span>{donor.city}</span>
            </div>
            <div className="donor-info-row">
              <Phone size={16} />
              <span>{donor.phone}</span>
            </div>
            <a className="button button-secondary mt-2" href={`tel:${donor.phone}`}>
              <Phone size={16} /> Call donor
            </a>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

