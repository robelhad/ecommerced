import express from "express";
import dotenv from "dotenv";

import "./infra/cloudinary/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import logger from "./infra/winston/logger";

import compression from "compression";
import passport from "passport";

import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./infra/cache/redis";

import configurePassport from "./infra/passport/passport";

import { cookieParserOptions } from "./shared/constants";
import globalError from "./shared/errors/globalError";
import { logRequest } from "./shared/middlewares/logRequest";

import { configureRoutes } from "./routes";

import { configureGraphQL } from "./graphql";
import webhookRoutes from "./modules/webhook/webhook.routes";
import healthRoutes from "./routes/health.routes";
// import { preflightHandler } from "./shared/middlewares/preflightHandler";
import { Server as HTTPServer } from "http";

import { SocketManager } from "@/infra/socket/socket";
import { connectDB } from "./infra/database/database.config";
import { setupSwagger } from "./docs/swagger";

import path from "path";
import fs from "fs";


/*
import authRoutes from "./routes/auth.routes"; 
app.use(passport.initialize()); 
app.use(passport.session()); 
app.use(authRoutes);
*/
dotenv.config();



export const createApp = async () => {
  

  const app = express();

  app.get("/debug-static", (req, res) => {
  res.send(fs.readdirSync(path.join(process.cwd(), "../assets/seed-images/products")));
});


  app.use(
  "/images",
  express.static(
    path.join(process.cwd(), "../assets/seed-images/products")
  )
);
  app.use(
  "/catimages",
  express.static(
    path.join(process.cwd(), "../assets/seed-images/categories")
  )
);


  /*
  await connectDB().catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });
  */
  try {
    await connectDB();
    console.log("✅ Database connected");
  } catch (err: any) {
    console.warn("⚠️ Database not available:", err.message);

    if (process.env.NODE_ENV === "production") {
      throw err; // crash in production only
    }
  }

  const httpServer = new HTTPServer(app);

  // Initialize Socket.IO
  const socketManager = new SocketManager(httpServer);

  const io = socketManager.getIO();
  
  // Swagger Documentation
  setupSwagger(app);

  // Health check routes (no middleware applied)
  app.use("/", healthRoutes);

  // Basic
  app.use(
    "/api/v1/webhook",
    bodyParser.raw({ type: "application/json" }),
    webhookRoutes
  );
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET, cookieParserOptions));

  app.set("trust proxy", 1);
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: true, // Keeps guest sessionId from the first request
      proxy: true, // Ensures secure cookies work with proxy
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in prod
        sameSite: "none", // Required for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  configurePassport();

  // Preflight handler removed to avoid conflicts

  // CORS must be applied BEFORE GraphQL setup
  const allowedOrigins =[
        process.env.CLIENT_URL_PROD,
        process.env.CLIENT_URL_DEV,
        "http://192.168.161.140:3000",
        "http://192.168.161.140:5173",
        "http://localhost:5173",
      ].filter((origin): origin is string => typeof origin === "string"); // removes undefined

  app.use(
    cors({
      
      origin: allowedOrigins, /*function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },      //
      
        process.env.NODE_ENV === "production"
          ? ["https://ecommerce-nu-rosy.vercel.app", '${CLIENT_URL}']
          : ["http://localhost:3000", '${process.env.CLIENT_URL_DEV}', "http://192.168.161.140:3000" , "http://192.168.161.140:5173",   "http://localhost:5173"],
          */
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Apollo-Require-Preflight", // For GraphQL
      ],
    })
  );

  app.use(helmet());
  app.use(helmet.frameguard({ action: "deny" }));

  // Extra Security
  app.use(ExpressMongoSanitize());
  app.use(
    hpp({
      whitelist: ["sort", "filter", "fields", "page", "limit"],
    })
  );

  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
  app.use(compression());
  app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});
  //app.use("/images", express.static("/home/robel/cecommerce/assets/seed-images/products"));

  app.use("/api", configureRoutes(io));

  // GraphQL setup
  //await configureGraphQL(app);
  try {
    await configureGraphQL(app);
    console.log("✅ GraphQL configured");
  } catch (err: any) {
    console.warn("⚠️ GraphQL setup failed:", err.message);

    if (process.env.NODE_ENV === "production") {
      throw err;
    }
  }
  // Error & Logging
  app.use(globalError);
  app.use(logRequest);

  return { app, httpServer };
};
