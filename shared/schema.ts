import { pgTable, text, serial, integer, boolean, pgEnum, timestamp, date, numeric } from "drizzle-orm/pg-core";
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
  "travel", 
  "accessories"
]);

export const eventTypeEnum = pgEnum("event_type", [
  "fashion_show",
  "product_launch",
  "exclusive_sale",
  "vip_meeting",
  "workshop"
]);

// Flight related enums
export const flightClassEnum = pgEnum("flight_class", [
  "economy",
  "business",
  "first"
]);

export const flightStatusEnum = pgEnum("flight_status", [
  "scheduled",
  "delayed",
  "cancelled",
  "boarding",
  "in_flight",
  "landed",
  "completed"
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
  // Cultural heritage information
  culturalHeritageTitle: text("cultural_heritage_title"),
  culturalHeritageStory: text("cultural_heritage_story"),
  culturalHeritageImageUrl: text("cultural_heritage_image_url"),
  culturalHeritageRegion: text("cultural_heritage_region"),
  culturalHeritagePeriod: text("cultural_heritage_period"),
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
  // AR reward features
  arModelUrl: text("ar_model_url"),
  arEnabled: boolean("ar_enabled").default(false),
  arDescription: text("ar_description"),
  arThumbnailUrl: text("ar_thumbnail_url"),
  // Gamification features
  badgeId: text("badge_id"),
  badgeIcon: text("badge_icon"),
  badgeTitle: text("badge_title"),
  achievementType: text("achievement_type"), // "visit", "purchase", "social", "learning"
  rarity: text("rarity"), // "common", "uncommon", "rare", "legendary", "mythic"
  unlockCriteria: text("unlock_criteria"),
  streakRequired: integer("streak_required").default(0),
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

// Airline Companies
export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url").notNull(),
  bannerUrl: text("banner_url"),
  headquartersLocation: text("headquarters_location"),
  foundedYear: integer("founded_year"),
  websiteUrl: text("website_url"),
  bookingPartnerUrl: text("booking_partner_url"), // For Booking.com or other partner links
  featured: boolean("featured").default(false),
  membershipBenefits: text("membership_benefits"),
  rewardPoints: integer("reward_points").default(0), // Points earned per booking
  storeId: integer("store_id"), // Foreign key to virtual_stores
  active: boolean("active").default(true),
});

// Airports
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // IATA code
  city: text("city").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  timezone: text("timezone"),
  popular: boolean("popular").default(false),
});

// Flights
export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airlineId: integer("airline_id").notNull(),
  departureAirportId: integer("departure_airport_id").notNull(),
  arrivalAirportId: integer("arrival_airport_id").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  status: flightStatusEnum("status").default("scheduled"),
  aircraft: text("aircraft"),
  economyPrice: integer("economy_price").notNull(),
  businessPrice: integer("business_price"),
  firstClassPrice: integer("first_class_price"),
  availableEconomySeats: integer("available_economy_seats").notNull(),
  availableBusinessSeats: integer("available_business_seats"),
  availableFirstClassSeats: integer("available_first_class_seats"),
  totalSeats: integer("total_seats").notNull(),
  imageUrl: text("image_url"),
  stopover: boolean("stopover").default(false),
  stopoverAirportId: integer("stopover_airport_id"),
  stopoverDuration: integer("stopover_duration"), // In minutes
  featured: boolean("featured").default(false),
  miles: integer("miles").default(0), // Loyalty miles earned
  bookingPartnerUrl: text("booking_partner_url"), // Direct link to book on Booking.com
});

// Flight Bookings
export const flightBookings = pgTable("flight_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  flightId: integer("flight_id").notNull(),
  bookingReference: text("booking_reference").notNull().unique(),
  bookingDate: timestamp("booking_date").notNull().defaultNow(),
  travelClass: flightClassEnum("travel_class").default("economy"),
  passengers: integer("passengers").notNull().default(1),
  totalAmount: integer("total_amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  specialRequests: text("special_requests"),
  checkedIn: boolean("checked_in").default(false),
  checkinTime: timestamp("checkin_time"),
  bookingPartner: text("booking_partner").default("direct"), // "direct", "booking.com", etc.
  partnerBookingId: text("partner_booking_id"), // External booking reference
  pointsEarned: integer("points_earned").default(0),
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

// Airline related insert schemas
export const insertAirlineSchema = createInsertSchema(airlines);
export const insertAirportSchema = createInsertSchema(airports);
export const insertFlightSchema = createInsertSchema(flights);
export const insertFlightBookingSchema = createInsertSchema(flightBookings);

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

// Flight Booking Schema
export const flightBookingSchema = z.object({
  flightId: z.number(),
  travelClass: z.enum(["economy", "business", "first"]),
  passengers: z.number().min(1).max(10),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  oneWay: z.boolean().default(true),
  paymentMethod: z.enum(["credit_card", "paypal", "apple_pay", "crypto"]),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  specialRequests: z.string().max(200).optional(),
  bookingPartner: z.string().default("direct"),
});

// Flight Search Schema
export const flightSearchSchema = z.object({
  departureAirportCode: z.string().min(3).max(4),
  arrivalAirportCode: z.string().min(3).max(4),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(10).default(1),
  travelClass: z.enum(["economy", "business", "first"]).default("economy"),
  oneWay: z.boolean().default(false),
  directFlightsOnly: z.boolean().default(false),
  flexibleDates: z.boolean().default(false),
});

// Booking.com Integration Schema
export const bookingIntegrationSchema = z.object({
  apiKey: z.string(),
  partnerId: z.string(),
  redirectUrl: z.string().url(),
  searchParams: z.object({
    checkIn: z.string(),
    checkOut: z.string().optional(),
    adults: z.number().min(1).default(1),
    children: z.number().default(0),
    rooms: z.number().min(1).default(1),
    destination: z.string(),
    destinationType: z.enum(["city", "hotel", "airport", "landmark"]).default("city"),
  }),
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
export type Airline = typeof airlines.$inferSelect;
export type Airport = typeof airports.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type FlightBooking = typeof flightBookings.$inferSelect;
export type MembershipSubscription = z.infer<typeof membershipSubscriptionSchema>;
export type StoreRental = z.infer<typeof storeRentalSchema>;
export type EventRegistration = z.infer<typeof eventRegistrationSchema>;
export type AnalyticsDataRequest = z.infer<typeof analyticsDataRequestSchema>;
export type FlightBookingRequest = z.infer<typeof flightBookingSchema>;
export type FlightSearch = z.infer<typeof flightSearchSchema>;
export type BookingIntegration = z.infer<typeof bookingIntegrationSchema>;

// Schema for cart items (in-memory only, not persisted)
export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;
