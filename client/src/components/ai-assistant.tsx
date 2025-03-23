import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(!minimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined responses for common questions
  const responses = {
    productRecommendation: "بناءً على اهتماماتك وتفضيلاتك، أقترح عليك تجربة منتجاتنا الجديدة في قسم الإلكترونيات. هناك عروض خاصة هذا الأسبوع على الساعات الذكية والسماعات اللاسلكية.",
    shippingInfo: "يتم الشحن خلال 2-3 أيام عمل داخل القاهرة والإسكندرية، و4-7 أيام للمحافظات الأخرى. الشحن مجاني للطلبات التي تزيد قيمتها عن 500 ج.م.",
    returnPolicy: "يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام إذا كان به عيب مصنعي أو لم يطابق المواصفات المذكورة. يرجى الاحتفاظ بالفاتورة وعبوة المنتج الأصلية.",
    paymentMethods: "نقبل الدفع عند الاستلام، بطاقات الائتمان (فيزا وماستركارد)، محافظ إلكترونية (فودافون كاش، فوري)، والتحويل البنكي.",
    accountHelp: "يمكنك إدارة حسابك من خلال صفحة الحساب الشخصي. هناك يمكنك تحديث بياناتك، ومتابعة طلباتك السابقة، وإدارة العناوين المحفوظة، وتغيير كلمة المرور.",
    partnershipInfo: "برنامج الشراكة يتيح لك الحصول على عمولة عن كل عملية بيع تتم من خلال رابط الإحالة الخاص بك. يمكنك التسجيل في البرنامج من صفحة الشراكة وبدء كسب العمولات.",
    vrExperience: "تجربة الواقع الافتراضي تتيح لك استكشاف منتجاتنا بطريقة تفاعلية ثلاثية الأبعاد. يمكنك تجربة المنتجات افتراضياً قبل الشراء. انتقل إلى قسم 'التسوق بتقنية VR' لبدء التجربة.",
    greeting: (name?: string) => `أهلاً ${name || "بك"}! كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن المنتجات، الشحن، سياسة الإرجاع، أو أي استفسار آخر.`,
    fallback: "شكراً على سؤالك. سأقوم بتوجيه استفسارك إلى فريق خدمة العملاء وسيتواصلون معك قريباً. هل يمكنني مساعدتك في شيء آخر؟",
  };

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

  // Handle initial question with special logic based on context
  const handleInitialQuestion = (question: string) => {
    setIsTyping(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      let responseContent = "";
      
      // Smart context-aware response based on question and viewed products
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
          
          responseContent = `لاحظت اهتمامك بمنتجات ${categoryNames}. أوصي بالاطلاع على أحدث منتجاتنا في هذه الفئات. هناك عروض خاصة هذا الأسبوع على المنتجات الجديدة.`;
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
        responseContent = responses.vrExperience;
      }
      else {
        responseContent = responses.fallback;
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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

  if (!isOpen) {
    // Minimized state - just show the chat button
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 p-0 bg-[#5e35b1] hover:bg-[#4527a0] shadow-lg z-40"
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-comment-dots text-2xl"></i>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96">
      <Card className="shadow-xl border-[#5e35b1]/20">
        <div className="bg-[#5e35b1] text-white p-3 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h3 className="font-bold">المساعد الذكي</h3>
              <div className="text-xs flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                متصل
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-minus text-xs"></i>
          </Button>
        </div>
        
        {/* Messages area */}
        <CardContent className="p-0">
          <div className="h-80 overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-[#5e35b1] text-white rounded-tr-none" 
                      : "bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-[10px] mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
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
              className="bg-[#5e35b1] hover:bg-[#4527a0]"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}