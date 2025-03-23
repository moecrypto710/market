import React, { useState, useEffect, useRef } from 'react';
import { useVR } from '@/hooks/use-vr';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIVoiceControlsProps {
  onCommand?: (command: string, params?: any) => void;
  enabled?: boolean;
  minimized?: boolean;
  currentProduct?: any;
  currentSection?: string;
  enhancedRecognition?: boolean;
  customCommands?: Array<{
    text: string;
    action: string;
    params: any;
    arabicVariations?: string[];
  }>;
}

/**
 * AI Voice Controls Component
 * 
 * This component simulates voice command recognition for the VR shopping experience.
 * In a real application, it would use the Web Speech API or a similar technology.
 */
export default function AIVoiceControls({
  onCommand,
  enabled = false,
  minimized = true,
  currentProduct,
  currentSection = 'plaza',
  enhancedRecognition = true,
  customCommands = []
}: AIVoiceControlsProps) {
  const { toast } = useToast();
  const { vrEnabled, gestureControlEnabled } = useVR();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showCommandList, setShowCommandList] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<'idle' | 'listening' | 'analyzing' | 'executing'>('idle');
  const [recognitionResults, setRecognitionResults] = useState<Array<{text: string, confidence: number}>>([]);
  
  // Base available commands
  const baseCommands = [
    { 
      text: 'انتقل إلى الملابس', 
      action: 'navigate', 
      params: { section: 'clothing' },
      arabicVariations: ['روح للملابس', 'اذهب إلى الأزياء', 'خذني للملابس']
    },
    { 
      text: 'انتقل إلى الإلكترونيات', 
      action: 'navigate', 
      params: { section: 'electronics' },
      arabicVariations: ['روح للإلكترونيات', 'اذهب إلى التقنية', 'خذني للأجهزة']
    },
    { 
      text: 'أظهر سلة التسوق', 
      action: 'showCart', 
      params: {},
      arabicVariations: ['عرض السلة', 'اعرض مشترياتي', 'افتح السلة'] 
    },
    { 
      text: 'ابحث عن حذاء', 
      action: 'search', 
      params: { query: 'حذاء' },
      arabicVariations: ['دور على حذاء', 'جد لي حذاء', 'ابحث حذاء']
    },
    { 
      text: 'تجربة المنتج', 
      action: 'tryOn', 
      params: { mode: 'product-try-on' },
      arabicVariations: ['جرب المنتج', 'عرض على جسمي', 'أريد تجربته']
    },
    { 
      text: 'أضف إلى السلة', 
      action: 'addToCart', 
      params: { },
      arabicVariations: ['ضيف للسلة', 'اشتري هذا', 'أريد شراء هذا'] 
    },
    { 
      text: 'عرض ثلاثي الأبعاد', 
      action: 'view3D', 
      params: { },
      arabicVariations: ['أرني ثلاثي الأبعاد', 'عرض المجسم', 'دوران ثلاثي'] 
    },
    { 
      text: 'تفعيل التحكم بالإيماءات', 
      action: 'toggleGestures', 
      params: { },
      arabicVariations: ['شغل الإيماءات', 'فعل التحكم اليدوي', 'استخدم الإيماءات'] 
    },
  ];
  
  // Combine base and custom commands
  const availableCommands = [...baseCommands, ...customCommands];
  
  // Add context-sensitive commands based on current section and product
  useEffect(() => {
    const contextCommands = [];
    
    // Add section-specific commands
    if (currentSection) {
      switch(currentSection) {
        case 'electronics':
          contextCommands.push({ 
            text: 'قارن المواصفات', 
            action: 'compare', 
            params: { category: 'electronics' },
            arabicVariations: ['قارن الأجهزة', 'أرني مقارنة']
          });
          break;
        case 'clothing':
          contextCommands.push({ 
            text: 'أظهر المقاسات', 
            action: 'showSizes', 
            params: { },
            arabicVariations: ['عرض المقاسات', 'ما هي المقاسات المتوفرة']
          });
          break;
      }
    }
    
    // Add product-specific commands if a product is being viewed
    if (currentProduct) {
      contextCommands.push({ 
        text: `أضف ${currentProduct.name} إلى السلة`, 
        action: 'addToCart', 
        params: { productId: currentProduct.id },
        arabicVariations: [`ضيف ${currentProduct.name} للسلة`, `أريد شراء ${currentProduct.name}`]
      });
    }
    
    // Immutable operation to avoid endless useEffect loop
    if (contextCommands.length > 0) {
      const newCommands = [...baseCommands, ...contextCommands, ...customCommands];
      // We're not updating the state to avoid a loop, but using the expanded commands locally
    }
  }, [currentSection, currentProduct, customCommands]);
  
  // Process voice commands (simulated)
  const handleStartListening = () => {
    if (!enabled || !vrEnabled) return;
    
    setIsListening(true);
    toast({
      title: 'جاري الاستماع...',
      description: 'قل أمراً مثل "انتقل إلى الملابس" أو "أظهر سلة التسوق"'
    });
    
    // Simulate processing time
    setTimeout(() => {
      // Pick a random command to simulate recognition
      const randomCommand = availableCommands[Math.floor(Math.random() * availableCommands.length)];
      setTranscript(randomCommand.text);
      
      // Process the command
      processCommand(randomCommand.text);
      
      setIsListening(false);
    }, 2000);
  };
  
  // Process the recognized command
  const processCommand = (command: string) => {
    // Add to history
    setCommandHistory(prev => [command, ...prev].slice(0, 5));
    
    // Find the matching command
    const matchedCommand = availableCommands.find(c => c.text === command);
    
    if (matchedCommand) {
      toast({
        title: 'تم تنفيذ الأمر',
        description: `تم تنفيذ: ${command}`
      });
      
      // Call the onCommand callback if provided
      if (onCommand) {
        onCommand(matchedCommand.action, matchedCommand.params);
      }
    } else {
      toast({
        title: 'لم يتم التعرف على الأمر',
        description: 'حاول مرة أخرى بأمر مختلف',
        variant: 'destructive'
      });
    }
  };
  
  // Manually execute a command (for testing purposes)
  const executeCommand = (command: string, action: string, params: any) => {
    setTranscript(command);
    processCommand(command);
  };
  
  if (!enabled || !vrEnabled) return null;
  
  return (
    <div className={`fixed ${minimized ? 'bottom-20 left-4' : 'bottom-24 left-4'} z-40 transition-all duration-300`}>
      {/* Main control button */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full w-12 h-12 shadow-glow futuristic-border ${isListening ? 'animate-pulse bg-red-500/20' : 'bg-black/80'}`}
          onClick={handleStartListening}
          disabled={isListening}
        >
          <i className={`fas ${isListening ? 'fa-microphone-alt text-red-500' : 'fa-microphone text-purple-400'} text-xl`}></i>
        </Button>
        
        {/* Pulse animation when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping"></div>
        )}
      </div>
      
      {/* Command display (only shown when not minimized) */}
      {!minimized && (
        <div className="mt-2 glass-effect p-3 rounded-lg text-white text-sm max-w-[300px] border futuristic-border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold neon-text">التحكم الصوتي</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setShowCommandList(!showCommandList)}
            >
              <i className={`fas ${showCommandList ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
            </Button>
          </div>
          
          {transcript && (
            <div className="mb-2 p-2 bg-purple-500/10 rounded border border-purple-500/30">
              <p className="text-sm text-center">{transcript}</p>
            </div>
          )}
          
          {/* Available commands */}
          {showCommandList && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold mb-2 text-purple-300">الأوامر المتاحة:</h5>
              <div className="grid grid-cols-2 gap-1">
                {availableCommands.map((cmd, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    size="sm"
                    className="text-xs h-7 justify-start hover:bg-purple-500/20"
                    onClick={() => executeCommand(cmd.text, cmd.action, cmd.params)}
                  >
                    {cmd.text}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Command history */}
          {commandHistory.length > 0 && !showCommandList && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold mb-1 text-purple-300">آخر الأوامر:</h5>
              <div className="space-y-1">
                {commandHistory.map((cmd, i) => (
                  <p key={i} className="text-xs text-white/70">{cmd}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}