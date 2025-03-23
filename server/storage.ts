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
    
    // Sample brand products for Amrikyy Mall
    const productData: Omit<Product, "id">[] = [
      {
        name: "حذاء نايكي اير جوردان ريترو",
        description: "حذاء رياضي أصلي من نايكي، مستوحى من تصميم مايكل جوردان الكلاسيكي مع تقنية الهواء المضغوط للراحة المثالية",
        price: 4200,
        imageUrl: "/images/product-templates/nike-shoes.svg",
        category: "clothing",
        inStock: true,
        commissionRate: 10,
        vrEnabled: true,
        brandId: 1,
        featured: true,
        threeDModelUrl: "/models/nike-jordan.glb",
        viewCount: 542
      },
      {
        name: "تيشيرت أديداس أوريجينال",
        description: "تيشيرت رياضي أصلي من أديداس بشعار الثلاث ورقات الشهير، مصنوع من قطن عضوي 100% للراحة الفائقة",
        price: 1250,
        imageUrl: "/images/product-templates/adidas-tshirt.svg",
        category: "clothing",
        inStock: true,
        commissionRate: 12,
        vrEnabled: true,
        brandId: 2,
        featured: true,
        threeDModelUrl: "/models/adidas-tshirt.glb",
        viewCount: 389
      },
      {
        name: "بنطلون ليفايز الأصلي",
        description: "جينز ليفايز الأصلي بقصة مستقيمة كلاسيكية، مصنوع من قطن عالي الجودة مع تقنية الغسيل المتطورة للمظهر العصري",
        price: 2400,
        imageUrl: "/images/product-templates/levis-jeans.svg",
        category: "clothing",
        inStock: true,
        commissionRate: 15,
        vrEnabled: true,
        brandId: 3,
        featured: true,
        threeDModelUrl: "/models/levis-jeans.glb",
        viewCount: 418
      },
      {
        name: "سماعات آبل إيربودز برو",
        description: "سماعات آبل إيربودز برو الأصلية مع خاصية إلغاء الضوضاء النشطة وجودة صوت استثنائية ومقاومة للماء والعرق",
        price: 5500,
        imageUrl: "/images/product-templates/apple-airpods.svg",
        category: "electronics",
        inStock: true,
        commissionRate: 18,
        vrEnabled: true,
        brandId: 4,
        featured: true,
        threeDModelUrl: "/models/apple-airpods.glb",
        viewCount: 756
      },
      {
        name: "هاتف سامسونج جالكسي S22",
        description: "هاتف ذكي من سامسونج مع شاشة AMOLED وكاميرا متطورة وأداء فائق مع بطارية تدوم طوال اليوم",
        price: 18500,
        imageUrl: "/images/product-templates/samsung-galaxy.svg",
        category: "electronics",
        inStock: true,
        commissionRate: 14,
        vrEnabled: true,
        brandId: 5,
        featured: true,
        threeDModelUrl: "/models/samsung-phone.glb",
        viewCount: 603
      },
      {
        name: "ساعة أبل ووتش سيريس 8",
        description: "ساعة ذكية من أبل مع شاشة رتينا دائماً مضاءة، ومقاومة للماء، مع مستشعرات متقدمة لتتبع الصحة واللياقة البدنية",
        price: 13200,
        imageUrl: "/images/product-templates/apple-airpods.svg", // Temporarily using airpods SVG until we create a watch SVG
        category: "electronics",
        inStock: true,
        commissionRate: 16,
        vrEnabled: true,
        brandId: 4,
        featured: false,
        threeDModelUrl: "/models/apple-watch.glb",
        viewCount: 503
      }
    ];

    productData.forEach(product => {
      const id = this.currentId.products++;
      this.products.set(id, { ...product, id });
    });

    // Sample rewards with brand products
    const rewardData: Omit<Reward, "id">[] = [
      {
        name: "خصم 500 جنيه على منتجات نايكي",
        description: "استمتع بخصم على طلبك التالي من منتجات نايكي الأصلية في مول أمريكي",
        pointsRequired: 1000,
        isActive: true,
        tier: "basic",
        imageUrl: "/images/product-templates/nike-shoes.svg",
        expiryDate: new Date("2025-12-31")
      },
      {
        name: "شحن مجاني",
        description: "توصيل مجاني لمشترياتك القادمة من أي ماركة في مول أمريكي لجميع أنحاء مصر",
        pointsRequired: 750,
        isActive: true,
        tier: "basic",
        imageUrl: "/images/product-templates/samsung-galaxy.svg",
        expiryDate: new Date("2025-12-31")
      },
      {
        name: "قسيمة هدية بقيمة 1000 جنيه",
        description: "احصل على قسيمة هدية بقيمة 1000 جنيه لاستخدامها على أي منتجات في مول أمريكي",
        pointsRequired: 2000,
        isActive: true,
        tier: "premium",
        imageUrl: "/images/product-templates/adidas-tshirt.svg",
        expiryDate: new Date("2025-12-31")
      },
      {
        name: "عضوية VIP لمدة شهر",
        description: "احصل على عضوية VIP تمنحك خصم 15% على جميع المنتجات وشحن مجاني لمدة شهر كامل",
        pointsRequired: 3000,
        isActive: true,
        tier: "premium",
        imageUrl: "/images/product-templates/apple-airpods.svg",
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
