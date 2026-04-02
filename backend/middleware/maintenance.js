const SystemConfig = require("../models/SystemConfig");

const maintenanceMode = async (req, res, next) => {
  try {
    // 1. Skip check for admin routes (to allow disabling maintenance mode)
    // 2. Skip check for public config (to allow the frontend to know about maintenance)
    // 3. Skip check for health check and ping routes
    const skippedPaths = [
      "/api/admin",
      "/api/auth", // Optionally allow login so admins can authenticate
      "/api/public/config", // Assuming this will be used for public config
      "/api/admin/config/public", // The existing public config route
      "/ping",
      "/"
    ];

    const isSkipped = skippedPaths.some(path => req.path.startsWith(path));

    if (isSkipped) {
      return next();
    }

    // Check database for maintenance_mode flag
    const config = await SystemConfig.findOne({ key: "maintenance_mode" });
    
    if (config && config.value === true) {
      // Return 503 Service Unavailable
      return res.status(503).json({
        maintenance: true,
        message: "Site is currently under maintenance. Please try again later."
      });
    }

    next();
  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next(); // Continue if there's an error checking maintenance (fail-open)
  }
};

module.exports = maintenanceMode;
