const app = require("./app");

const PORT = process.env.PORT || 5000;

// Bind to 0.0.0.0 to ensure the service is reachable on Render/Cloud environments
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Bharat Trip backend running on port ${PORT}`);
});