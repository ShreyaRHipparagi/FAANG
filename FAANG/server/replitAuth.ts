import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Helper to check if we're in Replit environment
const isReplitEnv = () => !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnv()) throw new Error("Not in Replit environment");
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // Use provided secret or a random fallback for production if not set (not recommended but prevents crash)
  const secret = process.env.SESSION_SECRET || "default_dev_secret_should_be_changed";

  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // If NOT in Replit environment (e.g. Render), setup Mock Auth
  if (!isReplitEnv()) {
    console.log("Not in Replit environment. Setting up Mock Authentication for demo.");

    // Create a demo user if it doesn't exist
    const demoUserClaims = {
      sub: "demo-user-123",
      email: "demo@example.com",
      first_name: "Demo",
      last_name: "User",
      profile_image_url: "https://github.com/shadcn.png"
    };

    // Ensure demo user exists in DB
    try {
      await upsertUser(demoUserClaims);
      console.log("Demo user ensured in database");
    } catch (e) {
      console.error("Failed to create demo user:", e);
    }

    // Middleware to inject the demo user into request
    app.use((req, res, next) => {
      // Mock the structure needed by isAuthenticated
      req.user = {
        claims: demoUserClaims,
        // Mock token data so isAuthenticated checks pass
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24, // valid for 24h
        access_token: "mock_token",
        refresh_token: "mock_refresh"
      };

      // Also mock req.isAuthenticated()
      (req as any).isAuthenticated = () => true;

      next();
    });

    // Mock login routes to just redirect home
    app.get("/api/login", (req, res) => res.redirect("/"));
    app.get("/api/logout", (req, res) => res.redirect("/"));

    return; // Skip OIDC setup
  }

  // --- Original Replit Auth Setup ---
  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    const registeredStrategies = new Set<string>();

    const ensureStrategy = (domain: string) => {
      const strategyName = `replitauth:${domain}`;
      if (!registeredStrategies.has(strategyName)) {
        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify
        );
        passport.use(strategy);
        registeredStrategies.add(strategyName);
      }
    };

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } catch (error) {
    console.error("Failed to setup Replit Auth:", error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If mocking, always pass nicely (handled in middleware above, but double check here)
  if (!isReplitEnv()) {
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
