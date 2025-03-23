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
    const user: User = { 
      ...insertUser, 
      id, 
      points: 0,
      membershipTier: "basic",
      membershipStartDate: new Date(),
      membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      avatar: null,
      lastLogin: new Date()
    };
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
    // Create test users with simplified password hashes
    const users: User[] = [
      {
        id: this.currentId.users++,
        username: "test",
        // Simple hash to avoid crypto comparison issues
        password: "test123", 
        email: "test@example.com",
        fullName: "مستخدم تجريبي",
        points: 500,
        affiliateCode: "TESTUSER",
        membershipTier: "premium",
        membershipStartDate: new Date("2024-01-01"),
        membershipEndDate: new Date("2025-12-31"),
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
        lastLogin: new Date()
      },
      {
        id: this.currentId.users++,
        username: "زائر", // 'Guest' in Arabic
        // Simple password for guest login
        password: "guest123", 
        email: "guest@example.com",
        fullName: "زائر",
        points: 100,
        affiliateCode: "GUEST001",
        membershipTier: "basic",
        membershipStartDate: new Date("2024-03-01"),
        membershipEndDate: new Date("2025-03-01"),
        avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
        lastLogin: new Date()
      },
      {
        id: this.currentId.users++,
        username: "متسوق", // 'Shopper' in Arabic
        // Simple password for shopper login
        password: "shop123", 
        email: "shopper@example.com", 
        fullName: "متسوق",
        points: 200,
        affiliateCode: "SHOPPER001",
        membershipTier: "basic",
        membershipStartDate: new Date("2024-02-15"),
        membershipEndDate: new Date("2025-02-15"),
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        lastLogin: new Date()
      }
    ];
    
    // Add all users to the storage
    users.forEach(user => {
      this.users.set(user.id, user);
    });
    
    // Sample products
    const productData: Omit<Product, "id">[] = [
      {
        name: "جلابية مصرية تقليدية",
        description: "جلابية مصرية أصيلة بتطريز يدوي فاخر ومصنوعة من القطن المصري عالي الجودة",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1590074072786-a66914d668f1",
        category: "clothing",
        inStock: true,
        commissionRate: 10,
        vrEnabled: true,
        brandId: 1,
        featured: true,
        threeDModelUrl: "/models/galabiya.glb",
        viewCount: 342
      },
      {
        name: "عباية خليجية مطرزة",
        description: "عباية أنيقة بتصميم عصري ومطرزة يدويًا، مناسبة للمناسبات الخاصة",
        price: 1850,
        imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60ae46f",
        category: "clothing",
        inStock: true,
        commissionRate: 12,
        vrEnabled: true,
        brandId: 2,
        featured: true,
        threeDModelUrl: "/models/abaya.glb",
        viewCount: 289
      },
      {
        name: "قفطان مغربي فاخر",
        description: "قفطان بألوان زاهية وتطريز ذهبي فخم، مستوحى من التراث المغربي الأصيل",
        price: 2200,
        imageUrl: "https://images.unsplash.com/photo-1603798125914-7b5d27789648",
        category: "clothing",
        inStock: true,
        commissionRate: 15,
        vrEnabled: true,
        brandId: 3,
        featured: true,
        threeDModelUrl: "/models/kaftan.glb",
        viewCount: 418
      },
      {
        name: "طربوش تقليدي",
        description: "طربوش أحمر مصنوع يدويًا بأعلى جودة، قطعة تراثية أصيلة",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1582458131866-380408738747",
        category: "clothing",
        inStock: true,
        commissionRate: 8,
        vrEnabled: true,
        brandId: 1,
        featured: false,
        threeDModelUrl: "/models/tarboosh.glb",
        viewCount: 156
      },
      {
        name: "سروال شرقي فضفاض",
        description: "سروال قطني فضفاض بتصميم عصري، مريح ومناسب للصيف",
        price: 550,
        imageUrl: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e",
        category: "clothing",
        inStock: true,
        commissionRate: 9,
        vrEnabled: true,
        brandId: 2,
        featured: false,
        threeDModelUrl: "/models/pants.glb",
        viewCount: 203
      }
    ];

    productData.forEach(product => {
      const id = this.currentId.products++;
      this.products.set(id, { ...product, id });
    });

    // Sample rewards
    const rewardData: Omit<Reward, "id">[] = [
      {
        name: "خصم 300 جنيه",
        description: "على طلبك التالي من الملابس العربية",
        pointsRequired: 1000,
        isActive: true,
        tier: "basic",
        imageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f",
        expiryDate: new Date("2025-12-31")
      },
      {
        name: "شحن مجاني",
        description: "توصيل مجاني لمشترياتك القادمة في جميع أنحاء مصر",
        pointsRequired: 750,
        isActive: true,
        tier: "basic",
        imageUrl: "https://images.unsplash.com/photo-1586024351226-3ad39725b061",
        expiryDate: new Date("2025-12-31")
      },
      {
        name: "جلابية تقليدية هدية",
        description: "احصل على جلابية مصرية أصيلة مجانًا مع طلبك القادم",
        pointsRequired: 2000,
        isActive: true,
        tier: "premium",
        imageUrl: "https://images.unsplash.com/photo-1590074072786-a66914d668f1",
        expiryDate: new Date("2025-12-31")
      }
    ];

    rewardData.forEach(reward => {
      const id = this.currentId.rewards++;
      this.rewards.set(id, { ...reward, id });
    });
  }
}

export const storage = new MemStorage();
