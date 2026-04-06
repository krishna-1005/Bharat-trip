import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import "../styles/navbar.css";

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { t, theme, toggleTheme } = useSettings();
  const [open, setOpen]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const dropdownRef = useRef(null);

  const username = user?.name || user?.email || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const ADMIN_EMAILS = ["bharattrip@gmail.com", "krishkulkarni1005@gmail.com"];
  const isHomePage = location.pathname === "/";
  const isAdmin = user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email?.toLowerCase());

  const homeLinks = [
    { label: "Features",     id: "features"     },
    { label: "How it Works", id: "how-it-works" },
    { label: "Destinations", id: "destinations" },
  ];

  const defaultLinks = [
    { label: "Home",    id: "home",    path: "/"            },
    { label: "Explore", id: "explore", path: "/explore"     },
    { label: "Poll",    id: "poll",    path: "/create-poll" },
    { label: "Planner", id: "planner", path: "/trip-type"   },
  ];

  const navLinks = isHomePage ? homeLinks : defaultLinks;

  const handleNavClick = (link) => {
    if (isHomePage && link.id !== "home" && link.id !== "admin") {
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link.path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`nb-nav ${scrolled ? "nb-scrolled" : ""} ${mobileMenuOpen ? "nb-mobile-active" : ""}`}>
      <div className="nb-logo" onClick={() => { navigate("/"); setMobileMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
        <span className="nb-logo-flag">🇮🇳</span>
        <span className="nb-logo-text">Bharat Trip</span>
      </div>

      <ul className="nb-links">
        {navLinks.map(link => (
          <li
            key={link.id}
            className={`nb-link-item ${!isHomePage && location.pathname === link.path ? "nb-active" : ""}`}
            onClick={() => handleNavClick(link)}
          >
            {link.label}
          </li>
        ))}
      </ul>

      <div className="nb-right">
        <button className="nb-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          <motion.div 
            className="nb-toggle-thumb"
            animate={{ x: theme === 'dark' ? 0 : 26 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </motion.div>
        </button>

        {user ? (
          <div className="nb-profile-wrap" ref={dropdownRef}>
            <button className="nb-avatar" onClick={() => setOpen(!open)}>
              <span className="nb-avatar-letter">{username.charAt(0).toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="nb-dropdown"
                >
                  <div className="nb-dd-header">
                    <div className="nb-dd-avatar-lg">{username.charAt(0).toUpperCase()}</div>
                    <div className="nb-dd-user-info">
                      <span className="nb-dd-name">{username}</span>
                      <span className="nb-dd-tag">{user.email}</span>
                    </div>
                  </div>
                  <div className="nb-dd-menu">
                    <button className="nb-dd-item" onClick={() => { navigate("/profile"); setOpen(false); }}>👤 Profile</button>
                    <button className="nb-dd-item" onClick={() => { navigate("/trips"); setOpen(false); }}>🗺️ My Trips</button>
                    <button className="nb-dd-item" onClick={() => { navigate("/settings"); setOpen(false); }}>⚙️ Settings</button>
                    {isAdmin && (
                      <button className="nb-dd-item" onClick={() => { navigate("/admin"); setOpen(false); }}>🛡️ Admin Panel</button>
                    )}
                    <div className="nb-dd-divider"></div>
                    <button className="nb-dd-logout" onClick={handleLogout}>Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="nb-auth-btns desktop-only">
            <button className="nb-btn-primary" onClick={() => navigate("/login")}>Login</button>
          </div>
        )}

        <button 
          className={`nb-hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="nb-mobile-menu"
          >
            <ul className="nb-mobile-links">
              {navLinks.map(link => (
                <li key={link.id} className="nb-mobile-item" onClick={() => handleNavClick(link)}>
                  {link.label}
                </li>
              ))}
              {!user ? (
                <li className="nb-mobile-item nb-mobile-login" onClick={() => navigate("/login")}>Login</li>
              ) : (
                <>
                  <li className="nb-mobile-divider"></li>
                  <li className="nb-mobile-item" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>👤 Profile</li>
                  <li className="nb-mobile-item" onClick={() => { navigate("/trips"); setMobileMenuOpen(false); }}>🗺️ My Trips</li>
                  <li className="nb-mobile-item" onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}>⚙️ Settings</li>
                  {isAdmin && (
                    <li className="nb-mobile-item" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}>🛡️ Admin Panel</li>
                  )}
                  <li className="nb-mobile-item nb-mobile-logout" onClick={handleLogout}>Logout</li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
