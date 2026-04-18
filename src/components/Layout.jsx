import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Find Blood" },
  { to: "/emergency", label: "Emergency" },
  { to: "/hospitals", label: "Hospitals" },
  { to: "/tips", label: "Tips" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-row">
          <Link className="brand" to="/">
            <span className="brand-mark">B</span>
            <span>BloodConnect</span>
          </Link>

          <nav className="nav-links">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                  to="/dashboard"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                  to="/profile"
                >
                  Profile
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              type="button"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <>
                <div className="user-pill">
                  <span className="user-dot" />
                  <span>{user.fullName}</span>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="button button-secondary" to="/login">
                  Login
                </Link>
                <Link className="button button-primary" to="/register">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="eyebrow">Community response network</p>
            <h3>Built to shorten the distance between urgency and action.</h3>
          </div>
          <div>
            <p className="footer-label">Useful paths</p>
            <div className="footer-links">
              <Link to="/search">Search donors</Link>
              <Link to="/emergency">Emergency requests</Link>
              <Link to="/register">Become a donor</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

