import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { nanoid } from "nanoid";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Handle case where stored might not be properly formatted
    if (!stored || !stored.includes('.')) {
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Check if both buffers have the same length before comparing
    if (hashedBuf.length !== suppliedBuf.length) {
      console.log(`Buffer length mismatch: ${hashedBuf.length} vs ${suppliedBuf.length}`);
      // For buffer length mismatch, use a safe string comparison instead
      return hashed === suppliedBuf.toString("hex");
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "amrikky-secure-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false);
      }
      
      // Special handling for test accounts (direct password comparison)
      if (['test', 'زائر', 'متسوق'].includes(username)) {
        if (password === user.password) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } 
      // Normal password checking for regular accounts
      else if (await comparePasswords(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("اسم المستخدم موجود بالفعل");
    }

    // Generate a unique affiliate code
    const affiliateCode = nanoid(8);

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
      affiliateCode,
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Update last login timestamp
        storage.updateUserLastLogin(user.id).catch((updateErr: Error) => 
          console.error("Failed to update last login:", updateErr)
        );
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
