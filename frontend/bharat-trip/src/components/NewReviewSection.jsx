import React, { useState, useEffect } from "react";
import { fetchReviews, postReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/reviewSection.css";

export default function NewReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
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

  return (
    <section className="bt-review-section-wrapper">
      <div className="bt-review-container">
        <h2 className="bt-review-title">Project Feedback</h2>
        
        {/* REVIEWS DISPLAY - ABOVE INPUT */}
        <div className="bt-reviews-display-area">
          {isLoading ? (
            <p style={{textAlign: 'center', gridColumn: '1/-1'}}>Fetching feedback...</p>
          ) : reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="bt-review-item-card">
                <div className="bt-review-user-info">
                  <span>{r.userName}</span>
                  <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="bt-review-stars-display">
                  {"â˜…".repeat(r.rating)}{"â˜†".repeat(5 - r.rating)}
                </div>
                <p className="bt-review-text-content">"{r.comment}"</p>
              </div>
            ))
          ) : (
            <p style={{textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8'}}>
              Be the first to share your experience!
            </p>
          )}
        </div>

        {/* REVIEW INPUT FORM */}
        <div className="bt-review-form-box">
          <h3 className="bt-review-form-title">Give Us Your Feedback</h3>
          
          {user ? (
            <form onSubmit={handleReviewSubmit}>
              <div className="bt-star-input-group">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`bt-star-clickable ${s <= (hoverRating || rating) ? "active" : ""}`}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    â˜…
                  </button>
                ))}
              </div>
              
              <textarea
                className="bt-review-textarea"
                placeholder="What do you think about GoTripo?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              
              <button 
                type="submit" 
                className="bt-submit-btn" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit My Review"}
              </button>
            </form>
          ) : (
            <div className="bt-login-prompt">
              <p>Sign in to post a review. <Link to="/login" className="bt-login-link">Login Here</Link></p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
