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
    setProcessingStage('listening');
    
    // Reset recognition results
    setRecognitionResults([]);
    
    toast({
      title: 'جاري الاستماع...',
      description: 'قل أمراً مثل "انتقل إلى الملابس" أو "أظهر سلة التسوق"',
      variant: 'default',
    });
    
    // Simulate voice recognition
    // In a real app, we would use the Web Speech API here
    setTimeout(() => {
      // If current product exists, simulate the user saying something about it
      if (currentProduct && Math.random() > 0.5) {
        // Simulate asking about the current product
        const productCommand = availableCommands.find(c => 
          c.action === 'addToCart' || c.action === 'tryOn' || c.action === 'view3D'
        );
        
        if (productCommand) {
          setTranscript(productCommand.text);
          processCommand(productCommand.text);
        }
      } else {
        // Pick a random command to simulate recognition with some probability of choosing one related to current section
        let randomCommand;
        
        if (currentSection && Math.random() > 0.3) {
          // Try to find section-specific command
          const sectionCommands = availableCommands.filter(cmd => 
            (cmd.params as any)?.section === currentSection || 
            cmd.action === 'showSizes' || 
            cmd.action === 'compare'
          );
          
          if (sectionCommands.length > 0) {
            randomCommand = sectionCommands[Math.floor(Math.random() * sectionCommands.length)];
          }
        }
        
        // Fallback to any command if no section-specific command was found
        if (!randomCommand) {
          randomCommand = availableCommands[Math.floor(Math.random() * availableCommands.length)];
        }
        
        // Simulate recognizing either the main command text or one of its variations (more realistic)
        const useVariation = enhancedRecognition && randomCommand.arabicVariations && Math.random() > 0.5;
        const recognizedText = useVariation 
          ? randomCommand.arabicVariations![Math.floor(Math.random() * randomCommand.arabicVariations!.length)]
          : randomCommand.text;
        
        setTranscript(recognizedText);
        processCommand(recognizedText);
      }
      
      setIsListening(false);
    }, 2000);
  };
  
  // Find command by text or variation (enhanced pattern matching)
  const findMatchingCommand = (input: string) => {
    const normalizedInput = input.trim().toLowerCase();
    
    // First try exact match
    let matchedCommand = availableCommands.find(c => 
      c.text.toLowerCase() === normalizedInput
    );
    
    // If no exact match, try variations if enhancedRecognition is enabled
    if (!matchedCommand && enhancedRecognition) {
      matchedCommand = availableCommands.find(c => 
        // Check if any Arabic variation matches
        c.arabicVariations?.some(variation => variation.toLowerCase() === normalizedInput)
      );
      
      // If still no match, try fuzzy matching (more advanced)
      if (!matchedCommand) {
        // Check for partial matches that contain at least 70% of the words
        matchedCommand = availableCommands.find(c => {
          // Check main text
          const mainTextWords = c.text.toLowerCase().split(' ');
          const inputWords = normalizedInput.split(' ');
          
          // Count how many words from command text appear in input
          const matchedWords = mainTextWords.filter(word => 
            inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
          );
          
          // If more than 70% of words match, consider it a match
          if (matchedWords.length / mainTextWords.length >= 0.7) {
            return true;
          }
          
          // Also check variations with the same logic
          if (c.arabicVariations) {
            return c.arabicVariations.some(variation => {
              const variationWords = variation.toLowerCase().split(' ');
              const matchedVariationWords = variationWords.filter(word => 
                inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
              );
              return matchedVariationWords.length / variationWords.length >= 0.7;
            });
          }
          
          return false;
        });
      }
    }
    
    return matchedCommand;
  };
  
  // Process the recognized command
  const processCommand = (command: string) => {
    // Add to history
    setCommandHistory(prev => [command, ...prev].slice(0, 5));
    
    // Show analyzing state
    setProcessingStage('analyzing');
    
    // Simulate voice processing delay
    setTimeout(() => {
      // Find the matching command using enhanced pattern matching
      const matchedCommand = findMatchingCommand(command);
      
      if (matchedCommand) {
        // Set confidence level (simulated)
        const confidence = Math.random() * 0.3 + 0.7; // Random between 0.7 and 1.0
        setConfidenceLevel(confidence);
        
        setProcessingStage('executing');
        toast({
          title: 'تم تنفيذ الأمر',
          description: `تم تنفيذ: ${matchedCommand.text} (${Math.round(confidence * 100)}% دقة)`,
          variant: 'default'
        });
        
        // Call the onCommand callback if provided
        if (onCommand) {
          onCommand(matchedCommand.action, matchedCommand.params);
        }
      } else {
        setConfidenceLevel(0);
        toast({
          title: 'لم يتم التعرف على الأمر',
          description: 'حاول مرة أخرى بأمر مختلف',
          variant: 'destructive'
        });
      }
      
      // Reset processing stage
      setTimeout(() => {
        setProcessingStage('idle');
      }, 1000);
    }, 800);
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
          className={`rounded-full w-12 h-12 shadow-glow futuristic-border ${isListening ? 'animate-pulse bg-pink-500/20' : 'bg-black/80'}`}
          onClick={handleStartListening}
          disabled={isListening}
        >
          <i className={`fas ${isListening ? 'fa-microphone-alt text-pink-500' : 'fa-microphone text-pink-400'} text-xl`}></i>
        </Button>
        
        {/* Pulse animation when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-pink-500/50 animate-ping"></div>
        )}
      </div>
      
      {/* Command display (only shown when not minimized) */}
      {!minimized && (
        <div className="mt-2 bg-black/70 backdrop-blur-lg p-3 rounded-lg text-white text-sm max-w-[300px] border border-pink-500/20 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-pink-400">التحكم الصوتي</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-pink-500/20"
              onClick={() => setShowCommandList(!showCommandList)}
            >
              <i className={`fas ${showCommandList ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-pink-400`}></i>
            </Button>
          </div>
          
          {transcript && (
            <div className="mb-2 p-2 bg-pink-500/10 rounded border border-pink-500/30">
              <p className="text-sm text-center text-white">{transcript}</p>
            </div>
          )}
          
          {/* Available commands */}
          {showCommandList && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold mb-2 text-pink-300">الأوامر المتاحة:</h5>
              <div className="grid grid-cols-2 gap-1">
                {availableCommands.map((cmd, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    size="sm"
                    className="text-xs h-7 justify-start hover:bg-pink-500/20 text-white"
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
              <h5 className="text-xs font-semibold mb-1 text-pink-300">آخر الأوامر:</h5>
              <div className="space-y-1">
                {commandHistory.map((cmd, i) => (
                  <p key={i} className="text-xs text-white/70">{cmd}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Processing visualization (only shown when in processing stage) */}
          {processingStage === 'analyzing' && (
            <div className="mt-2 p-2 bg-pink-950/30 rounded border border-pink-500/20">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping mr-1" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping mr-1" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
              </div>
              <p className="text-xs text-center mt-1 text-pink-200">تحليل الأمر الصوتي...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}