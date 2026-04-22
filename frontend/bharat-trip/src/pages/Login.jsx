import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./auth.css";

function Login() {
  const navigate      = useNavigate();
  const loc           = useLocation();
  const { login }     = useContext(AuthContext);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const redirectPath = loc.state?.from || "/";
  const redirectState = loc.state?.plan ? { plan: loc.state.plan } : null;

  /* ── GOOGLE LOGIN ── */
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const u        = result.user;

      login({
        id:    u.uid,
        name:  u.displayName,
        email: u.email,
        photo: u.photoURL,
        token: await u.getIdToken(),
      });

      navigate(redirectPath, { state: redirectState });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /* ── EMAIL / PASSWORD LOGIN ── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Check your credentials.");
        return;
      }

      login({ ...data.user, token: data.token });
      navigate(redirectPath, { state: redirectState });

    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your journey</p>
        </div>

        {/* ── GOOGLE BUTTON ── */}
        <button className="auth-google-btn" onClick={handleGoogleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="18"
          />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        {/* ── EMAIL / PASSWORD ── */}
        <form onSubmit={handleEmailLogin}>
          <div className="auth-form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </div>

      </div>
    </div>
  );
}

export default Login;