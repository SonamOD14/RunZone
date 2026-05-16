// Global error handler - catches any error thrown in routes/controllers
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    // Only show full error details in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;