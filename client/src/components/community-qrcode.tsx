import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "../hooks/use-toast";

interface CommunityQRCodeProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  buttonText?: string;
  showIcons?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  purchased?: boolean;
  productId?: number;
}

export default function CommunityQRCode({
  whatsappUrl = "https://chat.whatsapp.com/yourgroup",
  telegramUrl = "https://t.me/yourchannel",
  buttonText = "انضم إلى مجتمعنا",
  showIcons = true,
  buttonVariant = "default",
  buttonSize = "default",
  purchased = false,
  productId
}: CommunityQRCodeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Simulate purchase check - in a real app, this would check with an API
  const handleAccessAttempt = () => {
    if (purchased) {
      setIsDialogOpen(true);
    } else {
      toast({
        title: "مجتمع حصري للعملاء",
        description: "يرجى شراء هذا المنتج للوصول إلى مجتمعنا الحصري والحصول على عروض خاصة ودعم متميز.",
        variant: "destructive",
      });
      
      // Simulate purchase prompt
      setTimeout(() => {
        toast({
          title: "كيف يمكنني الانضمام؟",
          description: "اضغط على 'إضافة للسلة' واتمم عملية الشراء للانضمام إلى مجتمعنا الحصري.",
        });
      }, 1500);
    }
  };
  
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className="rtl gap-2 w-full" 
          onClick={handleAccessAttempt}
        >
          {showIcons && <i className="fas fa-users mr-1"></i>}
          {buttonText}
          {!purchased && <i className="fas fa-lock ml-2 text-xs"></i>}
        </Button>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              انضم إلينا على منصات التواصل
              {purchased && <span className="text-green-500 block text-sm mt-1">
                <i className="fas fa-check-circle mr-1"></i> 
                عميل مميز
              </span>}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <Tabs defaultValue="whatsapp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="whatsapp">
                  <i className="fab fa-whatsapp mr-2"></i>
                  واتساب
                </TabsTrigger>
                <TabsTrigger value="telegram">
                  <i className="fab fa-telegram mr-2"></i>
                  تليجرام
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="whatsapp" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">مجموعة واتساب</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <QRCodeSVG
                        value={whatsappUrl}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#075e54"}
                        level={"L"}
                        includeMargin={false}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <p className="text-center text-sm">امسح رمز الاستجابة السريعة للانضمام إلى مجموعة الواتساب</p>
                    <Button variant="outline" className="w-full" onClick={() => window.open(whatsappUrl, '_blank')}>
                      <i className="fab fa-whatsapp mr-2"></i>
                      انضم مباشرة
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="telegram" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">قناة تليجرام</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <QRCodeSVG
                        value={telegramUrl}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#0088cc"}
                        level={"L"}
                        includeMargin={false}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <p className="text-center text-sm">امسح رمز الاستجابة السريعة للانضمام إلى قناة التلغرام</p>
                    <Button variant="outline" className="w-full" onClick={() => window.open(telegramUrl, '_blank')}>
                      <i className="fab fa-telegram mr-2"></i>
                      انضم مباشرة
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>احصل على مساعدة حصرية ودعم فني متميز من مجتمعنا</p>
              <p className="mt-1">بالإضافة إلى عروض وخصومات خاصة للأعضاء</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}