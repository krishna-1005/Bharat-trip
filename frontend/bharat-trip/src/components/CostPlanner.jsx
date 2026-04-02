import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CostPlanner = ({ destination }) => {
  const [travelCost, setTravelCost] = useState(0);
  const [stayCost, setStayCost] = useState(0);
  const [foodCost, setFoodCost] = useState(0);
  const [numPeople, setNumPeople] = useState(1);

  // Derived states
  const totalTripCost = travelCost + stayCost + foodCost;
  const costPerPerson = numPeople > 0 ? totalTripCost / numPeople : 0;
  
  const travelPerPerson = numPeople > 0 ? travelCost / numPeople : 0;
  const stayPerPerson = numPeople > 0 ? stayCost / numPeople : 0;
  const foodPerPerson = numPeople > 0 ? foodCost / numPeople : 0;

  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setter(0);
    } else {
      setter(value);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveTrip = () => {
    if (totalTripCost === 0) {
      alert("Please enter costs before saving!");
      return;
    }

    const newTrip = {
      destination: destination || "Custom Trip",
      totalCost: totalTripCost,
      costPerPerson: costPerPerson,
      numPeople: numPeople,
      date: new Date().toISOString(),
    };

    const existingTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
    localStorage.setItem("savedTrips", JSON.stringify([...existingTrips, newTrip]));
    
    alert("Trip finalized and saved to your profile! ✨");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="cost-planner-card"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "32px",
        marginTop: "40px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px" }}>
          Trip Cost Planner <span style={{ color: "var(--dash-primary)" }}>{destination ? `for ${destination}` : ""}</span>
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Estimate your expenses and see the breakdown per person.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
        {/* Input Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Travel Cost (₹)</label>
            <input 
              type="number" 
              className="auth-input-styled" 
              placeholder="e.g. 5000"
              value={travelCost || ""} 
              onChange={handleInputChange(setTravelCost)}
              min="0"
            />
          </div>
          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Stay Cost (₹)</label>
            <input 
              type="number" 
              className="auth-input-styled" 
              placeholder="e.g. 8000"
              value={stayCost || ""} 
              onChange={handleInputChange(setStayCost)}
              min="0"
            />
          </div>
          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Food Cost (₹)</label>
            <input 
              type="number" 
              className="auth-input-styled" 
              placeholder="e.g. 3000"
              value={foodCost || ""} 
              onChange={handleInputChange(setFoodCost)}
              min="0"
            />
          </div>
          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Number of People</label>
            <input 
              type="number" 
              className="auth-input-styled" 
              placeholder="1"
              value={numPeople || ""} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setNumPeople(isNaN(val) || val < 1 ? 1 : val);
              }}
              min="1"
            />
          </div>
        </div>

        {/* Results Section */}
        <div style={{ 
          background: "rgba(59, 130, 246, 0.05)", 
          borderRadius: "20px", 
          padding: "24px",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "0.9rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Cost Per Person</span>
            <h3 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#60a5fa" }}>
              {formatCurrency(costPerPerson)}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "#94a3b8" }}>Total Trip Cost</span>
              <span style={{ fontWeight: "700" }}>{formatCurrency(totalTripCost)}</span>
            </div>
            <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.05)" }}></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#94a3b8" }}>Travel / person</span>
              <span>{formatCurrency(travelPerPerson)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#94a3b8" }}>Stay / person</span>
              <span>{formatCurrency(stayPerPerson)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#94a3b8" }}>Food / person</span>
              <span>{formatCurrency(foodPerPerson)}</span>
            </div>
          </div>

          <button 
            className="btn-premium primary" 
            style={{ marginTop: '24px', width: '100%' }}
            onClick={handleSaveTrip}
          >
            Finalize & Save Trip 💾
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CostPlanner;
