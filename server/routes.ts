import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { cartItemSchema } from "@shared/schema";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  // IMPORTANT: The specific route must come before the parameterized route
  // Otherwise, Express will treat "promoted" as an ID parameter
  app.get("/api/products/:id", async (req, res) => {
    try {
      // Special case for the promoted endpoint
      if (req.params.id === 'promoted') {
        const products = await storage.getPromotedProducts();
        return res.json(products);
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف المنتج غير صالح" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المنتج" });
    }
  });

  app.get("/api/rewards", async (req, res) => {
    const rewards = await storage.getAllRewards();
    res.json(rewards);
  });

  app.post("/api/rewards/:id/redeem", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    const rewardId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "المكافأة غير موجودة" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      if (user.points < reward.pointsRequired) {
        return res.status(400).json({ message: "نقاط غير كافية" });
      }

      const updatedUser = await storage.redeemReward(userId, rewardId);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استبدال المكافأة" });
    }
  });

  app.get("/api/affiliate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const userId = req.user.id;
      const affiliate = await storage.getAffiliateByUserId(userId);
      
      if (!affiliate) {
        // Create a new affiliate record if it doesn't exist
        const newAffiliate = await storage.createAffiliate({ 
          userId, 
          earnings: 0, 
          conversions: 0,
          tier: "basic",
          customCommissionRate: null,
          paymentInfo: null,
          biography: null,
          specialty: null
        });
        return res.json(newAffiliate);
      }
      
      res.json(affiliate);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات التسويق بالعمولة" });
    }
  });

  // Cart management
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب عناصر سلة التسوق" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const userId = req.user.id;
      const cartItem = cartItemSchema.parse(req.body);
      
      // Verify product exists
      const product = await storage.getProduct(cartItem.productId);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      await storage.addToCart(userId, cartItem);
      res.status(201).json({ message: "تمت إضافة المنتج إلى سلة التسوق" });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
