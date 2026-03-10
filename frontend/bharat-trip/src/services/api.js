const API_URL = `${import.meta.env.VITE_API_URL}/api/plan`;

export async function generatePlan(data) {
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  // backend returns { plan: {...} }
  return json.plan ?? json;
}