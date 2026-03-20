import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
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

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close on outside click */
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

  const ADMIN_EMAILS = ["bharattrip0@gmail.com", "krishnapramodkulkarni23aiml@rnsit.ac.in"];

  const defaultLinks = [
    { label: "Home",    id: "home",    path: "/"            },
    { label: "Poll",    id: "poll",    path: "/create-poll" },
    { label: "Planner", id: "planner", path: "/planner"     },
    { label: "Map",     id: "map",     path: "/map"         },
  ];

  const homeLinks = [
    { label: "Why Us",       id: "why-us"       },
    { label: "Features",     id: "features"     },
    { label: "How it Works", id: "how-it-works" },
    { label: "Destinations", id: "destinations" },
  ];

  const isHomePage = location.pathname === "/";
  const navLinks = isHomePage ? homeLinks : defaultLinks;

  const handleNavClick = (link) => {
    if (isHomePage && link.id !== "home") {
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link.path);
    }
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { icon: "👤", label: t("nav_profile"), sub: "View your account",   path: "/profile"  },
    { icon: "🗺️", label: t("nav_trips"),   sub: "Your saved itineraries", path: "/trips" },
    { icon: "⚙️", label: t("nav_settings"),   sub: "Preferences & privacy", path: "/settings" },
  ];

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  if (isAdmin) {
    menuItems.unshift({ icon: "🛡️", label: "Admin", sub: "Control Panel", path: "/admin" });
  }

  return (
    <nav className={`nb-nav ${scrolled ? "nb-scrolled" : ""} ${mobileMenuOpen ? "nb-mobile-active" : ""}`}>
      {/* ── LOGO ── */}
      <div className="nb-logo" onClick={() => { navigate("/"); setMobileMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
        <span className="nb-logo-flag">🇮🇳</span>
        <span className="nb-logo-text">
          Bharat Trip
        </span>
      </div>

      {/* ── DESKTOP NAV LINKS ── */}
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

      {/* ── RIGHT SIDE ── */}
      <div className="nb-right">
        <button 
          className="nb-theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="nb-profile-wrap" ref={dropdownRef}>
            <button
              className={`nb-avatar ${open ? "nb-avatar-open" : ""}`}
              onClick={() => setOpen(!open)}
              aria-label="Profile menu"
            >
              <span className="nb-avatar-letter">
                {username.charAt(0).toUpperCase()}
              </span>
              <span className="nb-avatar-chevron">
                {open ? "▴" : "▾"}
              </span>
            </button>

            {open && (
              <div className="nb-dropdown">
                <div className="nb-dd-header">
                  <div className="nb-dd-avatar-lg">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="nb-dd-user-info">
                    <span className="nb-dd-name">{username}</span>
                    <span className="nb-dd-tag">✦ Explorer</span>
                  </div>
                </div>
                <div className="nb-dd-divider" />
                <div className="nb-dd-menu">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      className="nb-dd-item"
                      onClick={() => { setOpen(false); setMobileMenuOpen(false); navigate(item.path); }}
                    >
                      <span className="nb-dd-item-icon">{item.icon}</span>
                      <span className="nb-dd-item-text">
                        <span className="nb-dd-item-label">{item.label}</span>
                        <span className="nb-dd-item-sub">{item.sub}</span>
                      </span>
                      <span className="nb-dd-item-arrow">›</span>
                    </button>
                  ))}
                </div>
                <div className="nb-dd-divider" />
                <button className="nb-dd-logout" onClick={handleLogout}>
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nb-auth-btns">
            <button className="nb-btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="nb-btn-primary" onClick={() => navigate("/signup")}>Get Started</button>
          </div>
        )}

        {/* Hamburger */}
        <button 
          className={`nb-hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="nb-mobile-menu">
          <ul className="nb-mobile-links">
            {navLinks.map(link => (
              <li key={link.id} className="nb-mobile-item" onClick={() => handleNavClick(link)}>
                {link.label}
              </li>
            ))}
            {isAdmin && (
              <li className="nb-mobile-item" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}>
                🛡️ Admin Panel
              </li>
            )}
            {!user && (
              <>
                <li className="nb-mobile-item" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>Login</li>
                <li className="nb-mobile-item" onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}>Get Started</li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;