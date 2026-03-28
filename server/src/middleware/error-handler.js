export function notFoundHandler(req, res) {
    res.status(404).json({
      ok: false,
      error: "Route not found",
    });
  }
  
  export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
  
    console.error("API error:", {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      message: err.message,
    });
  
    res.status(statusCode).json({
      ok: false,
      error: err.message || "Internal server error",
    });
  }