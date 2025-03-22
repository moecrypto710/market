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

// Extend the schemas with additional validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  
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
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
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
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835]"
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
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">استمتع بتجربة تسوق فريدة</h2>
          <div className="space-y-4 text-white/80">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-[#7e57c2]/50 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-vr-cardboard"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">تجربة واقع افتراضي</h3>
                <p className="text-sm">استكشف المنتجات في بيئة ثلاثية الأبعاد كأنك في متجر حقيقي</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-[#7e57c2]/50 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-gift"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">مكافآت حصرية</h3>
                <p className="text-sm">اجمع النقاط واستبدلها بخصومات وهدايا مجانية</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-[#7e57c2]/50 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-users"></i>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">برنامج الإحالة</h3>
                <p className="text-sm">اكسب المال عند مشاركة منتجاتنا المفضلة مع أصدقائك</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="bg-[#7e57c2]/50 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <i className="fas fa-lock"></i>
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
