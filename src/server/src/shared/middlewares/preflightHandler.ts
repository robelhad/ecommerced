import { Request, Response, NextFunction } from "express";
const allowedOrigin = "https://ecommerce-sepia-iota-43.vercel.app";
export const preflightHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    // Set CORS headers for preflight
    //res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    if (req.headers.origin === allowedOrigin) {
      res.header("Access-Control-Allow-Origin", allowedOrigin);
    }
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-API-Key",
        "X-Client-Version",
        "X-Device-Type",
        "X-Platform",
        "X-API-Version",
        "Apollo-Require-Preflight", // For GraphQL
      ].join(", ")
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    res.header("Vary", "Origin");
    // End preflight request
    res.status(200).end();
    return;
  }

  next();
};
