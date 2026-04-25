import axios from "axios";
import { auth } from "@/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function generatePlan(data: any) {
  const res = await api.post("/plan/generate", data);
  return res.data.plan ?? res.data;
}

export async function fetchTrips() {
  const res = await api.get("/trips");
  return res.data;
}

export async function fetchReviews() {
  const res = await api.get("/reviews");
  return res.data;
}

export default api;
