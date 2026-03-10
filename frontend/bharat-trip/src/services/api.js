const API_URL = "http://localhost:5000/api/plan";

export async function generatePlan(data) {
  const res = await fetch("http://localhost:5000/api/plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  // backend returns { plan: {...} } — unwrap it so Results.jsx gets the plan directly
  return json.plan ?? json;
}