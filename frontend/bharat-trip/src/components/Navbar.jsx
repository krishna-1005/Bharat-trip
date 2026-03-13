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
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const username = user?.name || user?.email || "";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

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

  const scrollToSection = (id) => {
    setOpen(false);
    setMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: t("nav_home"),         id: "home",         path: "/"         },
    { label: "How It Works",        id: "how-it-works", path: "/#how-it-works" },
    { label: "AI Planner",          id: "planner",      path: "/planner"   },
    { label: t("nav_about"),        id: "footer",       path: "/about"     },
  ];

  // ONLY SHOW ADMIN TO YOU
  if (user?.email === "krishkulkarni2005@gmail.com") {
    navLinks.push({ label: "🛡️ Admin", id: "admin", path: "/admin" });
  }

  const menuItems = [
    { icon: "👤", label: t("nav_profile"), sub: "View your account",   path: "/profile"  },
    { icon: "🗺️", label: t("nav_trips"),   sub: "Your saved itineraries", path: "/trips" },
    { icon: "⚙️", label: t("nav_settings"),   sub: "Preferences & privacy", path: "/settings" },
  ];

  return (
    <nav className={`nb-nav ${scrolled ? "nb-scrolled" : ""} ${mobileMenuOpen ? "nb-mobile-active" : ""}`}>
      {/* ── LOGO ── */}
      <div className="nb-logo" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
        <span className="nb-logo-flag">🇮🇳</span>
        <span className="nb-logo-text">
          <span className="nb-logo-in">IN</span> Bharat Trip
        </span>
      </div>

      {/* ── SEARCH BAR (Home Page Only) ── */}
      {(location.pathname === "/" || location.pathname === "") && (
        <div className="nb-search-container">
          <form className="nb-search-form" onSubmit={handleSearch}>
            <div className="nb-search-field">
              <span className="nb-search-icon-left">🔍</span>
              <input 
                type="text" 
                placeholder="Search places..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nb-search-input"
              />
              <button type="submit" className="nb-search-submit">Search</button>
            </div>
          </form>
        </div>
      )}

      {/* ── DESKTOP NAV LINKS ── */}
      <ul className="nb-links">
        {navLinks.map(link => (
          <li
            key={link.id}
            className={`nb-link-item ${location.pathname === link.path ? "nb-active" : ""}`}
            onClick={() => {
              if (link.path.startsWith("/#")) {
                scrollToSection(link.id);
              } else {
                navigate(link.path);
                setMobileMenuOpen(false);
              }
            }}
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
              <li key={link.id} className="nb-mobile-item" onClick={() => scrollToSection(link.id)}>
                {link.label}
              </li>
            ))}
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