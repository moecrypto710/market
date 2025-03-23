import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isProductAnalysis?: boolean;
  productData?: {
    name: string;
    image?: string;
    recommendation?: string;
    similarProducts?: string[];
    price?: number;
  };
}

interface AIAssistantProps {
  initialQuestion?: string;
  viewedProducts?: Product[];
  minimized?: boolean;
}

export default function AIAssistant({ 
  initialQuestion, 
  viewedProducts = [],
  minimized = false,
}: AIAssistantProps) {
  const { user } = useAuth();
  const { vrEnabled, toggleVR, isVRSupported } = useVR();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(!minimized);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiMode, setAiMode] = useState<'normal' | 'advanced'>('normal');

  // Enhanced responses with more detailed information
  const responses = {
    productRecommendation: "بناءً على اهتماماتك وتفضيلاتك، إليك بعض المنتجات التي أوصي بها خصيصًا لك:\n\n1. جلابية مصرية تقليدية - أناقة تقليدية مع راحة فائقة\n2. عباية مطرزة - تصميم عصري مع لمسات تراثية\n3. قفطان مغربي فاخر - خيار مثالي للمناسبات الخاصة",
    shippingInfo: "معلومات الشحن:\n\n• القاهرة والإسكندرية: 2-3 أيام عمل\n• المحافظات الأخرى: 4-7 أيام عمل\n• الشحن مجاني للطلبات التي تزيد قيمتها عن 500 ج.م\n• يمكنك تتبع شحنتك عبر صفحة 'طلباتي' في حسابك الشخصي",
    returnPolicy: "سياسة الإرجاع والاستبدال:\n\n• يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام\n• يجب أن يكون المنتج في حالته الأصلية وبدون استخدام\n• يرجى الاحتفاظ بالفاتورة وعبوة المنتج الأصلية\n• يمكنك طلب استرداد المبلغ أو استبدال المنتج",
    paymentMethods: "طرق الدفع المتاحة:\n\n• الدفع عند الاستلام\n• بطاقات الائتمان (فيزا وماستركارد)\n• محافظ إلكترونية (فودافون كاش، فوري)\n• التحويل البنكي\n• التقسيط على 6 شهور بدون فوائد للطلبات فوق 1000 ج.م",
    accountHelp: "إدارة حسابك الشخصي:\n\n• تحديث البيانات الشخصية\n• متابعة الطلبات السابقة والحالية\n• إدارة العناوين المحفوظة\n• تغيير كلمة المرور\n• إعدادات الخصوصية والإشعارات",
    partnershipInfo: "برنامج الشراكة والتسويق بالعمولة:\n\n• احصل على عمولة 10% على كل عملية بيع تتم من خلال رابط الإحالة الخاص بك\n• برامج خاصة للمؤثرين ومشاهير السوشيال ميديا\n• دعم تسويقي مجاني ومواد ترويجية جاهزة\n• سحب العمولات مرتين شهرياً عبر حسابك البنكي أو المحفظة الإلكترونية",
    vrExperience: "تجربة الواقع الافتراضي المتطورة:\n\n• استكشف متجرنا الافتراضي ثلاثي الأبعاد\n• جرب المنتجات افتراضياً قبل الشراء\n• شاهد تفاصيل المنتجات بدقة عالية\n• تجربة تسوق تفاعلية فريدة مع إمكانية التنقل بين الأقسام المختلفة\n• مشاركة تجربتك مع الأصدقاء",
    vrFeaturesInfo: "مميزات الواقع الافتراضي الجديدة:\n\n• التحكم بالإيماءات - استخدم يديك للتفاعل مع المنتجات\n• قياسات دقيقة - جرب المقاسات بشكل افتراضي\n• مؤثرات صوتية محيطة - لتجربة غامرة\n• متاجر العلامات التجارية - زيارة أجنحة خاصة لكل علامة\n• عروض أزياء افتراضية - شاهد المنتجات على عارضين افتراضيين",
    productAnalysis: (productName: string) => `تحليل المنتج: ${productName}\n\n• جودة عالية مع خامات ممتازة\n• تصميم يجمع بين الأصالة والمعاصرة\n• مناسب للمناسبات المختلفة\n• متوفر بألوان وأحجام متعددة\n• يحظى بتقييمات إيجابية (4.8/5) من أكثر من 120 مشترٍ`,
    greeting: (name?: string) => `أهلاً ${name || "بك"}! أنا فريد، مساعدك الذكي للتسوق. كيف يمكنني مساعدتك اليوم؟ يمكنني:\n\n• تقديم توصيات مخصصة للمنتجات\n• الإجابة عن استفساراتك حول الشحن والدفع\n• مساعدتك في استخدام تجربة التسوق بالواقع الافتراضي\n• تحليل المنتجات وإعطاء معلومات مفصلة\n• تقديم مقترحات للهدايا المناسبة`,
    productInsights: "تحليل المنتجات والاتجاهات:\n\n• الجلابيات التقليدية هي الأكثر مبيعاً هذا الشهر\n• هناك زيادة في الطلب على القطع المطرزة يدوياً\n• العملاء يفضلون الخامات الطبيعية والصديقة للبيئة\n• ألوان الباستيل والظلال الترابية هي الأكثر شعبية حالياً",
    sizeRecommendation: "توصيات المقاسات الذكية:\n\nبناءً على مشترياتك السابقة ومقاساتك المحفوظة، أنصحك بمقاس (L) للجلابيات و(M) للقفاطين. للعبايات، المقاس (40) سيكون مناسباً تماماً لك.",
    giftsRecommendation: "اقتراحات هدايا مميزة:\n\n• للزوجة/الزوج: طقم عباية وبشت مطرز بتصاميم مستوحاة من التراث\n• للوالدين: جلابية فاخرة مع شال من الحرير الطبيعي\n• للأصدقاء: إكسسوارات تقليدية مصنوعة يدوياً\n• للمناسبات: هدايا مغلفة بشكل خاص مع بطاقة تهنئة شخصية",
    fallback: "شكراً على سؤالك، هذا استفسار مهم. سأقوم بجمع المعلومات الدقيقة وسأعود إليك قريباً بإجابة تفصيلية. هل هناك أي شيء آخر يمكنني مساعدتك به في الوقت الحالي؟",
  };

  // Advanced AI Features
  const aiFeatures = [
    { id: 1, name: "تحليل المنتجات", description: "تحليل مفصل لكل منتج وخصائصه", icon: "search" },
    { id: 2, name: "توصيات مخصصة", description: "اقتراحات تناسب ذوقك واهتماماتك", icon: "magic" },
    { id: 3, name: "مساعدة VR", description: "دعم في استخدام تجربة الواقع الافتراضي", icon: "vr-cardboard" },
    { id: 4, name: "خبير التسوق", description: "نصائح من خبير موضة تراثية", icon: "tshirt" }
  ];

  // Welcome message when component mounts
  useEffect(() => {
    const welcomeMessage: Message = {
      role: "assistant",
      content: responses.greeting(user?.username),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // If initial question provided, simulate user asking it
    if (initialQuestion) {
      setTimeout(() => {
        const userMessage: Message = {
          role: "user",
          content: initialQuestion,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Simulate AI response
        handleInitialQuestion(initialQuestion);
      }, 500);
    }
  }, [user?.username, initialQuestion]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle product analysis (special feature)
  const analyzeProduct = (productName: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const analysisMessage: Message = {
        role: "assistant",
        content: responses.productAnalysis(productName),
        timestamp: new Date(),
        isProductAnalysis: true,
        productData: {
          name: productName,
          recommendation: "هذا المنتج مناسب جداً لك بناءً على تفضيلاتك السابقة",
          similarProducts: ["جلابية مصرية بتطريز يدوي", "قفطان مغربي تقليدي", "عباية خليجية عصرية"],
          price: 1299
        }
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      setIsTyping(false);
    }, 2000);
  };

  // Handle initial question with enhanced contextual awareness
  const handleInitialQuestion = (question: string) => {
    setIsTyping(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      let responseContent = "";
      let isProductAnalysis = false;
      let productData = undefined;
      
      // Enhanced context-aware response based on question and viewed products
      if (question.includes("توصي") || question.includes("اقترح") || question.includes("ماذا تقترح")) {
        responseContent = responses.productRecommendation;
        
        // Personalize based on viewed products
        if (viewedProducts.length > 0) {
          const categorySet = new Set<string>();
          viewedProducts.forEach(p => categorySet.add(p.category));
          const categories = Array.from(categorySet);
          
          const categoryNames = categories.map(cat => 
            cat === 'electronics' ? 'الإلكترونيات' :
            cat === 'clothing' ? 'الملابس' :
            cat === 'home' ? 'المنزل' : 'الرياضة'
          ).join(' و');
          
          responseContent = `بناءً على اهتمامك بمنتجات ${categoryNames}، إليك بعض التوصيات المخصصة لك:\n\n`;
          
          viewedProducts.slice(0, 2).forEach((product, idx) => {
            responseContent += `${idx+1}. ${product.name} - مثالي لمناسباتك الخاصة والتقليدية\n`;
          });
          
          responseContent += `\nأيضاً، قد تجد هذه المنتجات ذات صلة باهتماماتك:\n• جلابية مصرية بتطريز يدوي\n• عباية مطرزة بأسلوب عصري\n• قفطان مغربي بألوان زاهية`;
        }
      }
      else if (question.includes("شحن") || question.includes("توصيل") || question.includes("متى يصل")) {
        responseContent = responses.shippingInfo;
      }
      else if (question.includes("إرجاع") || question.includes("استبدال") || question.includes("استرداد")) {
        responseContent = responses.returnPolicy;
      }
      else if (question.includes("دفع") || question.includes("فيزا") || question.includes("ماستر كارد")) {
        responseContent = responses.paymentMethods;
      }
      else if (question.includes("حساب") || question.includes("بيانات") || question.includes("تسجيل")) {
        responseContent = responses.accountHelp;
      }
      else if (question.includes("شراكة") || question.includes("عمولة") || question.includes("ربح")) {
        responseContent = responses.partnershipInfo;
      }
      else if (question.includes("واقع افتراضي") || question.includes("VR") || question.includes("ثلاثي الأبعاد")) {
        responseContent = isVRSupported ? responses.vrExperience : "للأسف، يبدو أن جهازك لا يدعم تقنية الواقع الافتراضي بشكل كامل. نحن نعمل على توفير تجربة بديلة. هل ترغب في مشاهدة عرض تفاعلي بالصور 360 درجة بدلاً من ذلك؟";
      }
      else if (question.includes("مقاس") || question.includes("قياس") || question.includes("حجم")) {
        responseContent = responses.sizeRecommendation;
      }
      else if (question.includes("هدية") || question.includes("هدايا") || question.includes("مناسبة")) {
        responseContent = responses.giftsRecommendation;
      }
      else if (question.includes("تحليل") || question.includes("ميزات") || question.includes("خصائص")) {
        // Product analysis mode
        if (aiMode === 'advanced') {
          const productMatch = question.match(/تحليل (.+)/) || question.match(/خصائص (.+)/) || question.match(/ميزات (.+)/);
          if (productMatch && productMatch[1]) {
            const productName = productMatch[1].trim();
            isProductAnalysis = true;
            productData = {
              name: productName,
              recommendation: "منتج ممتاز يناسب ذوقك واحتياجاتك",
              similarProducts: ["جلابية مصرية فاخرة", "قفطان مغربي أصيل", "عباية خليجية عصرية"],
              price: 1299
            };
            responseContent = responses.productAnalysis(productName);
          } else {
            responseContent = responses.productInsights;
          }
        } else {
          responseContent = "يمكنك تفعيل وضع الذكاء المتقدم للحصول على تحليلات مفصلة للمنتجات والمزايا الإضافية!";
        }
      }
      else if (question.includes("ميزات") && question.includes("VR")) {
        responseContent = responses.vrFeaturesInfo;
      }
      else {
        responseContent = responses.fallback;
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        isProductAnalysis,
        productData
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Toggle AI mode
  const toggleAIMode = () => {
    const newMode = aiMode === 'normal' ? 'advanced' : 'normal';
    setAiMode(newMode);
    
    // Add system message about mode change
    const modeMessage: Message = {
      role: "system",
      content: newMode === 'advanced' 
        ? "تم تفعيل وضع الذكاء المتقدم. يمكنك الآن الاستفادة من تحليلات المنتجات المفصلة والتوصيات الذكية!"
        : "تم العودة إلى الوضع العادي.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, modeMessage]);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Process the message and generate a response
    handleInitialQuestion(input);
  };

  // Handle keypress (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action for enabling VR mode
  const handleEnableVR = () => {
    if (!vrEnabled) {
      toggleVR();
      const systemMessage: Message = {
        role: "system",
        content: "جاري تفعيل وضع الواقع الافتراضي... ستنتقل إلى تجربة التسوق الافتراضية خلال لحظات.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      
      // Close the assistant after a delay
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }
  };

  if (!isOpen) {
    // Minimized state - just show the chat button
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 p-0 bg-[#00ffcd] hover:bg-[#00d6ae] shadow-lg z-40"
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-robot text-2xl text-black"></i>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96">
      <Card className="shadow-xl border-[#00ffcd]/20">
        <div className="bg-gradient-to-r from-[#00ffcd] to-[#ff00aa] text-black p-3 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mr-2">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h3 className="font-bold">فريد - المساعد الذكي</h3>
              <div className="text-xs flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                <span>{aiMode === 'advanced' ? 'وضع الذكاء المتقدم' : 'متصل'}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full text-white hover:bg-white/20"
              onClick={toggleAIMode}
              title={aiMode === 'normal' ? 'تفعيل الوضع المتقدم' : 'العودة للوضع العادي'}
            >
              <i className={`fas fa-${aiMode === 'normal' ? 'brain' : 'lightbulb'} text-xs`}></i>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-minus text-xs"></i>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="chat" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-none">
            <TabsTrigger value="chat">المحادثة</TabsTrigger>
            <TabsTrigger value="features">مميزات</TabsTrigger>
          </TabsList>
          
          {/* Chat Tab Content */}
          <TabsContent value="chat" className="p-0">
            {/* Messages area */}
            <div className="h-80 overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${
                    message.role === "user" 
                      ? "justify-end" 
                      : message.role === "system" 
                        ? "justify-center" 
                        : "justify-start"
                  }`}
                >
                  {message.role === "system" ? (
                    <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-center max-w-[90%]">
                      <i className="fas fa-info-circle mr-1"></i> {message.content}
                    </div>
                  ) : (
                    <div 
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.role === "user" 
                          ? "bg-gradient-to-br from-[#ff00aa] to-[#00ffcd] text-black rounded-tr-none" 
                          : "bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 rounded-tl-none"
                      }`}
                    >
                      {message.isProductAnalysis && message.productData && (
                        <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="font-bold mb-1">{message.productData.name}</div>
                          {message.productData.price && (
                            <Badge className="bg-green-600 mb-1">{message.productData.price} جنيه</Badge>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      
                      {message.isProductAnalysis && message.productData?.similarProducts && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium mb-1">منتجات مشابهة:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.productData.similarProducts.map((prod, i) => (
                              <Badge key={i} variant="outline" className="text-xs cursor-pointer" 
                                onClick={() => analyzeProduct(prod)}>
                                {prod}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className={`text-[10px] mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef}></div>
            </div>
            
            {/* Quick actions */}
            {activeTab === "chat" && (
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInput("كيف يمكنني استخدام تجربة الواقع الافتراضي؟");
                    handleSendMessage();
                  }}
                >
                  <i className="fas fa-vr-cardboard ml-1"></i> VR
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInput("ما هي طرق الدفع المتاحة؟");
                    handleSendMessage();
                  }}
                >
                  <i className="fas fa-credit-card ml-1"></i> الدفع
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInput("اقترح لي منتجات تناسبني");
                    handleSendMessage();
                  }}
                >
                  <i className="fas fa-magic ml-1"></i> توصيات
                </Button>
                
                {isVRSupported && !vrEnabled && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="text-xs h-7 bg-[#7c4dff]"
                    onClick={handleEnableVR}
                  >
                    <i className="fas fa-play ml-1"></i> بدء تجربة VR
                  </Button>
                )}
              </div>
            )}
            
            {/* Input area */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="ml-2"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                className="bg-[#7c4dff] hover:bg-[#651fff]"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </TabsContent>
          
          {/* Features Tab Content */}
          <TabsContent value="features" className="p-0">
            <div className="h-80 overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg mb-1">مميزات المساعد الذكي</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {aiMode === 'advanced' 
                    ? 'تم تفعيل وضع الذكاء المتقدم! استمتع بكافة الميزات المتطورة.' 
                    : 'فعّل وضع الذكاء المتقدم للاستفادة من كافة الميزات!'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {aiFeatures.map(feature => (
                  <Card key={feature.id} className={`border ${aiMode === 'advanced' ? 'border-[#7c4dff]/30' : 'border-gray-200'}`}>
                    <CardContent className="p-3 flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 ${aiMode === 'advanced' ? 'bg-[#7c4dff] text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <i className={`fas fa-${feature.icon}`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold">{feature.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                      {aiMode !== 'advanced' && (
                        <div className="mr-auto">
                          <Badge variant="outline" className="text-xs">
                            <i className="fas fa-lock ml-1"></i> متقدم
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-4">
                <Button 
                  className={`w-full ${aiMode === 'advanced' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600' : 'bg-[#7c4dff] hover:bg-[#651fff]'}`}
                  onClick={toggleAIMode}
                >
                  {aiMode === 'advanced' 
                    ? <><i className="fas fa-power-off ml-2"></i> إيقاف الوضع المتقدم</>
                    : <><i className="fas fa-bolt ml-2"></i> تفعيل الذكاء المتقدم</>}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}