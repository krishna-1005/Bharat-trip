const express = require("express");
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/expenses
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId })
      .populate("paidBy", "name photo")
      .populate("splitAmong", "name photo")
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/expenses
router.post("/", protect, async (req, res) => {
  try {
    const { name, amount, category, paidBy, splitAmong } = req.body;
    const expense = await Expense.create({
      tripId: req.params.tripId,
      name,
      amount,
      category,
      paidBy,
      splitAmong
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name photo")
      .populate("splitAmong", "name photo");
      
    req.app.get("io").to(req.params.tripId).emit("expense:updated", populatedExpense);

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/trips/:tripId/expenses/:expenseId
router.delete("/:expenseId", protect, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ 
      _id: req.params.expenseId, 
      tripId: req.params.tripId 
    });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/trips/:tripId/expenses/summary
router.get("/summary", protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const expenses = await Expense.find({ tripId });
    const trip = await Trip.findById(tripId);
    
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const memberIds = trip.members.map(m => m.userId.toString());
    const perPersonShare = memberIds.length > 0 ? totalSpent / memberIds.length : 0;

    // Simplified balance calculation
    // net[userId] = amountPaid - amountOwed
    const net = {};
    memberIds.forEach(id => net[id] = 0);

    expenses.forEach(exp => {
      const paidBy = exp.paidBy.toString();
      net[paidBy] = (net[paidBy] || 0) + exp.amount;
      
      const splitWeight = exp.splitAmong.length > 0 ? exp.splitAmong.length : memberIds.length;
      const share = exp.amount / splitWeight;
      
      const debtors = exp.splitAmong.length > 0 ? exp.splitAmong : memberIds;
      debtors.forEach(id => {
        const dId = id.toString();
        net[dId] = (net[dId] || 0) - share;
      });
    });

    const balances = [];
    const creditors = Object.keys(net).filter(id => net[id] > 0).sort((a, b) => net[b] - net[a]);
    const debtors = Object.keys(net).filter(id => net[id] < 0).sort((a, b) => net[a] - net[b]);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditId = creditors[i];
      const debtId = debtors[j];
      const amount = Math.min(net[creditId], -net[debtId]);
      
      if (amount > 0.01) {
        balances.push({
          fromUserId: debtId,
          toUserId: creditId,
          amount: parseFloat(amount.toFixed(2))
        });
      }

      net[creditId] -= amount;
      net[debtId] += amount;

      if (net[creditId] < 0.01) i++;
      if (-net[debtId] < 0.01) j++;
    }

    res.json({
      totalSpent,
      perPersonShare: parseFloat(perPersonShare.toFixed(2)),
      balances
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
