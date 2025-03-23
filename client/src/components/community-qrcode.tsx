import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  buttonSize = "default"
}: CommunityQRCodeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize} className="rtl gap-2">
            {showIcons && <i className="fas fa-users mr-1"></i>}
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">انضم إلينا على منصات التواصل</DialogTitle>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}