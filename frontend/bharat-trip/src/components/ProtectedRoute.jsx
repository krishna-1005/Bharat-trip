import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {

  const { user, loading } = useContext(AuthContext) || {};

  if (loading) {
    return (
      <div className="global-loader-container">
        <div className="spinner-v2"></div>
        <div className="loader-text">Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;