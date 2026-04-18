const { GoogleGenerativeAI } = require("@google/generative-ai");
const Trip = require("../models/Trip");
const supplierOrchestrator = require("./supplierOrchestrator");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Agentic Rebooking Engine
 * Autonomously calculates the ripple effect of disruptions and prepares salvaged itineraries.
 */
async function processDisruption(trip, eventType, details = {}) {
  try {
    console.log(`🤖 Rebooking Engine started for Trip: ${trip._id} (${eventType})`);

    const delayMinutes = details.delayMinutes || 0;
    const disruptionContext = `Disruption Type: ${eventType}. Delay: ${delayMinutes} minutes. ${details.notes || ""}`;

    // 1. Prepare the Prompt for Gemini
    const prompt = `
You are an expert travel logistics AI. A disruption has occurred for an active trip.
Your goal is to perform a "Ripple-Effect Calculation" and salvage the itinerary.

### DISRUPTION CONTEXT:
${disruptionContext}

### CURRENT ITINERARY:
${JSON.stringify(trip.itinerary)}

### INSTRUCTIONS:
1. RECALCULATE: Adjust the start and end times for all subsequent activities on the current and following days.
2. OPTIMIZE: If the delay is significant (> 3 hours), you may remove low-priority activities or replace them with shorter alternatives nearby to keep the trip on track.
3. LOGISTICS: Ensure transit times between places remain realistic given the new schedule.
4. SUMMARY: Provide a concise "Impact Summary" explaining what changed and why (e.g., "Shifted Day 1 evening activities by 2 hours; dropped the museum visit to ensure dinner reservation is kept").
5. Return ONLY valid JSON mirroring the structure of the provided itinerary but in a "pendingRevision" wrapper.

Return valid JSON in this exact structure:
{
  "impactSummary": "Concise explanation of changes",
  "recalculationReason": "${eventType}",
  "itinerary": {
    "1": [ { "name": "...", "bestTime": "...", "reason": "...", ... } ],
    "2": [...]
  }
}
`;

    // 2. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    let salvagedData;
    try {
      salvagedData = JSON.parse(text);
    } catch (pe) {
      console.error("❌ AI returned invalid JSON for rebooking:", text);
      return;
    }

    // 3. Transform the flat JSON structure into our Schema-compatible structure
    const updatedItinerary = [];
    Object.entries(salvagedData.itinerary).forEach(([dayKey, places]) => {
      updatedItinerary.push({
        day: `Day ${dayKey}`,
        places: places.map(p => ({
          ...p,
          estimatedHours: p.timeHours || 2, // Map AI field if different
          estimatedCost: p.avgCost || 0
        }))
      });
    });

    // 4. Update the Trip with the Pending Revision
    trip.pendingRevision = {
      itinerary: updatedItinerary,
      impactSummary: salvagedData.impactSummary,
      recalculationReason: salvagedData.recalculationReason || eventType,
      createdAt: new Date()
    };

    await trip.save();

    console.log(`✅ Ripple-effect calculation complete for Trip ${trip._id}. Pending revision created.`);

    // 5. Trigger Phase 2 (Supplier Orchestration)
    await supplierOrchestrator.prepareNotifications(trip); 

  } catch (error) {
    console.error("❌ Rebooking Engine Execution Error:", error.message);
  }
}

module.exports = { processDisruption };
