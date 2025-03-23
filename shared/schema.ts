import { pgTable, text, serial, integer, boolean, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const membershipTierEnum = pgEnum("membership_tier", [
  "basic",
  "premium",
  "vip",
  "enterprise"
]);

export const storeLocationEnum = pgEnum("store_location", [
  "standard",
  "premium",
  "entrance",
  "central"
]);

export const storeSizeEnum = pgEnum("store_size", [
  "small",
  "medium",
  "large",
  "flagship"
]);

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

export const eventTypeEnum = pgEnum("event_type", [
  "fashion_show",
  "product_launch",
  "exclusive_sale",
  "vip_meeting",
  "workshop"
]);

// Users and Memberships
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  points: integer("points").notNull().default(0),
  affiliateCode: text("affiliate_code").notNull(),
  membershipTier: membershipTierEnum("membership_tier").default("basic"),
  membershipStartDate: timestamp("membership_start_date"),
  membershipEndDate: timestamp("membership_end_date"),
  avatar: text("avatar"),
  lastLogin: timestamp("last_login"),
});

// Product related tables
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
  brandId: integer("brand_id"),
  featured: boolean("featured").default(false),
  threeDModelUrl: text("three_d_model_url"),
  viewCount: integer("view_count").default(0),
  // حقول خاصة بركن التراث الثقافي
  heritageStory: text("heritage_story"),
  heritageRegion: text("heritage_region"),
  heritageEra: text("heritage_era"),
  heritageMaterials: text("heritage_materials"),
  heritageImageUrl: text("heritage_image_url"),
  heritageVideoUrl: text("heritage_video_url"),
});

// Rewards and loyalty
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsRequired: integer("points_required").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  tier: membershipTierEnum("tier").default("basic"),
  imageUrl: text("image_url"),
  expiryDate: timestamp("expiry_date"),
});

// Affiliate marketing
export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  earnings: integer("earnings").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  tier: text("tier").default("bronze"),
  customCommissionRate: integer("custom_commission_rate"),
  paymentInfo: text("payment_info"),
  biography: text("biography"),
  specialty: categoryEnum("specialty"),
});

// Virtual Stores
export const virtualStores = pgTable("virtual_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brandId: integer("brand_id").notNull(),
  description: text("description"),
  logoUrl: text("logo_url").notNull(),
  bannerUrl: text("banner_url"),
  size: storeSizeEnum("size").default("medium"),
  location: storeLocationEnum("location").default("standard"),
  monthlyFee: integer("monthly_fee").notNull(),
  featured: boolean("featured").default(false),
  customThemeColor: text("custom_theme_color"),
  designTemplate: text("design_template").default("standard"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
  visitorCount: integer("visitor_count").default(0),
  conversionRate: integer("conversion_rate").default(0),
});

// Virtual Events
export const virtualEvents = pgTable("virtual_events", {
  id: serial("id").primaryKey(), 
  name: text("name").notNull(),
  description: text("description").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: integer("price"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  hostId: integer("host_id").notNull(),
  imageUrl: text("image_url"),
  vrEnvironmentId: text("vr_environment_id"),
  isPremium: boolean("is_premium").default(false),
  membershipRequired: membershipTierEnum("membership_required"),
});

// Create schemas for inserts
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
export const insertVirtualStoreSchema = createInsertSchema(virtualStores);
export const insertVirtualEventSchema = createInsertSchema(virtualEvents);

// Create membership subscription schema 
export const membershipSubscriptionSchema = z.object({
  tier: z.enum(["basic", "premium", "vip", "enterprise"]),
  durationMonths: z.number().min(1).max(24),
  paymentMethod: z.enum(["credit_card", "paypal", "apple_pay", "crypto"]),
  autoRenew: z.boolean().default(true),
});

// Store rental schema
export const storeRentalSchema = z.object({
  name: z.string().min(3).max(50),
  brandId: z.number(),
  description: z.string().max(500).optional(),
  size: z.enum(["small", "medium", "large", "flagship"]),
  location: z.enum(["standard", "premium", "entrance", "central"]),
  durationMonths: z.number().min(1).max(24),
  customThemeColor: z.string().optional(),
  designTemplate: z.string().optional(),
});

// Event registration schema
export const eventRegistrationSchema = z.object({
  eventId: z.number(),
  userId: z.number(),
  numberOfTickets: z.number().min(1).max(10),
  paymentMethod: z.enum(["credit_card", "paypal", "apple_pay", "crypto"]),
  specialRequests: z.string().max(200).optional(),
});

// Data for analytics schema
export const analyticsDataRequestSchema = z.object({
  dataType: z.enum(["traffic", "sales", "conversions", "heatmap", "demographic"]),
  timeRange: z.enum(["day", "week", "month", "quarter", "year"]),
  format: z.enum(["json", "csv", "pdf", "dashboard"]),
  filterBy: z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    product: z.number().optional(),
    membershipTier: z.string().optional(),
  }).optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Affiliate = typeof affiliates.$inferSelect;
export type VirtualStore = typeof virtualStores.$inferSelect;
export type VirtualEvent = typeof virtualEvents.$inferSelect;
export type MembershipSubscription = z.infer<typeof membershipSubscriptionSchema>;
export type StoreRental = z.infer<typeof storeRentalSchema>;
export type EventRegistration = z.infer<typeof eventRegistrationSchema>;
export type AnalyticsDataRequest = z.infer<typeof analyticsDataRequestSchema>;

// Schema for cart items (in-memory only, not persisted)
export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;
