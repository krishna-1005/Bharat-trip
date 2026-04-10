import { Link } from "react-router-dom";
import { useEffect } from "react";
import "../styles/footer.css";

export default function Footer() {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, observerOptions);

    const el = document.querySelector(".premium-footer");
    if (el) observer.observe(el);
    
    return () => observer.disconnect();
  }, []);

  return (
    <footer id="footer" className="premium-footer">
      <div className="footer-glow"></div>
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="GoTripo" className="footer-brand-logo" />
          </div>
          <p>Crafting memories across the Indian subcontinent with cutting-edge AI. Your personal travel assistant, redefined.</p>
          <div className="footer-socials">
            <a href="#" className="social-icon">𝕏</a>
            <a href="#" className="social-icon">📸</a>
            <a href="#" className="social-icon">💼</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-col">
            <h4>Explore</h4>
            <Link to="/destinations">Destinations</Link>
            <Link to="/sample-plan">Sample Plans</Link>
            <Link to="/weekend">Weekend Trips</Link>
            <Link to="/cultural">Cultural Tours</Link>
          </div>
          <div className="link-col">
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Inspired</h4>
          <p>Get the latest Bengaluru hidden gems delivered to your inbox.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <span>© 2024 GoTripo AI • Designed for the modern explorer</span>
        </div>
        <div className="footer-status">
          <span className="status-dot excellent"></span>
          System Online
        </div>
      </div>
    </footer>
  );
}
