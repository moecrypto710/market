import { users, products, rewards, affiliates, type User, type InsertUser, type Product, type Reward, type Affiliate, type CartItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create memory store for session
const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { affiliateCode: string }): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  redeemReward(userId: number, rewardId: number): Promise<User>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getPromotedProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Reward operations
  getAllRewards(): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  
  // Affiliate operations
  getAffiliateByUserId(userId: number): Promise<Affiliate | undefined>;
  createAffiliate(affiliate: Omit<Affiliate, "id">): Promise<Affiliate>;
  updateAffiliateEarnings(affiliateId: number, amount: number): Promise<Affiliate>;
  
  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & Product)[]>;
  addToCart(userId: number, item: CartItem): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Session store
  // Using any here to fix type compatibility issues with memory-store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private rewards: Map<number, Reward>;
  private affiliates: Map<number, Affiliate>;
  private carts: Map<number, CartItem[]>;
  sessionStore: any;
  currentId: { users: number; products: number; rewards: number; affiliates: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.rewards = new Map();
    this.affiliates = new Map();
    this.carts = new Map();
    this.currentId = { users: 1, products: 1, rewards: 1, affiliates: 1 };
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every day
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser & { affiliateCode: string }): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, points: 0 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }
    
    const updatedUser = { ...user, points };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async redeemReward(userId: number, rewardId: number): Promise<User> {
    const user = await this.getUser(userId);
    const reward = await this.getReward(rewardId);
    
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }
    
    if (!reward) {
      throw new Error("المكافأة غير موجودة");
    }
    
    if (user.points < reward.pointsRequired) {
      throw new Error("نقاط غير كافية");
    }
    
    const updatedPoints = user.points - reward.pointsRequired;
    return await this.updateUserPoints(userId, updatedPoints);
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getPromotedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.commissionRate >= 8)
      .sort((a, b) => b.commissionRate - a.commissionRate);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  // Reward operations
  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  // Affiliate operations
  async getAffiliateByUserId(userId: number): Promise<Affiliate | undefined> {
    return Array.from(this.affiliates.values()).find(
      (affiliate) => affiliate.userId === userId,
    );
  }
  
  async createAffiliate(affiliate: Omit<Affiliate, "id">): Promise<Affiliate> {
    const id = this.currentId.affiliates++;
    const newAffiliate: Affiliate = { ...affiliate, id };
    this.affiliates.set(id, newAffiliate);
    return newAffiliate;
  }
  
  async updateAffiliateEarnings(affiliateId: number, amount: number): Promise<Affiliate> {
    const affiliate = this.affiliates.get(affiliateId);
    if (!affiliate) {
      throw new Error("سجل التسويق بالعمولة غير موجود");
    }
    
    const updatedAffiliate = { 
      ...affiliate, 
      earnings: affiliate.earnings + amount,
      conversions: affiliate.conversions + 1 
    };
    this.affiliates.set(affiliateId, updatedAffiliate);
    return updatedAffiliate;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & Product)[]> {
    const cartItems = this.carts.get(userId) || [];
    return cartItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }
      return { ...product, ...item };
    });
  }
  
  async addToCart(userId: number, item: CartItem): Promise<void> {
    const cartItems = this.carts.get(userId) || [];
    const existingItemIndex = cartItems.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cartItems.push(item);
    }
    
    this.carts.set(userId, cartItems);
  }
  
  async clearCart(userId: number): Promise<void> {
    this.carts.delete(userId);
  }

  // Initialize sample data
  private initSampleData() {
    // Create a test user
    const testUser: User = {
      id: this.currentId.users++,
      username: "test",
      password: "e0f68f3d235d8958784c7e4215fc5bc408d7e033ee4b4fcf42a7267b77954e13.e10694e83beae2d8db7111dd9c1c9af0", // "password123"
      email: "test@example.com",
      fullName: "مستخدم تجريبي",
      points: 500,
      affiliateCode: "TESTUSER",
    };
    this.users.set(testUser.id, testUser);
    
    // Sample products
    const productData: Omit<Product, "id">[] = [
      {
        name: "ساعة ذكية متطورة",
        description: "تتبع النشاط البدني والإشعارات الذكية",
        price: 29900,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        category: "electronics",
        inStock: true,
        commissionRate: 10,
        vrEnabled: true
      },
      {
        name: "سماعات لاسلكية",
        description: "صوت نقي وجودة عالية",
        price: 19900,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        category: "electronics",
        inStock: true,
        commissionRate: 8,
        vrEnabled: true
      },
      {
        name: "حذاء رياضي",
        description: "مناسب للتمارين والجري اليومي",
        price: 14900,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        category: "sports",
        inStock: true,
        commissionRate: 7,
        vrEnabled: true
      },
      {
        name: "قميص قطني",
        description: "مريح وأنيق لكل المناسبات",
        price: 5990,
        imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633",
        category: "clothing",
        inStock: true,
        commissionRate: 6,
        vrEnabled: false
      },
      {
        name: "مصباح طاولة",
        description: "إضاءة هادئة وتصميم عصري",
        price: 7990,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
        category: "home",
        inStock: true,
        commissionRate: 9,
        vrEnabled: true
      }
    ];

    productData.forEach(product => {
      const id = this.currentId.products++;
      this.products.set(id, { ...product, id });
    });

    // Sample rewards
    const rewardData: Omit<Reward, "id">[] = [
      {
        name: "خصم $10",
        description: "على طلبك التالي",
        pointsRequired: 1000,
        isActive: true
      },
      {
        name: "شحن مجاني",
        description: "للطلب التالي",
        pointsRequired: 750,
        isActive: true
      },
      {
        name: "هدية مجانية",
        description: "مع طلبك التالي",
        pointsRequired: 1500,
        isActive: true
      }
    ];

    rewardData.forEach(reward => {
      const id = this.currentId.rewards++;
      this.rewards.set(id, { ...reward, id });
    });
  }
}

export const storage = new MemStorage();
