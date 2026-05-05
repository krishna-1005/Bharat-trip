const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/budget — fetch all expenses + settlement summary
router.get("/", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenses = trip.expenses || [];
    
    // Calculate simple summary
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Settlement summary (re-using settle logic for summary)
    const settlements = calculateSettlements(expenses);

    res.json({
      expenses,
      totalSpent,
      settlements
    });
  } catch (error) {
    console.error("Fetch Budget Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/budget/expense — add new expense
router.post("/expense", protect, async (req, res) => {
  try {
    const { title, amount, currency, paidBy, splitBetween, category } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newExpense = {
      id: Math.random().toString(36).substr(2, 9), // Simple unique ID
      title,
      amount,
      currency: currency || "INR",
      paidBy,
      splitBetween,
      category,
      createdAt: new Date()
    };

    trip.expenses.push(newExpense);
    await trip.save();

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:added", newExpense);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: calculateSettlements(trip.expenses)
      });
    }

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/trips/:tripId/budget/expense/:id — remove expense
router.delete("/expense/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenseIndex = trip.expenses.findIndex(exp => exp.id === req.params.id);
    if (expenseIndex === -1) return res.status(404).json({ error: "Expense not found" });

    const deletedExpenseId = req.params.id;
    trip.expenses.splice(expenseIndex, 1);
    await trip.save();

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:deleted", deletedExpenseId);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: calculateSettlements(trip.expenses)
      });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/trips/:tripId/budget/settle — calculate who owes whom
router.get("/settle", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const settlements = calculateSettlements(trip.expenses);
    res.json(settlements);
  } catch (error) {
    console.error("Settle Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Greedy Settlement Algorithm
function calculateSettlements(expenses) {
  const netBalances = {};

  expenses.forEach(exp => {
    const payerId = exp.paidBy.userId;
    const payerName = exp.paidBy.name;

    // Add what they paid
    netBalances[payerId] = netBalances[payerId] || { balance: 0, name: payerName };
    netBalances[payerId].balance += exp.amount;

    // Subtract what they owe (their share)
    exp.splitBetween.forEach(split => {
      netBalances[split.userId] = netBalances[split.userId] || { balance: 0, name: split.name };
      netBalances[split.userId].balance -= split.share;
    });
  });

  const creditors = [];
  const debtors = [];

  Object.keys(netBalances).forEach(userId => {
    const { balance, name } = netBalances[userId];
    if (balance > 0.01) {
      creditors.push({ userId, name, balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, name, balance: Math.abs(balance) });
    }
  });

  // Sort to optimize greedy approach
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].balance, debtors[j].balance);
    
    transactions.push({
      from: debtors[j].name,
      to: creditors[i].name,
      amount: parseFloat(amount.toFixed(2))
    });

    creditors[i].balance -= amount;
    debtors[j].balance -= amount;

    if (creditors[i].balance < 0.01) i++;
    if (debtors[j].balance < 0.01) j++;
  }

  return transactions;
}

module.exports = router;
