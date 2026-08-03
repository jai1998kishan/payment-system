export const errorHandler = (err, req, res, next) => {
  console.error("========== ERROR ==========");
  console.error(err);
  console.error("===========================");

  const statusCode = err.statusCode || 500;

  const message = err.isOperational ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
