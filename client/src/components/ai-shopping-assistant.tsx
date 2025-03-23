import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AiShoppingAssistantProps {
  currentSection: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  onNavigate: (section: string) => void;
  avatar?: {
    name: string;
    favoriteCategory: string;
  };
  minimized?: boolean;
  enhancedAI?: boolean; // Enable more advanced AI features
  userPreferences?: {
    favoriteColors?: string[];
    favoriteStyles?: string[];
    recentSearches?: string[];
    priceRange?: {min: number; max: number};
    size?: string;
  };
}

export default function AiShoppingAssistant({
  currentSection,
  products,
  onProductSelect,
  onNavigate,
  avatar,
  minimized = false,
  enhancedAI = true,
  userPreferences,
}: AiShoppingAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [messages, setMessages] = useState<Array<{content: string; sender: 'ai' | 'user'}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{text: string; action: () => void}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Simulated AI responses
  const aiResponses = {
    greeting: (name?: string) => `مرحباً${name ? ' ' + name : ''}! أنا مساعد التسوق الذكي. كيف يمكنني مساعدتك اليوم؟`,
    sectionInfo: {
      entrance: 'أنت الآن في المدخل الرئيسي للمول. يمكنك التوجه إلى أقسام الإلكترونيات، الأزياء، أو المطاعم.',
      electronics: 'قسم الإلكترونيات يقدم أحدث المنتجات التقنية والأجهزة الذكية. هل تبحث عن منتج محدد؟',
      clothing: 'قسم الأزياء يعرض أحدث صيحات الموضة من أشهر الماركات العالمية. هل تريد مساعدة في اختيار الملابس؟',
      food: 'منطقة المطاعم تضم مجموعة متنوعة من المأكولات العالمية والعربية. ماذا تفضل أن تتناول؟',
      plaza: 'الساحة المركزية هي نقطة التقاء جميع أقسام المول. إلى أين ترغب بالذهاب؟'
    },
    productSuggestion: 'بناءً على اهتماماتك، قد تحب هذه المنتجات:',
    navigationHelp: 'استخدم أزرار الأسهم للتنقل في المول الافتراضي. ↑↓←→',
    featureExplanation: 'يمكنك عرض المنتجات بتقنية ثلاثية الأبعاد والتفاعل معها كأنها أمامك.',
    notUnderstand: 'عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته بطريقة أخرى؟'
  };
  
  // Initialize with greeting
  useEffect(() => {
    const welcomeMessage = {
      content: aiResponses.greeting(avatar?.name),
      sender: 'ai' as const
    };
    
    setTimeout(() => {
      setMessages([welcomeMessage]);
      
      // Add section info after greeting
      setTimeout(() => {
        addAiMessage(aiResponses.sectionInfo[currentSection as keyof typeof aiResponses.sectionInfo] || 
                    aiResponses.sectionInfo.plaza);
                    
        generateSuggestions();
      }, 1000);
    }, 500);
  }, []);
  
  // Update when section changes
  useEffect(() => {
    if (messages.length > 0) {
      addAiMessage(`أنت الآن في ${getSectionName(currentSection)}.`);
      addAiMessage(aiResponses.sectionInfo[currentSection as keyof typeof aiResponses.sectionInfo] || 
                  aiResponses.sectionInfo.plaza);
      generateSuggestions();
    }
  }, [currentSection]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Helper function to add AI messages with typing effect
  const addAiMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { content, sender: 'ai' }]);
      setIsTyping(false);
    }, 800);
  };
  
  // Helper to get Arabic section name
  const getSectionName = (section: string): string => {
    switch (section) {
      case 'entrance': return 'المدخل الرئيسي';
      case 'electronics': return 'قسم الإلكترونيات';
      case 'clothing': return 'قسم الأزياء';
      case 'food': return 'منطقة المطاعم';
      case 'plaza': return 'الساحة المركزية';
      default: return 'المول';
    }
  };
  
  // Generate contextual suggestions based on current section and avatar preferences
  const generateSuggestions = () => {
    const newSuggestions = [];
    
    // Section specific suggestions
    if (currentSection === 'entrance') {
      if (avatar?.favoriteCategory === 'electronics') {
        newSuggestions.push({
          text: 'اذهب إلى قسم الإلكترونيات',
          action: () => onNavigate('electronics')
        });
      } else if (avatar?.favoriteCategory === 'clothing') {
        newSuggestions.push({
          text: 'اذهب إلى قسم الأزياء',
          action: () => onNavigate('clothing')
        });
      }
    }
    
    // Add product suggestions
    const sectionProducts = products.filter(p => {
      if (currentSection === 'electronics') return p.category === 'electronics';
      if (currentSection === 'clothing') return p.category === 'clothing';
      return p.featured === true; // Default to featured products in other sections
    }).slice(0, 2);
    
    sectionProducts.forEach(product => {
      newSuggestions.push({
        text: `عرض ${product.name}`,
        action: () => {
          onProductSelect(product);
          addUserMessage(`أريد معرفة المزيد عن ${product.name}`);
        }
      });
    });
    
    // Add general help suggestions
    newSuggestions.push({
      text: 'كيف أتنقل في المول؟',
      action: () => {
        addUserMessage('كيف أتنقل في المول؟');
        addAiMessage(aiResponses.navigationHelp);
      }
    });
    
    newSuggestions.push({
      text: 'ما هي مميزات التسوق الافتراضي؟',
      action: () => {
        addUserMessage('ما هي مميزات التسوق الافتراضي؟');
        addAiMessage(aiResponses.featureExplanation);
      }
    });
    
    setSuggestions(newSuggestions);
  };
  
  // Handle user input
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    setInputValue('');
    
    // Simulate AI response based on user input
    processUserMessage(inputValue);
  };
  
  // Add user message
  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { content, sender: 'user' }]);
  };
  
  // Process user message and respond accordingly
  const processUserMessage = (message: string) => {
    const msg = message.trim().toLowerCase();
    
    // Simple pattern matching to determine intent
    if (msg.includes('منتج') || msg.includes('عرض') || msg.includes('اشتري')) {
      // Product query intent
      const matchingProduct = products.find(p => 
        msg.includes(p.name.toLowerCase()) || 
        p.description.toLowerCase().split(' ').some(word => msg.includes(word))
      );
      
      if (matchingProduct) {
        addAiMessage(`وجدت ${matchingProduct.name}! إليك المزيد من المعلومات.`);
        setTimeout(() => onProductSelect(matchingProduct), 500);
      } else {
        addAiMessage('لم أتمكن من العثور على هذا المنتج. هل يمكنك توضيح ما تبحث عنه؟');
        // Suggest other products
        addAiMessage(aiResponses.productSuggestion);
        
        const sectionProducts = products
          .filter(p => currentSection === p.category || p.featured === true)
          .slice(0, 2);
          
        sectionProducts.forEach(product => {
          addAiMessage(`• ${product.name}: ${product.price} ج.م`);
        });
      }
    } else if (msg.includes('قسم') || msg.includes('اذهب') || msg.includes('توجه')) {
      // Navigation intent
      let targetSection = '';
      
      if (msg.includes('إلكترونيات')) targetSection = 'electronics';
      else if (msg.includes('أزياء') || msg.includes('ملابس')) targetSection = 'clothing';
      else if (msg.includes('مطعم') || msg.includes('أكل') || msg.includes('طعام')) targetSection = 'food';
      else if (msg.includes('مدخل')) targetSection = 'entrance';
      else if (msg.includes('ساحة') || msg.includes('مركز')) targetSection = 'plaza';
      
      if (targetSection) {
        addAiMessage(`سأساعدك في الوصول إلى ${getSectionName(targetSection)}.`);
        setTimeout(() => onNavigate(targetSection), 1000);
      } else {
        addAiMessage('إلى أي قسم ترغب بالذهاب؟ لدينا الإلكترونيات، الأزياء، المطاعم، أو الساحة المركزية.');
      }
    } else if (msg.includes('مساعدة') || msg.includes('تنقل') || msg.includes('كيف')) {
      // Help intent
      addAiMessage(aiResponses.navigationHelp);
      addAiMessage('يمكنك أيضاً التفاعل مع المنتجات وعرضها بشكل ثلاثي الأبعاد، وإضافتها إلى سلة التسوق.');
    } else {
      // Fallback
      addAiMessage(aiResponses.notUnderstand);
      generateSuggestions();
    }
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    
    toast({
      title: isMinimized ? "تم فتح المساعد الذكي" : "تم تصغير المساعد الذكي",
      description: isMinimized ? "يمكنك الآن التفاعل مع المساعد الافتراضي" : "انقر مرة أخرى لفتح المساعد",
    });
  };
  
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-[55] cursor-pointer"
        onClick={toggleMinimized}
      >
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative">
          <i className="fas fa-robot text-white"></i>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-black/70 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl z-[55] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
            <i className="fas fa-robot text-white"></i>
          </div>
          <h3 className="font-bold text-white">المساعد الذكي</h3>
        </div>
        <div className="flex gap-2">
          <button 
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
            onClick={toggleMinimized}
          >
            <i className="fas fa-minus text-white/80 text-xs"></i>
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ direction: 'rtl' }}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white/10 text-white rounded-bl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-2 rounded-lg text-white rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2 border-t border-white/10 flex gap-2 overflow-x-auto" style={{ direction: 'rtl' }}>
          {suggestions.map((suggestion, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="whitespace-nowrap text-xs h-auto py-1"
              onClick={suggestion.action}
            >
              {suggestion.text}
            </Button>
          ))}
        </div>
      )}
      
      {/* Input area */}
      <form onSubmit={handleInputSubmit} className="p-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="اكتب رسالتك هنا..."
          style={{ direction: 'rtl' }}
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <i className="fas fa-paper-plane"></i>
        </Button>
      </form>
    </div>
  );
}