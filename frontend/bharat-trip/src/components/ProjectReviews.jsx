import React, { useState, useEffect } from "react";
import { fetchReviews, postReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/projectReviews.css";

const StarRating = ({ rating, interactive = false, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hover || rating) ? "active" : ""}`}
          onClick={() => interactive && onRatingChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default function ProjectReviews() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const newReview = await postReview({ rating, comment });
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
      alert("Thank you for your feedback!");
    } catch (err) {
      console.error("Failed to post review:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="project-reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2>Explorer Feedback</h2>
          <p>What fellow travelers are saying about GoTripo</p>
        </div>

        <div className="reviews-list">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev._id} className="review-card">
                <div className="review-user">{rev.userName}</div>
                <div className="review-stars">
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </div>

                <div className="review-comment">"{rev.comment}"</div>
                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No reviews yet. Be the first!</p>
          )}
        </div>

        <div className="review-form-container">
          <h3>Share Your Experience</h3>
          {user ? (
            <form className="review-form" onSubmit={handleSubmit}>
              <StarRating rating={rating} interactive={true} onRatingChange={setRating} />
              <textarea
                placeholder="Write your feedback here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button
                type="submit"
                className="submit-review-btn"
                disabled={submitting}
              >
                {submitting ? "Posting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="login-to-review">
              <p>Please <Link to="/login" className="login-link">login</Link> to share your feedback.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
