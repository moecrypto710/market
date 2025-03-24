import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Extend the schemas with additional validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

// Add remember me field to login schema
type LoginFormValues = z.infer<typeof loginUserSchema> & { rememberMe: boolean };
type RegisterFormValues = z.infer<typeof registerSchema>;

// Sample guest account for quick login
const GUEST_ACCOUNTS = [
  { username: "زائر", password: "guest123", icon: "fas fa-user-alt", color: "bg-amber-500" },
  { username: "متسوق", password: "shop123", icon: "fas fa-shopping-bag", color: "bg-purple-500" },
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
  });

  // Check for stored credentials on component mount
  useEffect(() => {
    try {
      const storedCredentials = localStorage.getItem('amrikyy_credentials');
      if (storedCredentials) {
        const { username, password } = JSON.parse(storedCredentials);
        loginForm.setValue('username', username);
        loginForm.setValue('password', password);
        loginForm.setValue('rememberMe', true);
      }
    } catch (error) {
      console.error('Failed to load stored credentials', error);
    }
  }, [loginForm]);

  const onLoginSubmit = (data: LoginFormValues) => {
    const { rememberMe, ...credentials } = data;

    // Store credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('amrikyy_credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('amrikyy_credentials');
    }

    loginMutation.mutate(credentials);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  const handleQuickLogin = async (account: { username: string; password: string; icon?: string }) => {
    setQuickLoginLoading(true);
    
    // First show a welcome toast
    toast({
      title: "جاري تسجيل الدخول...",
      description: `أهلاً بك ${account.username}! جارٍ تحضير تجربة التسوق الافتراضية...`,
    });
    
    try {
      // Set a short delay to show the loading state and make the experience feel smoother
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Perform actual login
      await loginMutation.mutateAsync(account);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${account.username}! استمتع بتجربة التسوق الافتراضية`,
      });
    } catch (error) {
      console.error("Quick login failed:", error);
      toast({
        title: "فشل تسجيل الدخول",
        description: "حاول مرة أخرى أو جرب حساب آخر",
        variant: "destructive",
      });
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleLoginWithSocial = async (provider: string) => {
    // Here we would implement social login
    // For now, we'll just use a placeholder guest login
    setQuickLoginLoading(true);
    
    toast({
      title: "جاري تسجيل الدخول...",
      description: `جارٍ تسجيل الدخول باستخدام ${provider === 'facebook' ? 'فيسبوك' : 'جوجل'}...`,
    });
    
    try {
      // Simulate a delay for network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Default guest login since we don't have real social login yet
      await loginMutation.mutateAsync({
        username: "زائر",
        password: "guest123"
      });
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `تم تسجيل دخولك باستخدام ${provider === 'facebook' ? 'فيسبوك' : 'جوجل'}`,
      });
    } catch (error) {
      console.error("Social login failed:", error);
      toast({
        title: "فشل تسجيل الدخول",
        description: "حاول مرة أخرى أو استخدم طريقة تسجيل دخول أخرى",
        variant: "destructive",
      });
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen py-0 md:py-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 filter blur-[120px] animate-float-slow transform rotate-3"></div>
        <div className="absolute bottom-[15%] right-[10%] w-72 h-72 rounded-full bg-gradient-to-r from-fuchsia-700 to-pink-700 filter blur-[100px] animate-float-slow animation-delay-1000 transform -rotate-6"></div>
        <div className="absolute top-[40%] right-[25%] w-48 h-48 rounded-full bg-gradient-to-r from-violet-700 to-indigo-700 filter blur-[80px] animate-float-slow animation-delay-2000 transform rotate-12"></div>
        
        {/* Digital circuit pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        ></div>
        
        {/* Futuristic scanning line */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(170, 0, 255, 0.2) 50%, transparent 50.5%)',
            backgroundSize: '100% 120px',
            animation: 'scanline 6s linear infinite'
          }}
        ></div>
      </div>
      
      <div className="w-full md:w-1/2 px-4 md:px-10 flex items-center justify-center py-12 md:py-0 z-10 backdrop-blur-sm bg-black/10 md:bg-transparent">
        <div className="w-full max-w-md relative">
          {/* Logo and branding section */}
          <div className="text-center mb-10 relative">
            {/* Decorative orb */}
            <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-fuchsia-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
            
            {/* Logo animation */}
            <div className="relative mb-6 inline-block">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
              <div className="relative bg-black/60 backdrop-blur-lg px-6 py-4 rounded-lg border border-white/10">
                <h1 className="text-4xl font-bold relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">بلدة الأمريكي</span>
                  <span className="inline-block mx-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white">VR</span>
                </h1>
              </div>
            </div>
            
            <p className="text-white/70 text-lg mb-5">مدينة الأعمال الافتراضية المتكاملة</p>
            
            <div className="flex justify-center mt-4 mb-4 flex-wrap gap-2">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-sm hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500/60 transition-all duration-300">
                <i className="fas fa-vr-cardboard mr-2 text-purple-400"></i>
                <span className="text-white/90">تسوق بتقنية الواقع الافتراضي</span>
              </div>
              
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 text-sm hover:from-amber-600/40 hover:to-orange-600/40 hover:border-amber-500/60 transition-all duration-300">
                <i className="fas fa-medal mr-2 text-amber-400"></i>
                <span className="text-white/90">برنامج الولاء التفاعلي</span>
              </div>
            </div>
            
            {/* AR badge animation */}
            <div className="relative mt-5 mb-6 flex justify-center">
              <div className="relative inline-block group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-full filter blur-xl group-hover:from-amber-500/50 group-hover:to-orange-500/50 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 animate-ping-slow"></div>
                <div className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-sm border border-white/10 rounded-full shadow-xl group-hover:shadow-amber-500/20 transition-all duration-300">
                  <i className="fas fa-cube text-amber-400 group-hover:text-amber-300 transition-colors"></i>
                  <span className="text-white font-medium">احصل على مكافآت AR حصرية</span>
                  <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-full" style={{backgroundSize: '200% 100%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="bg-black border border-white/30 rounded-lg p-6">
                {/* Quick Login Options */}
                <div className="mb-6">
                  <div className="bg-black p-4 rounded-lg mb-6 border border-white/30">
                    <h3 className="text-center text-lg font-bold mb-2 text-white">دخول سريع</h3>
                    <p className="text-center text-white/70 text-sm mb-4">جرب تطبيقنا فوراً بدون تسجيل حساب جديد</p>
                    <div className="grid gap-3">
                      {GUEST_ACCOUNTS.map((account) => (
                        <Button 
                          key={account.username}
                          variant="outline" 
                          className="border-white/20 hover:bg-white hover:text-black group h-14 relative overflow-hidden"
                          onClick={() => handleQuickLogin(account)}
                          disabled={quickLoginLoading || loginMutation.isPending}
                        >
                          <div className="relative flex items-center justify-center w-full">
                            <i className={`${account.icon} mr-2 text-xl`}></i>
                            <span className="text-lg">تسوق كـ {account.username}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button 
                      variant="outline" 
                      className="border-white/20 hover:bg-white hover:text-black"
                      onClick={() => handleLoginWithSocial('facebook')}
                      disabled={quickLoginLoading || loginMutation.isPending}
                    >
                      <i className="fab fa-facebook mr-2"></i>
                      فيسبوك
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white/20 hover:bg-white hover:text-black"
                      onClick={() => handleLoginWithSocial('google')}
                      disabled={quickLoginLoading || loginMutation.isPending}
                    >
                      <i className="fab fa-google mr-2"></i>
                      جوجل
                    </Button>
                  </div>

                  <div className="relative flex items-center gap-4 py-5">
                    <div className="border-t border-white/20 flex-grow"></div>
                    <div className="text-white/50 text-sm">أو</div>
                    <div className="border-t border-white/20 flex-grow"></div>
                  </div>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ادخل اسم المستخدم" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="ادخل كلمة المرور" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rtl:space-x-reverse">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>تذكرني</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-white text-black hover:bg-white/80"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="bg-black border border-white/30 rounded-lg p-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="اختر اسم مستخدم" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ادخل اسمك الكامل" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="ادخل بريدك الإلكتروني" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="اختر كلمة مرور قوية" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="أعد كتابة كلمة المرور" 
                              className="bg-white/20 border-none text-white placeholder:text-white/50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="border-white/20 hover:bg-white hover:text-black"
                        onClick={() => handleLoginWithSocial('facebook')}
                        type="button"
                        disabled={registerMutation.isPending}
                      >
                        <i className="fab fa-facebook mr-2"></i>
                        فيسبوك
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/20 hover:bg-white hover:text-black"
                        onClick={() => handleLoginWithSocial('google')}
                        type="button"
                        disabled={registerMutation.isPending}
                      >
                        <i className="fab fa-google mr-2"></i>
                        جوجل
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-white text-black hover:bg-white/80"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="w-full md:w-1/2 px-4 py-10 md:p-10 flex items-center justify-center relative z-10">
        {/* Floating elements in the background */}
        <div className="absolute w-20 h-20 top-[15%] left-[10%] bg-purple-500/20 rounded-xl blur-lg transform rotate-12 animate-float-slow"></div>
        <div className="absolute w-12 h-12 bottom-[25%] right-[15%] bg-pink-500/20 rounded-full blur-md transform -rotate-12 animate-float-slow animation-delay-2000"></div>
        
        <div className="bg-gradient-to-br from-black/90 to-purple-950/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden transform transition duration-300 hover:shadow-purple-500/5">
          {/* Decorative corner glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-2xl"></div>
          
          {/* Shimmering effect at the top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <h2 className="text-2xl font-bold mb-8 text-white relative">
            استمتع بتجربة تسوق فريدة في
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mx-1">بلدة الأمريكي</span>
          </h2>
          
          <div className="space-y-6 text-white/80 relative z-10">
            <div className="flex items-start space-x-4 space-x-reverse group">
              <div className="bg-black/50 border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center mt-1 flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-purple-600/30 group-hover:to-fuchsia-600/30 group-hover:border-purple-500/40">
                <i className="fas fa-vr-cardboard text-purple-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">تجربة واقع افتراضي</h3>
                <p className="text-sm">استكشف المتاجر والمنتجات في بيئة ثلاثية الأبعاد كأنك في مدينة حقيقية</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse group">
              <div className="bg-black/50 border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center mt-1 flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-amber-600/30 group-hover:to-orange-600/30 group-hover:border-amber-500/40">
                <i className="fas fa-medal text-amber-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">برنامج الولاء التفاعلي</h3>
                <p className="text-sm">اجمع النقاط من خلال التسوق والتفاعل واستبدلها بمكافآت حصرية بتقنية الواقع المعزز</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse group">
              <div className="bg-black/50 border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center mt-1 flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-green-600/30 group-hover:to-emerald-600/30 group-hover:border-green-500/40">
                <i className="fas fa-users text-green-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 group-hover:text-green-300 transition-colors">برنامج الإحالة والشراكات</h3>
                <p className="text-sm">انضم كتاجر أو مؤثر وابدأ في تحقيق الأرباح من خلال منصتنا المتكاملة</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse group">
              <div className="bg-black/50 border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center mt-1 flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-600/30 group-hover:to-cyan-600/30 group-hover:border-blue-500/40">
                <i className="fas fa-lock text-blue-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">دفع آمن ومتعدد</h3>
                <p className="text-sm">استخدم أي وسيلة دفع تفضلها مع حماية كاملة لبياناتك وخصوصيتك</p>
              </div>
            </div>
          </div>
          
          {/* Town illustration */}
          <div className="mt-8 text-center">
            <div className="relative inline-block">
              <div className="w-full h-32 bg-gradient-to-b from-transparent to-black/50 absolute bottom-0 left-0 right-0 z-10 rounded-b-lg"></div>
              <div className="h-32 bg-gradient-to-b from-purple-900/30 to-black/80 rounded-lg overflow-hidden flex items-end justify-center relative">
                {/* Simplified town silhouette */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-center">
                  <div className="w-10 h-24 bg-purple-900/80 mx-1 rounded-t-lg"></div>
                  <div className="w-14 h-28 bg-indigo-900/80 mx-1 rounded-t-lg"></div>
                  <div className="w-12 h-20 bg-fuchsia-900/80 mx-1 rounded-t-lg"></div>
                  <div className="w-16 h-32 bg-purple-900/80 mx-1 rounded-t-lg"></div>
                  <div className="w-10 h-16 bg-violet-900/80 mx-1 rounded-t-lg"></div>
                </div>
                
                {/* Stars and lights */}
                <div className="absolute inset-0">
                  <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white rounded-full animate-pulse-slow"></div>
                  <div className="absolute top-[10%] left-[45%] w-1 h-1 bg-white rounded-full animate-pulse-slow animation-delay-500"></div>
                  <div className="absolute top-[15%] left-[75%] w-1 h-1 bg-white rounded-full animate-pulse-slow animation-delay-1000"></div>
                  <div className="absolute top-[30%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse-slow animation-delay-1500"></div>
                  <div className="absolute top-[25%] left-[60%] w-1 h-1 bg-white rounded-full animate-pulse-slow animation-delay-2000"></div>
                </div>
                
                <div className="relative z-20 mb-2 text-white/90 font-bold text-sm">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">اكتشف بلدة الأمريكي الآن</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}