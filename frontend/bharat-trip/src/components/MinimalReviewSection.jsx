import React, { useState, useEffect } from "react";
import { fetchReviews, postReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function MinimalReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReviewsData();
  }, []);

  const loadReviewsData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      setIsSubmitting(true);
      const result = await postReview({ 
        rating, 
        comment, 
        name: user.displayName || user.email || "Explorer" 
      });
      setReviews(prev => [result, ...prev]);
      setComment("");
      setRating(5);
      alert("Feedback received! Thank you.");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error posting review. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle = {
    padding: "100px 8%",
    backgroundColor: "transparent",
    color: "var(--text-main)",
    position: "relative",
    zIndex: 10
  };

  const titleStyle = {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "60px",
    letterSpacing: "-2px"
  };

  const reviewsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "60px",
    maxHeight: "500px",
    overflowY: "auto",
    padding: "10px"
  };

  const cardStyle = {
    background: "var(--bg-card)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--border-main)",
    borderRadius: "24px",
    padding: "32px",
    transition: "all 0.4s ease"
  };

  const formBoxStyle = {
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(20px)",
    padding: "60px 40px",
    borderRadius: "40px",
    maxWidth: "900px",
    margin: "0 auto",
    border: "1px solid var(--border-main)",
    textAlign: "center"
  };

  const starButtonStyle = (active) => ({
    background: "none",
    border: "none",
    fontSize: "2.5rem",
    cursor: "pointer",
    color: active ? "var(--accent-amber)" : "rgba(255,255,255,0.1)",
    transition: "all 0.2s ease",
    transform: active ? "scale(1.1)" : "scale(1)"
  });

  const textareaStyle = {
    width: "100%",
    padding: "24px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid var(--border-main)",
    borderRadius: "20px",
    color: "white",
    minHeight: "160px",
    fontSize: "18px",
    margin: "32px 0",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s"
  };

  const buttonStyle = {
    padding: "18px 48px",
    background: "var(--accent-blue)",
    border: "none",
    borderRadius: "18px",
    color: "white",
    fontWeight: "800",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)"
  };

  return (
    <section style={sectionStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={titleStyle}>Voices of <span className="gradient-text">Explorers</span></h2>
        
        <div style={reviewsGridStyle} className="custom-scrollbar">
          {isLoading ? (
            <p style={{textAlign: "center", gridColumn: "1/-1"}}>Synchronizing data...</p>
          ) : reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} style={cardStyle}>
                <div style={{fontWeight: "700", color: "var(--accent-blue)", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{fontSize: "18px"}}>{r.userName}</span>
                  <span style={{fontSize: "12px", color: "var(--text-dim)", fontWeight: "500"}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{color: "var(--accent-amber)", marginBottom: "16px", letterSpacing: "2px"}}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <p style={{color: "var(--text-dim)", lineHeight: "1.7", fontStyle: "italic", fontSize: "15px"}}>"{r.comment}"</p>
              </div>
            ))
          ) : (
            <p style={{textAlign: "center", gridColumn: "1/-1", color: "var(--text-dim)"}}>The guestbook is currently empty. Be the first to sign.</p>
          )}
        </div>

        <div style={formBoxStyle}>
          <h3 style={{marginBottom: "16px", fontSize: "2rem", fontWeight: "800", fontFamily: "'Syne', sans-serif"}}>Share Your Journey</h3>
          <p style={{color: "var(--text-dim)", marginBottom: "40px"}}>How did GoTripo AI transform your exploration?</p>
          
          {user ? (
            <form onSubmit={handleReviewSubmit}>
              <div style={{display: "flex", justifyContent: "center", gap: "12px", marginBottom: "8px"}}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    style={starButtonStyle(s <= rating)}
                    onClick={() => setRating(s)}
                    onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
                    onMouseOut={(e) => e.target.style.transform = s <= rating ? "scale(1.1)" : "scale(1)"}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <textarea
                style={textareaStyle}
                placeholder="Describe your experience with our AI planner..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                onFocus={(e) => e.target.style.borderColor = "var(--accent-blue)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-main)"}
              />
              
              <button 
                type="submit" 
                style={buttonStyle} 
                disabled={isSubmitting}
                onMouseOver={(e) => e.target.style.transform = "translateY(-3px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                {isSubmitting ? "Transmission in Progress..." : "Submit Feedback"}
              </button>
            </form>
          ) : (
            <div style={{textAlign: "center", padding: "20px"}}>
              <p style={{color: "var(--text-dim)", fontSize: "1.1rem"}}>
                Please <Link to="/login" style={{color: "var(--accent-blue)", fontWeight: "700", textDecoration: "none", borderBottom: "1px solid var(--accent-blue)"}}>authenticate</Link> to provide feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
