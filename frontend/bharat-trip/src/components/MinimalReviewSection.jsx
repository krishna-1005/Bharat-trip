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
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      setIsSubmitting(true);
      const result = await postReview({ rating, comment });
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
    padding: "80px 10%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    zIndex: 10
  };

  const titleStyle = {
    fontSize: "3rem",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "50px",
    color: "#fff"
  };

  const reviewsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
    maxHeight: "500px",
    overflowY: "auto",
    padding: "10px"
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "30px",
    transition: "transform 0.3s ease"
  };

  const formBoxStyle = {
    background: "rgba(30, 41, 59, 0.5)",
    padding: "40px",
    borderRadius: "32px",
    maxWidth: "800px",
    margin: "0 auto",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  };

  const starButtonStyle = (active) => ({
    background: "none",
    border: "none",
    fontSize: "2.5rem",
    cursor: "pointer",
    color: active ? "#fbbf24" : "#334155",
    transition: "color 0.2s"
  });

  const textareaStyle = {
    width: "100%",
    padding: "20px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    color: "white",
    minHeight: "150px",
    fontSize: "1.1rem",
    margin: "20px 0",
    outline: "none"
  };

  const buttonStyle = {
    width: "100%",
    padding: "18px",
    background: "linear-gradient(90deg, #ff9933, #138808)",
    border: "none",
    borderRadius: "16px",
    color: "white",
    fontWeight: "700",
    fontSize: "1.2rem",
    cursor: "pointer"
  };

  return (
    <section style={sectionStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={titleStyle}>Traveler <span style={{color: "#ff9933"}}>Feedback</span></h2>
        
        <div style={reviewsGridStyle} className="custom-scrollbar">
          {isLoading ? (
            <p style={{textAlign: "center", gridColumn: "1/-1"}}>Loading feedback...</p>
          ) : reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} style={cardStyle}>
                <div style={{fontWeight: "700", color: "#ff9933", marginBottom: "10px", display: "flex", justifyContent: "space-between"}}>
                  <span>{r.userName}</span>
                  <span style={{fontSize: "0.8rem", color: "#94a3b8"}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{color: "#fbbf24", marginBottom: "15px"}}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <p style={{color: "#cbd5e1", lineHeight: "1.6", fontStyle: "italic"}}>"{r.comment}"</p>
              </div>
            ))
          ) : (
            <p style={{textAlign: "center", gridColumn: "1/-1", color: "#94a3b8"}}>No feedback yet. Be the first!</p>
          )}
        </div>

        <div style={formBoxStyle}>
          <h3 style={{textAlign: "center", marginBottom: "30px", fontSize: "1.8rem"}}>Share Your Experience</h3>
          
          {user ? (
            <form onSubmit={handleReviewSubmit}>
              <div style={{display: "flex", justifyContent: "center", gap: "15px", marginBottom: "30px"}}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    style={starButtonStyle(s <= rating)}
                    onClick={() => setRating(s)}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <textarea
                style={textareaStyle}
                placeholder="How was your Bharat Trip experience?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              
              <button 
                type="submit" 
                style={buttonStyle} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div style={{textAlign: "center", padding: "20px"}}>
              <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>Please <Link to="/login" style={{color: "#ff9933", fontWeight: "bold", textDecoration: "none"}}>login</Link> to share your feedback.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
