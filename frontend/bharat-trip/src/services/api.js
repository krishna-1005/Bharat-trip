import { auth } from "../firebase";

const BASE_API_URL = `${import.meta.env.VITE_API_URL}/api`;
const PLAN_API_URL = `${BASE_API_URL}/plan`;

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

  const res = await fetch(`${PLAN_API_URL}/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      city: data.city,
      days: data.days,
      budget: data.budget,
      interests: data.interests,
      travelerType: data.travelerType,
      pace: data.pace
    })
  });

  const json = await res.json();

  // backend returns { plan: {...} }
    return json.plan ?? json;
  }

  export async function fetchReviews() {
    const res = await fetch(`${BASE_API_URL}/reviews`);
    return await res.json();
  }

  export async function postReview(reviewData) {
    const headers = { "Content-Type": "application/json" };
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      throw new Error("You must be logged in to post a review.");
    }

    const res = await fetch(`${BASE_API_URL}/reviews`, {
      method: "POST",
      headers,
      body: JSON.stringify(reviewData)
    });

    return await res.json();
  }