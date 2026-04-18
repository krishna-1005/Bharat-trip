const { sendWelcomeEmail: sendEmail } = require("./emailService");

/**
 * Supplier Orchestrator
 * Identifies impacted bookings and drafts automated communications to suppliers.
 */
async function prepareNotifications(trip) {
  try {
    if (!trip.pendingRevision) return;

    console.log(`📡 Orchestrator: Preparing notifications for Trip ${trip._id}`);

    const currentItinerary = trip.itinerary;
    const pendingItinerary = trip.pendingRevision.itinerary;
    const notifications = [];

    // 1. Logic to diff itineraries and find impacted bookings
    // For MVP: We look for significant time shifts or activity removals
    pendingItinerary.forEach((pDay, dIdx) => {
      const cDay = currentItinerary[dIdx];
      if (!cDay) return;

      pDay.places.forEach((pPlace, pIdx) => {
        // Find if this place was in the original day and shifted
        const cPlace = cDay.places.find(p => p.name === pPlace.name);
        
        if (cPlace && pPlace.bestTime !== cPlace.bestTime) {
          // Significant shift detected
          notifications.push({
            supplierName: pPlace.name,
            supplierType: pPlace.category === "Food" ? "restaurant" : "hotel", // Default mapping
            actionType: "reschedule",
            messageDraft: `
              Subject: Reschedule Notice for ${trip.title}
              Hi ${pPlace.name}, 
              Due to a travel disruption, the group for ${trip.title} will now be arriving at ${pPlace.bestTime} instead of ${cPlace.bestTime}. 
              Please hold our reservation. 
              Best, GoTripo AI.
            `
          });
        }
      });
    });

    // 2. Save the drafts to the Trip document
    trip.queuedSupplierNotifications = notifications.map(n => ({
      ...n,
      status: "pending"
    }));

    await trip.save();
    console.log(`✅ Orchestrator: ${notifications.length} notification drafts queued for review.`);

  } catch (error) {
    console.error("❌ Orchestrator Error:", error.message);
  }
}

/**
 * Executes all pending notifications for a trip.
 * Called when the trip leader clicks "Execute" in the UI.
 */
async function executeNotifications(trip) {
  try {
    console.log(`🚀 Orchestrator: Executing notifications for Trip ${trip._id}`);

    for (const notification of trip.queuedSupplierNotifications) {
      if (notification.status === "pending") {
        // In a real system, we'd call a supplier API or send an actual email.
        // For MVP, we'll log it and mark it as 'sent'.
        console.log(`✉️ Sending notification to ${notification.supplierName}...`);
        
        notification.status = "sent";
        notification.sentAt = new Date();
      }
    }

    await trip.save();
    console.log("✅ Orchestrator: All notifications dispatched.");

  } catch (error) {
    console.error("❌ Notification Execution Error:", error.message);
  }
}

module.exports = { prepareNotifications, executeNotifications };
