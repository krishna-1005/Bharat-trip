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

export const generatePlan = async (data: any) => {
  const res = await api.post("/plan/generate", data);
  return res.data.plan ?? res.data;
};

export const askAI = async (message: string, history: any[]) => {
  const res = await api.post("/chat", { message, history });
  return res.data;
};

export const fetchTrips = async () => {
  const res = await api.get("/trips");
  return res.data;
};

export const fetchReviews = async () => {
  const res = await api.get("/reviews");
  return res.data;
};

export const fetchVibeSuggestions = async (vibe: { adventure: number, modern: number, social: number }) => {
  const res = await api.get("/plan/vibe-suggestions", { params: vibe });
  return res.data.suggestions;
};

export const fetchDreamWeaverSuggestions = async (prompt: string) => {
  const res = await api.post("/plan/dream-weaver", { prompt });
  return res.data.suggestions;
};

export default api;
