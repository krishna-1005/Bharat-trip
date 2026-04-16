import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import LanguageSwitcher from "./LanguageSwitcher";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const username = user?.displayName || user?.email || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const isHomePage = location.pathname === "/";
  const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];
  const isAdmin = user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email?.toLowerCase());

  const navLinks = [
    { label: "Explore", id: "destinations", path: "/explore" },
    { label: "Trips", id: "how-it-works", path: "/trips" },
    { label: "Saved", id: "features", path: "/trips" },
    { label: "Profile", id: "profile", path: "/profile" },
  ];

  const handleNavClick = (link) => {
    setMobileMenuOpen(false);
    if (isHomePage && link.id !== "home") {
      const element = document.getElementById(link.id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        window.scrollTo({
          top: elementRect - bodyRect - offset,
          behavior: "smooth"
        });
        return;
      }
    }
    navigate(link.path);
  };

  return (
    <nav className={`nb-nav-base ${scrolled ? "nb-nav-scrolled" : "nb-nav-initial"}`}>
      <div className="nb-container-base">
        
        {/* LEFT: LOGO */}
        <div className="nb-logo-wrap" onClick={() => navigate("/")}>
          <span className="nb-logo-flag">🇮🇳</span>
          <span className="nb-logo-text">Go<span>Tripo</span></span>
        </div>

        {/* CENTER: NAV LINKS (DESKTOP) */}
        <div className="nb-links-pill">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="nb-link-btn"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="nb-right-stack">
          <div className="desktop-only">
            <LanguageSwitcher />
          </div>

          <button className="nb-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="nb-avatar-btn"
              >
                {username.charAt(0).toUpperCase()}
              </button>
              
              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="nb-profile-dropdown"
                  >
                    <div className="nb-dd-user-box">
                      <div className="nb-dd-avatar-sm">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div className="nb-dd-info">
                        <span className="nb-dd-name">{username}</span>
                        <span className="nb-dd-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="nb-dd-menu">
                      <button onClick={() => { navigate("/profile"); setProfileOpen(false); }} className="nb-dd-item">
                        👤 Profile
                      </button>
                      <button onClick={() => { navigate("/settings"); setProfileOpen(false); }} className="nb-dd-item">
                        ⚙️ Settings
                      </button>
                      {isAdmin && (
                        <button onClick={() => { navigate("/admin"); setProfileOpen(false); }} className="nb-dd-item">
                          🛡️ Admin Panel
                        </button>
                      )}
                      <button onClick={handleLogout} className="nb-dd-item nb-dd-logout">
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="nb-login-btn"
            >
              Login
            </button>
          )}

        </div>
      </div>
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {!isHomePage && mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="nb-mobile-drawer"
          >
            <p className="nb-mobile-nav-title">Navigation</p>
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleNavClick(link)}
                className="nb-mobile-link"
              >
                {link.label}
                <span>→</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
