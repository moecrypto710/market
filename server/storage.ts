import { 
  users, products, rewards, affiliates, virtualStores, virtualEvents, 
  airlines, airports, flights, flightBookings,
  type User, type InsertUser, type Product, type Reward, type Affiliate, 
  type CartItem, type VirtualStore, type VirtualEvent,
  type Airline, type Airport, type Flight, type FlightBooking, type FlightSearch
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, gte, desc } from "drizzle-orm";
import pgSessionStore from "connect-pg-simple";
import postgres from "postgres";

// Create memory store for session
const MemoryStore = createMemoryStore(session);
const PgStore = pgSessionStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { affiliateCode: string }): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  updateUserLastLogin(userId: number): Promise<User>;
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
  
  // Airline operations
  getAllAirlines(): Promise<Airline[]>;
  getFeaturedAirlines(): Promise<Airline[]>;
  getAirline(id: number): Promise<Airline | undefined>;
  getAirlineByCode(code: string): Promise<Airline | undefined>;
  
  // Airport operations
  getAllAirports(): Promise<Airport[]>;
  getPopularAirports(): Promise<Airport[]>;
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  
  // Flight operations
  getAllFlights(): Promise<Flight[]>;
  getFlightsByAirline(airlineId: number): Promise<Flight[]>;
  getFlight(id: number): Promise<Flight | undefined>;
  searchFlights(searchParams: FlightSearch): Promise<Flight[]>;
  getFlightsByRoute(departureAirportId: number, arrivalAirportId: number): Promise<Flight[]>;
  
  // Flight Booking operations
  createFlightBooking(booking: Omit<FlightBooking, "id" | "bookingDate">): Promise<FlightBooking>;
  getUserFlightBookings(userId: number): Promise<FlightBooking[]>;
  getFlightBooking(id: number): Promise<FlightBooking | undefined>;
  updateFlightBookingStatus(bookingId: number, status: string): Promise<FlightBooking>;
  
  // Booking.com integration
  getBookingPartnerUrl(flightId: number): Promise<string | undefined>;
  
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
  private airlines: Map<number, Airline>;
  private airports: Map<number, Airport>;
  private flights: Map<number, Flight>;
  private flightBookings: Map<number, FlightBooking>;
  sessionStore: any;
  currentId: { 
    users: number; 
    products: number; 
    rewards: number; 
    affiliates: number; 
    airlines: number;
    airports: number;
    flights: number;
    flightBookings: number;
  };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.rewards = new Map();
    this.affiliates = new Map();
    this.carts = new Map();
    this.airlines = new Map();
    this.airports = new Map();
    this.flights = new Map();
    this.flightBookings = new Map();
    
    this.currentId = { 
      users: 1, 
      products: 1, 
      rewards: 1, 
      affiliates: 1,
      airlines: 1,
      airports: 1,
      flights: 1,
      flightBookings: 1
    };
    
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
  
  async updateUserLastLogin(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }
    
    const updatedUser = { ...user, lastLogin: new Date() };
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
  
  // Airline operations
  async getAllAirlines(): Promise<Airline[]> {
    return Array.from(this.airlines.values());
  }
  
  async getFeaturedAirlines(): Promise<Airline[]> {
    return Array.from(this.airlines.values())
      .filter(airline => airline.featured);
  }
  
  async getAirline(id: number): Promise<Airline | undefined> {
    return this.airlines.get(id);
  }
  
  async getAirlineByCode(code: string): Promise<Airline | undefined> {
    return Array.from(this.airlines.values())
      .find(airline => airline.code === code);
  }
  
  // Airport operations
  async getAllAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }
  
  async getPopularAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values())
      .filter(airport => airport.popular)
      .sort((a, b) => b.passengerTraffic - a.passengerTraffic);
  }
  
  async getAirport(id: number): Promise<Airport | undefined> {
    return this.airports.get(id);
  }
  
  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return Array.from(this.airports.values())
      .find(airport => airport.code === code);
  }
  
  // Flight operations
  async getAllFlights(): Promise<Flight[]> {
    return Array.from(this.flights.values());
  }
  
  async getFlightsByAirline(airlineId: number): Promise<Flight[]> {
    return Array.from(this.flights.values())
      .filter(flight => flight.airlineId === airlineId);
  }
  
  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }
  
  async searchFlights(searchParams: FlightSearch): Promise<Flight[]> {
    return Array.from(this.flights.values())
      .filter(flight => {
        // Match departure and arrival airports
        if (searchParams.departureAirportId && flight.departureAirportId !== searchParams.departureAirportId) {
          return false;
        }
        
        if (searchParams.arrivalAirportId && flight.arrivalAirportId !== searchParams.arrivalAirportId) {
          return false;
        }
        
        // Match airline if specified
        if (searchParams.airlineId && flight.airlineId !== searchParams.airlineId) {
          return false;
        }
        
        // Match departure date if specified
        if (searchParams.departureDate) {
          const requestedDate = new Date(searchParams.departureDate);
          const flightDate = new Date(flight.departureTime);
          
          if (requestedDate.getFullYear() !== flightDate.getFullYear() ||
              requestedDate.getMonth() !== flightDate.getMonth() ||
              requestedDate.getDate() !== flightDate.getDate()) {
            return false;
          }
        }
        
        // Match flight class if specified
        if (searchParams.flightClass && flight.availableClasses.indexOf(searchParams.flightClass as any) === -1) {
          return false;
        }
        
        // Match passengers
        if (searchParams.passengers && flight.availableSeats < searchParams.passengers) {
          return false;
        }
        
        return true;
      });
  }
  
  async getFlightsByRoute(departureAirportId: number, arrivalAirportId: number): Promise<Flight[]> {
    return Array.from(this.flights.values())
      .filter(flight => 
        flight.departureAirportId === departureAirportId && 
        flight.arrivalAirportId === arrivalAirportId
      );
  }
  
  // Flight Booking operations
  async createFlightBooking(booking: Omit<FlightBooking, "id" | "bookingDate">): Promise<FlightBooking> {
    const id = this.currentId.flightBookings++;
    const newBooking: FlightBooking = {
      ...booking,
      id,
      bookingDate: new Date()
    };
    
    // Update available seats on the flight
    const flight = await this.getFlight(booking.flightId);
    if (flight) {
      flight.availableSeats -= booking.passengerCount;
      this.flights.set(flight.id, flight);
    }
    
    this.flightBookings.set(id, newBooking);
    return newBooking;
  }
  
  async getUserFlightBookings(userId: number): Promise<FlightBooking[]> {
    return Array.from(this.flightBookings.values())
      .filter(booking => booking.userId === userId);
  }
  
  async getFlightBooking(id: number): Promise<FlightBooking | undefined> {
    return this.flightBookings.get(id);
  }
  
  async updateFlightBookingStatus(bookingId: number, status: string): Promise<FlightBooking> {
    const booking = this.flightBookings.get(bookingId);
    if (!booking) {
      throw new Error("الحجز غير موجود");
    }
    
    const updatedBooking = { ...booking, status };
    this.flightBookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }
  
  // Booking.com integration
  async getBookingPartnerUrl(flightId: number): Promise<string | undefined> {
    const flight = await this.getFlight(flightId);
    if (!flight) {
      return undefined;
    }
    
    const departureAirport = await this.getAirport(flight.departureAirportId);
    const arrivalAirport = await this.getAirport(flight.arrivalAirportId);
    
    if (!departureAirport || !arrivalAirport) {
      return undefined;
    }
    
    // Generate a URL for Booking.com integration
    // In a real implementation, this would use the Booking.com API
    // For this demo, we'll just return a sample URL
    const departureDate = new Date(flight.departureTime).toISOString().split('T')[0];
    const returnDate = new Date(flight.arrivalTime).toISOString().split('T')[0];
    
    return `https://www.booking.com/flights/from-${departureAirport.code}/to-${arrivalAirport.code}.html?departing=${departureDate}&returning=${returnDate}&adults=1`;
  }

  // Initialize sample data
  private initSampleData() {
    // Initialize collections for airline data
    this.airlines = new Map();
    this.airports = new Map();
    this.flights = new Map();
    this.flightBookings = new Map();
    
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
    
    // Sample brand products for بلدة الأمريكي Town
    const productData: Omit<Product, "id">[] = [
      // CLOTHING PRODUCTS
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
        viewCount: 542,
        culturalHeritageTitle: "أحذية الفروسية العربية",
        culturalHeritageStory: "تمتد تقاليد الأحذية الخاصة بالفروسية في العالم العربي لقرون عديدة، حيث كان الفرسان العرب يستخدمون أحذية مميزة ذات أهمية خاصة في الثقافة العربية. كانت هذه الأحذية تصنع يدويًا من الجلد الطبيعي وتزين بنقوش معقدة تعكس الهوية الثقافية للمنطقة. الحذاء الرياضي الحديث يستوحي هذا التراث من خلال خطوط التصميم الانسيابية والألوان المستوحاة من الصحراء العربية، مع دمج التقنيات الحديثة للراحة والأداء.",
        culturalHeritageImageUrl: "/images/heritage/arabian-horseback-boots.jpg",
        culturalHeritageRegion: "شبه الجزيرة العربية",
        culturalHeritagePeriod: "القرن 18-19"
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
        viewCount: 389,
        culturalHeritageTitle: "النسيج المصري القديم",
        culturalHeritageStory: "الملابس القطنية تحمل إرثاً قديماً في مصر، حيث كانت مصر من أوائل الحضارات التي زرعت القطن وعالجته لصنع ملابس ذات جودة فائقة. تشتهر المنسوجات المصرية القديمة بأنماطها المعقدة وألوانها النابضة بالحياة، والتي كانت تستخدم أصباغاً طبيعية مستخرجة من النباتات والمعادن المحلية. هذه التقنيات القديمة في الصباغة والحياكة ألهمت العديد من تصاميم الملابس الحديثة، مع الحفاظ على الراحة والأناقة التي اشتهرت بها المنسوجات المصرية عبر التاريخ.",
        culturalHeritageImageUrl: "/images/heritage/egyptian-textiles.jpg",
        culturalHeritageRegion: "مصر القديمة",
        culturalHeritagePeriod: "3000 ق.م - 30 ق.م"
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
        viewCount: 418,
        culturalHeritageTitle: "السراويل البدوية التقليدية",
        culturalHeritageStory: "تتميز الثقافة البدوية في شمال أفريقيا والشرق الأوسط بتصاميم فريدة للملابس تجمع بين العملية والجمال. السراويل البدوية التقليدية كانت تصمم بشكل خاص لتناسب الحياة في الصحراء، حيث كانت فضفاضة للتهوية وتصنع من أقمشة متينة لتحمل ظروف الحياة القاسية. كانت تزين أحياناً بأنماط هندسية معقدة تعكس القبيلة أو المنطقة. الجينز الحديث، رغم مظهره المختلف، يشترك مع السراويل البدوية في فلسفة التصميم القائمة على المتانة والراحة والتعبير عن الهوية الثقافية.",
        culturalHeritageImageUrl: "/images/heritage/bedouin-pants.jpg",
        culturalHeritageRegion: "شمال أفريقيا والشرق الأوسط",
        culturalHeritagePeriod: "القرون 17-20"
      },
      
      // ELECTRONICS PRODUCTS
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
        viewCount: 756,
        culturalHeritageTitle: "الموسيقى الشرقية والمقامات العربية",
        culturalHeritageStory: "الموسيقى العربية تتميز بنظام المقامات الفريد الذي تطور عبر قرون من التاريخ الموسيقي. يعتمد هذا النظام على تقسيمات دقيقة للأصوات تختلف عن النظام الغربي، مما يسمح بالتعبير عن مشاعر وأحاسيس فريدة. هذه الدقة في الأصوات تتطلب أدوات استماع عالية الجودة للتمييز بين درجات الصوت المختلفة. سماعات الرأس الحديثة مع تقنيات إلغاء الضوضاء تمكن المستمعين من الغوص في عمق الموسيقى الشرقية وتذوق تفاصيلها الدقيقة التي قد تضيع في بيئة استماع عادية.",
        culturalHeritageImageUrl: "/images/heritage/arabic-music-maqam.jpg",
        culturalHeritageRegion: "الشرق الأوسط وشمال أفريقيا",
        culturalHeritagePeriod: "من العصر العباسي إلى الوقت الحاضر"
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
        viewCount: 603,
        culturalHeritageTitle: "تطور الاتصالات في الثقافة العربية",
        culturalHeritageStory: "تمتاز الثقافة العربية بتقاليد عريقة في التواصل والاتصال، بدءًا من الرسائل المكتوبة التي كانت تنقل عبر الصحراء بواسطة القوافل، إلى نظام البريد المتطور في العصر العباسي المعروف باسم 'البريد'. تطورت وسائل الاتصال في العالم العربي مع الزمن، لكنها دائمًا حافظت على أهمية التواصل الشخصي والمباشر. الهواتف الذكية الحديثة مثل هذا الجهاز تمثل امتدادًا لهذا التاريخ العريق، مع تمكين المستخدمين من التواصل عبر وسائط متعددة تحترم التقاليد العربية في التواصل الغني بالتعبير وتبادل الثقافة والمعرفة.",
        culturalHeritageImageUrl: "/images/heritage/arabic-communication.jpg",
        culturalHeritageRegion: "العالم العربي",
        culturalHeritagePeriod: "من العصر الجاهلي إلى العصر الحديث"
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
        viewCount: 503,
        culturalHeritageTitle: "فن قياس الوقت في الحضارة الإسلامية",
        culturalHeritageStory: "ساهم العلماء المسلمون بشكل كبير في تطوير أدوات قياس الوقت. في القرن الثامن، ابتكر المهندس الموصلي الجزري ساعات مائية معقدة وآلية، من أشهرها ساعة الفيل المائية. كما طوّر المسلمون الإسطرلاب لقياس مواقع النجوم وتحديد الوقت، وساعدت الأوقات الدقيقة في تحديد أوقات الصلاة والاحتفالات الدينية. الساعات الذكية الحديثة مثل هذه تعكس امتداداً لإرث العلماء المسلمين في قياس الوقت بدقة، مع إضافة تقنيات متقدمة لقياس النشاط البدني والصحة العامة، وهي قيم كانت محل اهتمام كبير في الطب الإسلامي القديم.",
        culturalHeritageImageUrl: "/images/heritage/islamic-timekeeping.jpg",
        culturalHeritageRegion: "بلاد الشام وبغداد",
        culturalHeritagePeriod: "العصر الذهبي الإسلامي (750-1258)"
      },
      
      // TRAVEL SERVICES
      {
        name: "تذكرة طيران - الخطوط السعودية",
        description: "تذكرة طيران ذهاب وعودة على درجة الضيافة مع وزن أمتعة إضافي وخدمة وجبات فاخرة",
        price: 3800,
        imageUrl: "/images/product-templates/flight-ticket.svg",
        category: "travel",
        inStock: true,
        commissionRate: 20,
        vrEnabled: true,
        brandId: 7,
        featured: true,
        threeDModelUrl: "/models/airplane-ticket.glb",
        viewCount: 980,
        culturalHeritageTitle: "تقاليد السفر عبر الصحراء",
        culturalHeritageStory: "السفر له مكانة خاصة في الثقافة العربية، حيث كانت القوافل تعبر الصحراء للتجارة والحج منذ آلاف السنين. طورت المجتمعات البدوية معرفة دقيقة بالنجوم للملاحة عبر الصحراء، وابتكرت طرقاً للبقاء على قيد الحياة في البيئات القاسية. كانت رحلات القوافل تستغرق أشهراً، مقارنة بالطيران الحديث الذي يختصر المسافات لساعات قليلة. ومع ذلك، لا تزال قيم الضيافة والترحيب بالمسافرين تشكل عنصراً أساسياً في خدمات السفر العربية الحديثة، استمراراً لتقاليد إكرام الضيف المتأصلة في الثقافة.",
        culturalHeritageImageUrl: "/images/heritage/caravan-travel.jpg",
        culturalHeritageRegion: "شبه الجزيرة العربية",
        culturalHeritagePeriod: "العصور القديمة حتى الحديثة"
      },
      {
        name: "باقة سياحية - الأهرامات وأبو الهول",
        description: "رحلة سياحية لمدة 5 أيام تشمل زيارة الأهرامات وأبو الهول مع مرشد سياحي خاص وإقامة فندقية فاخرة",
        price: 9500,
        imageUrl: "/images/product-templates/egypt-tour.svg",
        category: "travel",
        inStock: true,
        commissionRate: 22,
        vrEnabled: true,
        brandId: 8,
        featured: true,
        threeDModelUrl: "/models/pyramids-tour.glb",
        viewCount: 1240,
        culturalHeritageTitle: "اكتشاف الآثار المصرية",
        culturalHeritageStory: "مصر القديمة كانت مهد واحدة من أعظم الحضارات في التاريخ، حيث تركت إرثاً هائلاً من الآثار والمعالم التي لا تزال تذهل العالم حتى اليوم. الأهرامات، التي بنيت كمقابر للفراعنة، تمثل إنجازاً هندسياً مذهلاً وشهادة على براعة المصريين القدماء. كان العلماء العرب في العصور الوسطى من أوائل من درسوا الآثار المصرية بشكل منهجي، مسجلين ملاحظات دقيقة عن الأهرامات والمعابد. اليوم، تمزج السياحة الثقافية بين التعرف على هذا التراث الغني واستخدام التقنيات الحديثة لتقديم تجربة غامرة تربط الزائر بالماضي العريق.",
        culturalHeritageImageUrl: "/images/heritage/egyptian-pyramids.jpg",
        culturalHeritageRegion: "مصر",
        culturalHeritagePeriod: "2600 ق.م - الحاضر"
      },
      {
        name: "حجز فندق - برج العرب دبي",
        description: "إقامة فاخرة لمدة 3 ليالي في فندق برج العرب السبع نجوم مع إطلالة على البحر وخدمات حصرية",
        price: 25000,
        imageUrl: "/images/product-templates/burj-al-arab.svg",
        category: "travel",
        inStock: true,
        commissionRate: 25,
        vrEnabled: true,
        brandId: 9,
        featured: true,
        threeDModelUrl: "/models/burj-al-arab.glb",
        viewCount: 1580,
        culturalHeritageTitle: "فن الضيافة العربية",
        culturalHeritageStory: "الضيافة في الثقافة العربية ليست مجرد خدمة، بل هي تقليد راسخ يعكس قيماً أساسية في المجتمع. في التاريخ العربي، كان استقبال الضيوف وإكرامهم يعتبر واجباً اجتماعياً ودينياً، ويمتد لثلاثة أيام على الأقل. كانت الخيام البدوية تفتح أبوابها للمسافرين في الصحراء، وكان تقديم القهوة العربية والتمر طقساً أساسياً في الترحيب. اليوم، تجسد الفنادق الفاخرة مثل برج العرب هذا التراث مع إضافة عناصر من الرفاهية المعاصرة، حيث تمزج بين الديكورات المستوحاة من التراث والتصميمات الحديثة لخلق تجربة ضيافة فريدة تعكس الهوية الثقافية العربية في سياق عالمي.",
        culturalHeritageImageUrl: "/images/heritage/arabic-hospitality.jpg",
        culturalHeritageRegion: "الخليج العربي",
        culturalHeritagePeriod: "تقليدي إلى معاصر"
      }
    ];

    productData.forEach(product => {
      const id = this.currentId.products++;
      this.products.set(id, { ...product, id });
    });

    // Enhanced rewards with branded products and exclusive benefits
    const rewardData: Omit<Reward, "id">[] = [
      {
        name: "خصم 500 جنيه على منتجات نايكي",
        description: "استمتع بخصم على طلبك التالي من منتجات نايكي الأصلية في بلدة الأمريكي. صالح على جميع منتجات نايكي بما فيها الإصدارات الجديدة والحصرية",
        pointsRequired: 1000,
        isActive: true,
        tier: "basic",
        imageUrl: "/images/product-templates/nike-shoes.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      },
      {
        name: "شحن مجاني لمدة 3 أشهر",
        description: "توصيل مجاني لجميع مشترياتك من أي ماركة في بلدة الأمريكي لجميع أنحاء مصر، والخدمة صالحة لمدة 3 أشهر كاملة من تاريخ التفعيل",
        pointsRequired: 750,
        isActive: true,
        tier: "basic",
        imageUrl: "/images/product-templates/samsung-galaxy.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      },
      {
        name: "قسيمة هدية بقيمة 1000 جنيه",
        description: "احصل على قسيمة هدية بقيمة 1000 جنيه لاستخدامها على أي منتجات في بلدة الأمريكي. القسيمة قابلة للتحويل ويمكن استخدامها على أقساط",
        pointsRequired: 2000,
        isActive: true,
        tier: "premium",
        imageUrl: "/images/product-templates/adidas-tshirt.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      },
      {
        name: "عضوية VIP لمدة شهر",
        description: "احصل على عضوية VIP تمنحك خصم 15% على جميع المنتجات وشحن مجاني لمدة شهر كامل، بالإضافة إلى الوصول المبكر للعروض الحصرية والتخفيضات",
        pointsRequired: 3000,
        isActive: true,
        tier: "premium",
        imageUrl: "/images/product-templates/apple-airpods.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      },
      {
        name: "متجر افتراضي مجاني لمدة شهر",
        description: "احصل على متجر افتراضي مجاني في بلدة الأمريكي لمدة شهر كامل لعرض منتجاتك الخاصة أو منتجات شركائك مع دعم فني كامل",
        pointsRequired: 5000,
        isActive: true,
        tier: "vip",
        imageUrl: "/images/product-templates/levis-jeans.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      },
      {
        name: "وصول حصري لمجموعات محدودة",
        description: "الوصول الحصري للمنتجات المحدودة والإصدارات الخاصة من كبرى الماركات العالمية في بلدة الأمريكي قبل نفاذها من السوق",
        pointsRequired: 7500,
        isActive: true,
        tier: "vip",
        imageUrl: "/images/product-templates/nike-shoes.svg",
        expiryDate: new Date("2025-12-31"),
        arEnabled: false,
        arDescription: "",
        arThumbnailUrl: "",
        arModelUrl: "",
        badgeId: "",
        badgeIcon: "",
        badgeTitle: "",
        achievementType: "",
        rarity: "",
        unlockCriteria: "",
        streakRequired: 0
      }
    ];

    rewardData.forEach(reward => {
      const id = this.currentId.rewards++;
      this.rewards.set(id, { ...reward, id });
    });
    
    // Sample airline companies
    const airlineData: Omit<Airline, "id">[] = [
      {
        name: "الخطوط الجوية السعودية",
        code: "SV",
        description: "الناقل الوطني للمملكة العربية السعودية، تأسست عام 1945 وتخدم أكثر من 100 وجهة حول العالم",
        logoUrl: "/images/product-templates/saudi-airlines-logo.svg",
        bannerUrl: "/images/airlines/saudi-airlines-banner.jpg",
        headquartersLocation: "جدة، المملكة العربية السعودية",
        foundedYear: 1945,
        websiteUrl: "https://www.saudia.com",
        bookingPartnerUrl: "https://www.booking.com/airline/sv.html",
        featured: true,
        membershipBenefits: "برنامج الفرسان لكسب الأميال - خصم 10% على الرحلات الدولية - أولوية الصعود إلى الطائرة",
        rewardPoints: 500,
        storeId: 1,
        active: true
      },
      {
        name: "طيران الإمارات",
        code: "EK",
        description: "شركة طيران دولية مقرها دبي، الإمارات العربية المتحدة، تربط بين مختلف أنحاء العالم عبر مركزها في مطار دبي الدولي",
        logoUrl: "/images/product-templates/emirates-logo.svg",
        bannerUrl: "/images/airlines/emirates-banner.jpg",
        headquartersLocation: "دبي، الإمارات العربية المتحدة",
        foundedYear: 1985,
        websiteUrl: "https://www.emirates.com",
        bookingPartnerUrl: "https://www.booking.com/airline/ek.html",
        featured: true,
        membershipBenefits: "برنامج سكاي واردز لكسب الأميال - خدمة شوفير مجانية للدرجة الأولى ودرجة رجال الأعمال - صالات VIP",
        rewardPoints: 600,
        storeId: 2,
        active: true
      },
      {
        name: "مصر للطيران",
        code: "MS",
        description: "شركة الطيران الوطنية المصرية، تأسست عام 1932 وتعد من أقدم شركات الطيران في أفريقيا والشرق الأوسط",
        logoUrl: "/images/product-templates/egyptair-logo.svg",
        bannerUrl: "/images/airlines/egyptair-banner.jpg",
        headquartersLocation: "القاهرة، مصر",
        foundedYear: 1932,
        websiteUrl: "https://www.egyptair.com",
        bookingPartnerUrl: "https://www.booking.com/airline/ms.html",
        featured: true,
        membershipBenefits: "برنامج مصر للطيران بلس - وزن أمتعة إضافي - خدمات سريعة في المطار",
        rewardPoints: 450,
        storeId: 3,
        active: true
      }
    ];
    
    // Add airlines to storage
    airlineData.forEach(airline => {
      const id = this.currentId.airlines++;
      this.airlines.set(id, { ...airline, id });
    });
    
    // Sample airport data
    const airportData: Omit<Airport, "id">[] = [
      {
        name: "مطار الملك عبد العزيز الدولي",
        code: "JED",
        city: "جدة",
        country: "المملكة العربية السعودية",
        description: "أحد أكبر المطارات في المملكة العربية السعودية والبوابة الرئيسية للحجاج",
        imageUrl: "/images/airports/jeddah-airport.jpg",
        latitude: "21.6790",
        longitude: "39.1562",
        timezone: "Arabia Standard Time",
        popular: true
      },
      {
        name: "مطار دبي الدولي",
        code: "DXB",
        city: "دبي",
        country: "الإمارات العربية المتحدة",
        description: "أحد أكثر المطارات ازدحاماً في العالم ومركز رئيسي للسفر الدولي",
        imageUrl: "/images/airports/dubai-airport.jpg",
        latitude: "25.2532",
        longitude: "55.3657",
        timezone: "Gulf Standard Time",
        popular: true
      },
      {
        name: "مطار القاهرة الدولي",
        code: "CAI",
        city: "القاهرة",
        country: "مصر",
        description: "أكبر مطار في مصر والبوابة الرئيسية للسياحة المصرية",
        imageUrl: "/images/airports/cairo-airport.jpg",
        latitude: "30.1219",
        longitude: "31.4053",
        timezone: "Eastern European Time",
        popular: true
      },
      {
        name: "مطار الدوحة الدولي حمد",
        code: "DOH",
        city: "الدوحة",
        country: "قطر",
        description: "مطار دولي حديث يخدم العاصمة القطرية ومركز لشركة الخطوط الجوية القطرية",
        imageUrl: "/images/airports/doha-airport.jpg",
        latitude: "25.2609",
        longitude: "51.6138",
        timezone: "Arabia Standard Time",
        popular: true
      }
    ];
    
    // Add airports to storage
    airportData.forEach(airport => {
      const id = this.currentId.airports++;
      this.airports.set(id, { ...airport, id });
    });
    
    // Sample flight data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const flightData: Omit<Flight, "id">[] = [
      {
        flightNumber: "SV1021",
        airlineId: 1, // السعودية
        departureAirportId: 1, // جدة
        arrivalAirportId: 3, // القاهرة
        departureTime: new Date(tomorrow.setHours(7, 30, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(9, 45, 0, 0)),
        status: "scheduled",
        aircraft: "Boeing 777-300ER",
        economyPrice: 2500,
        businessPrice: 7500,
        firstClassPrice: 15000,
        availableEconomySeats: 120,
        availableBusinessSeats: 24,
        availableFirstClassSeats: 8,
        totalSeats: 152,
        imageUrl: "/images/flights/saudi-airlines-flight.jpg",
        stopover: false,
        featured: true,
        miles: 950,
        bookingPartnerUrl: "https://www.booking.com/flights/carrier/sv.html"
      },
      {
        flightNumber: "EK703",
        airlineId: 2, // الإمارات
        departureAirportId: 2, // دبي
        arrivalAirportId: 3, // القاهرة
        departureTime: new Date(tomorrow.setHours(14, 15, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(16, 30, 0, 0)),
        status: "scheduled",
        aircraft: "Airbus A380-800",
        economyPrice: 3200,
        businessPrice: 9800,
        firstClassPrice: 19500,
        availableEconomySeats: 350,
        availableBusinessSeats: 76,
        availableFirstClassSeats: 14,
        totalSeats: 440,
        imageUrl: "/images/flights/emirates-flight.jpg",
        stopover: false,
        featured: true,
        miles: 1100,
        bookingPartnerUrl: "https://www.booking.com/flights/carrier/ek.html"
      },
      {
        flightNumber: "MS704",
        airlineId: 3, // مصر للطيران
        departureAirportId: 3, // القاهرة
        arrivalAirportId: 4, // الدوحة
        departureTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(13, 30, 0, 0)),
        status: "scheduled",
        aircraft: "Boeing 787-9 Dreamliner",
        economyPrice: 2200,
        businessPrice: 6500,
        firstClassPrice: null,
        availableEconomySeats: 220,
        availableBusinessSeats: 28,
        availableFirstClassSeats: null,
        totalSeats: 248,
        imageUrl: "/images/flights/egyptair-flight.jpg",
        stopover: false,
        featured: true,
        miles: 850,
        bookingPartnerUrl: "https://www.booking.com/flights/carrier/ms.html"
      },
      {
        flightNumber: "SV1200",
        airlineId: 1, // السعودية
        departureAirportId: 1, // جدة
        arrivalAirportId: 2, // دبي
        departureTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
        arrivalTime: new Date(nextWeek.setHours(11, 45, 0, 0)),
        status: "scheduled",
        aircraft: "Airbus A320neo",
        economyPrice: 1800,
        businessPrice: 5200,
        firstClassPrice: null,
        availableEconomySeats: 140,
        availableBusinessSeats: 20,
        availableFirstClassSeats: null,
        totalSeats: 160,
        imageUrl: "/images/flights/saudi-airlines-flight.jpg",
        stopover: false,
        featured: false,
        miles: 750,
        bookingPartnerUrl: "https://www.booking.com/flights/carrier/sv.html"
      }
    ];
    
    // Add flights to storage
    flightData.forEach(flight => {
      const id = this.currentId.flights++;
      this.flights.set(id, { ...flight, id });
    });
  }
}

// PostgreSQL implementation of the storage interface
export class PgStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Initialize session store with PostgreSQL
    this.sessionStore = new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        // No SSL needed for Replit internal PostgreSQL
        ssl: false, 
      },
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser & { affiliateCode: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      points: 0,
      membershipTier: "basic",
      membershipStartDate: new Date(),
      membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      avatar: null,
      lastLogin: new Date()
    }).returning();
    
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }
    
    const [updatedUser] = await db.update(users)
      .set({ points })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateUserLastLogin(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }
    
    const [updatedUser] = await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async redeemReward(userId: number, rewardId: number): Promise<User> {
    const user = await this.getUser(userId);
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
    
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
    return await db.select().from(products);
  }
  
  async getPromotedProducts(): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(gte(products.commissionRate, 8))
      .orderBy(desc(products.commissionRate));
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  // Reward operations
  async getAllRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  // Affiliate operations
  async getAffiliateByUserId(userId: number): Promise<Affiliate | undefined> {
    const result = await db.select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);
    return result.length ? result[0] : undefined;
  }
  
  async createAffiliate(affiliate: Omit<Affiliate, "id">): Promise<Affiliate> {
    const [newAffiliate] = await db.insert(affiliates)
      .values(affiliate)
      .returning();
    return newAffiliate;
  }
  
  async updateAffiliateEarnings(affiliateId: number, amount: number): Promise<Affiliate> {
    const [affiliate] = await db.select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);
      
    if (!affiliate) {
      throw new Error("سجل التسويق بالعمولة غير موجود");
    }
    
    const [updatedAffiliate] = await db.update(affiliates)
      .set({
        earnings: affiliate.earnings + amount,
        conversions: affiliate.conversions + 1
      })
      .where(eq(affiliates.id, affiliateId))
      .returning();
      
    return updatedAffiliate;
  }

  // Cart operations - for simplicity, we still use in-memory storage for carts
  // In a real app, you would create a cart table in the database
  private carts = new Map<number, CartItem[]>();
  
  async getCartItems(userId: number): Promise<(CartItem & Product)[]> {
    const cartItems = this.carts.get(userId) || [];
    const productItems: (CartItem & Product)[] = [];
    
    for (const item of cartItems) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }
      productItems.push({ ...product, ...item });
    }
    
    return productItems;
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
}

// Use the PostgreSQL storage by default
export const storage = new PgStorage();
