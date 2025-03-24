import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface CulturalHeritageStoryProps {
  product: Product;
  className?: string;
  interactive?: boolean;
}

export default function CulturalHeritageStory({ 
  product, 
  className = "", 
  interactive = true 
}: CulturalHeritageStoryProps) {
  const [currentTab, setCurrentTab] = useState<string>("story");
  const [expanded, setExpanded] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean>(false);
  
  // If the product has no cultural heritage information, return null
  if (!product.culturalHeritageTitle || !product.culturalHeritageStory) {
    return null;
  }
  
  useEffect(() => {
    // Begin fade in animation 
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Generate a simple quiz question based on the cultural heritage story
  const generateQuiz = () => {
    // For simplicity, we'll just create a basic true/false question
    return {
      question: `هل ينتمي ${product.culturalHeritageTitle} إلى منطقة ${product.culturalHeritageRegion}؟`,
      correctAnswer: true,
      options: [
        { id: "true", text: "نعم", isCorrect: true },
        { id: "false", text: "لا", isCorrect: false },
      ]
    };
  };
  
  const quiz = generateQuiz();
  
  const handleAnswerClick = (isCorrect: boolean) => {
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
  };
  
  // Split the story into paragraphs for better readability
  const storyParagraphs = product.culturalHeritageStory.split('. ').map(p => p.trim() + '.').filter(p => p.length > 2);
  
  // Handle animation steps for interactive mode
  const advanceAnimationStep = () => {
    if (animationStep < storyParagraphs.length - 1) {
      setAnimationStep(animationStep + 1);
    } else {
      setAnimationStep(0);
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-500 ${expanded ? 'border-fuchsia-400' : 'border-muted-foreground/20'} ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: fadeIn ? 1 : 0, y: fadeIn ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Header with arabesque pattern overlay */}
        <div 
          className="relative p-4 bg-gradient-to-r from-fuchsia-900/80 to-purple-800/80 text-white arabesque-pattern overflow-hidden"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="absolute inset-0 arabesque-pattern opacity-10 mix-blend-overlay"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold">{product.culturalHeritageTitle}</h3>
              <p className="text-xs text-white/70">{product.culturalHeritagePeriod} | {product.culturalHeritageRegion}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            </Button>
          </div>
        </div>
        
        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="story" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <div className="px-4 pt-2">
                  <TabsList className="w-full bg-muted/50">
                    <TabsTrigger value="story" className="flex-1">
                      <i className="fas fa-book-open mr-2 text-fuchsia-500"></i>
                      القصة
                    </TabsTrigger>
                    <TabsTrigger value="interactive" className="flex-1">
                      <i className="fas fa-hand-pointer mr-2 text-fuchsia-500"></i>
                      تفاعلي
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex-1">
                      <i className="fas fa-question-circle mr-2 text-fuchsia-500"></i>
                      اختبر معلوماتك
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="story" className="pb-4 px-4">
                  <div className="aspect-video relative overflow-hidden rounded-md my-3">
                    {product.culturalHeritageImageUrl ? (
                      <img 
                        src={product.culturalHeritageImageUrl} 
                        alt={product.culturalHeritageTitle} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">لا توجد صورة</span>
                      </div>
                    )}
                    
                    {/* Decorative overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-arabic">{product.culturalHeritageTitle}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm space-y-2 font-arabic">
                    {storyParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/20 text-fuchsia-800 dark:text-fuchsia-300 rounded-full text-xs">
                      {product.culturalHeritageRegion}
                    </div>
                    <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                      {product.culturalHeritagePeriod}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="interactive" className="pb-4 px-4">
                  <div className="perspective-3d min-h-[300px] w-full relative overflow-hidden rounded-lg bg-gradient-to-b from-fuchsia-950 to-purple-900 my-3">
                    {/* Interactive 3D-like background */}
                    <div className="absolute inset-0 circuit-overlay opacity-20"></div>
                    <div className="absolute inset-0 arabesque-pattern opacity-10"></div>
                    <div className="absolute inset-0" style={{ 
                      backgroundImage: 'linear-gradient(transparent 0%, transparent calc(100% - 1px), rgba(217, 70, 239, 0.1) 100%), linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), rgba(217, 70, 239, 0.1) 100%)',
                      backgroundSize: '40px 40px',
                      transform: 'perspective(1000px) rotateX(60deg)',
                      transformOrigin: 'center bottom',
                      animation: 'pulse 10s infinite alternate'
                    }}></div>
                    
                    {/* Floating story elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="max-w-md text-center p-6">
                        <motion.div
                          key={animationStep}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.5 }}
                          className="text-white font-arabic"
                        >
                          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-200">
                            {product.culturalHeritageTitle}
                          </h3>
                          <p className="text-white/90 mb-6">
                            {storyParagraphs[animationStep]}
                          </p>
                          <div className="flex justify-center">
                            <Button 
                              variant="outline" 
                              className="border-fuchsia-500 text-fuchsia-100 hover:bg-fuchsia-500/20"
                              onClick={advanceAnimationStep}
                            >
                              <i className="fas fa-arrow-circle-right ml-2"></i>
                              {animationStep < storyParagraphs.length - 1 ? 'التالي' : 'البداية'}
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-fuchsia-300 rounded-full animate-float1"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-float2"></div>
                      <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-fuchsia-200 rounded-full animate-float3"></div>
                      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-200 rounded-full animate-float1"></div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-sm text-muted-foreground">تفاعل مع القصة باستخدام الأزرار للانتقال بين أجزائها</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="quiz" className="pb-4 px-4">
                  <div className="my-3 p-4 rounded-lg bg-muted/50 text-center">
                    {!quizStarted ? (
                      <div className="py-6">
                        <h3 className="text-lg font-bold mb-2">اختبر معلوماتك</h3>
                        <p className="text-sm text-muted-foreground mb-4">أجب على بعض الأسئلة حول {product.culturalHeritageTitle} واكتشف ما تعرفه!</p>
                        <Button 
                          className="bg-gradient-to-r from-fuchsia-600 to-purple-600"
                          onClick={() => setQuizStarted(true)}
                        >
                          <i className="fas fa-play-circle mr-2"></i>
                          ابدأ الاختبار
                        </Button>
                      </div>
                    ) : !quizAnswered ? (
                      <div className="py-4">
                        <h3 className="text-lg font-bold mb-4">{quiz.question}</h3>
                        <div className="flex flex-col md:flex-row gap-2 justify-center">
                          {quiz.options.map((option) => (
                            <Button
                              key={option.id}
                              variant="outline"
                              className="min-w-[100px]"
                              onClick={() => handleAnswerClick(option.isCorrect)}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className={`mb-4 text-center ${quizCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          <i className={`fas fa-${quizCorrect ? 'check-circle' : 'times-circle'} text-4xl`}></i>
                          <h3 className="text-lg font-bold mt-2">
                            {quizCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {quizCorrect 
                              ? 'أحسنت! لديك معرفة جيدة بالتراث الثقافي.' 
                              : `الإجابة الصحيحة هي: نعم، ${product.culturalHeritageTitle} ينتمي إلى منطقة ${product.culturalHeritageRegion}.`
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQuizAnswered(false);
                            setQuizStarted(false);
                          }}
                        >
                          <i className="fas fa-redo-alt mr-2"></i>
                          حاول مرة أخرى
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <Separator className="my-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      تعلم المزيد عن التراث الثقافي العربي من خلال استكشاف المزيد من المنتجات
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}