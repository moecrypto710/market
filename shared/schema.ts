import { pgTable, text, serial, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  points: integer("points").notNull().default(0),
  affiliateCode: text("affiliate_code").notNull(),
});

export const paymentMethodEnum = pgEnum("payment_method", [
  "credit_card", 
  "paypal", 
  "apple_pay", 
  "crypto"
]);

export const categoryEnum = pgEnum("category", [
  "electronics", 
  "clothing", 
  "home", 
  "sports"
]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  category: categoryEnum("category").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  commissionRate: integer("commission_rate").notNull().default(5),
  vrEnabled: boolean("vr_enabled").notNull().default(true),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsRequired: integer("points_required").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  earnings: integer("earnings").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products);
export const insertRewardSchema = createInsertSchema(rewards);
export const insertAffiliateSchema = createInsertSchema(affiliates);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Affiliate = typeof affiliates.$inferSelect;

// Schema for cart items (in-memory only, not persisted)
export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;
