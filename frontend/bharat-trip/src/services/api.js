import { auth } from "../firebase";

const API_URL = `${import.meta.env.VITE_API_URL}/api/plan`;

export async function generatePlan(data) {
  const headers = { "Content-Type": "application/json" };
  
  // Try to get the user token if logged in
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Could not get auth token for logging", e);
  }

  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });

  const json = await res.json();

  // backend returns { plan: {...} }
  return json.plan ?? json;
}