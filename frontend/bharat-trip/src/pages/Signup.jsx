import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Signup() {
  const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
  
  const navigate        = useNavigate();
  const loc             = useLocation();
  const { login }       = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const redirectPath = loc.state?.from || "/";
  const redirectState = loc.state?.plan ? { plan: loc.state.plan } : null;

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        setError(data.error || "Signup failed. Try again.");
        return;
      }

      login({ ...data.user, token: data.token });
      navigate(redirectPath, { state: redirectState });
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join GoTripo and start exploring</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="auth-form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;