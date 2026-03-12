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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollToSection = (id) => {
    setOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: t("nav_home"),         id: "home"         },
    { label: "How It Works", id: "how-it-works" },
    { label: t("nav_planner"),      id: "why-choose"   },
    { label: "About",        id: "footer"       },
  ];

  const menuItems = [
    { icon: "👤", label: t("nav_profile"), sub: "View your account",   path: "/profile"  },
    { icon: "🗺️", label: "My Trips",   sub: "Your saved itineraries", path: "/planner" },
    { icon: "⚙️", label: t("nav_settings"),   sub: "Preferences & privacy", path: "/settings" },
  ];

  return (
    <nav className={`nb-nav ${scrolled ? "nb-scrolled" : ""}`}>

      {/* ── LOGO ── */}
      <div className="nb-logo" onClick={() => navigate("/")}>
        <span className="nb-logo-flag">🇮🇳</span>
        <span className="nb-logo-text">
          <span className="nb-logo-in">IN</span> Bharat Trip
        </span>
      </div>

      {/* ── NAV LINKS ── */}
      <ul className="nb-links">
        {navLinks.map(link => (
          <li
            key={link.id}
            className={`nb-link-item ${location.hash === `#${link.id}` ? "nb-active" : ""}`}
            onClick={() => scrollToSection(link.id)}
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

            {/* Avatar button */}
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

            {/* Dropdown */}
            {open && (
              <div className="nb-dropdown">

                {/* User info header */}
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

                {/* Menu items */}
                <div className="nb-dd-menu">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      className="nb-dd-item"
                      onClick={() => { setOpen(false); navigate(item.path); }}
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

                {/* Logout */}
                <button className="nb-dd-logout" onClick={handleLogout}>
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>

              </div>
            )}

          </div>

        ) : (

          <div className="nb-auth-btns">
            <button
              className="nb-btn-ghost"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="nb-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          </div>

        )}

      </div>

    </nav>
  );
}

export default Navbar;