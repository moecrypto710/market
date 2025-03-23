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
    <div className="flex flex-col md:flex-row min-h-screen py-10">
      <div className="w-full md:w-1/2 px-4 md:px-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Amrikyy</h1>
            <p className="text-white/70">تجربة تسوق افتراضية في عالم العرب</p>
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

      <div className="w-full md:w-1/2 px-4 py-10 md:p-10 flex items-center justify-center">
        <div className="bg-black border border-white/30 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">استمتع بتجربة تسوق فريدة</h2>
          <div className="space-y-4 text-white/80">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-black border border-white/30 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-vr-cardboard text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">تجربة واقع افتراضي</h3>
                <p className="text-sm">استكشف المنتجات في بيئة ثلاثية الأبعاد كأنك في متجر حقيقي</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-black border border-white/30 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-gift text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">مكافآت حصرية</h3>
                <p className="text-sm">اجمع النقاط واستبدلها بخصومات وهدايا مجانية</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-black border border-white/30 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-users text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">برنامج الإحالة</h3>
                <p className="text-sm">اكسب المال عند مشاركة منتجاتنا المفضلة مع أصدقائك</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-black border border-white/30 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-lock text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">دفع آمن ومتعدد</h3>
                <p className="text-sm">ادفع بأي طريقة تفضلها مع حماية كاملة لبياناتك</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}