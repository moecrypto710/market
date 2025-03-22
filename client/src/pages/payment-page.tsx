import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  
  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
  });
  
  const subtotal = cartItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const shipping = 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  
  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">طرق الدفع</h2>
      
      {/* Order Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold mb-3">ملخص الطلب</h3>
        
        <div className="space-y-3 mb-4">
          {cartItems?.map((item) => (
            <div key={item.id} className="flex justify-between items-center pb-2 border-b border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-md overflow-hidden ml-3">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-xs text-white/70">العدد: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold">${item.price}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 text-sm border-b border-white/20 pb-3 mb-3">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>الشحن:</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>الضريبة:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-between font-bold">
          <span>الإجمالي:</span>
          <span className="text-[#ffeb3b]">${total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold mb-4">اختر طريقة الدفع</h3>
        
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
          <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition duration-300">
            <div className="flex items-center">
              <RadioGroupItem value="credit_card" id="credit_card" className="ml-3" />
              <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                <i className="fab fa-cc-visa text-xl ml-3 text-blue-400"></i>
                <span>بطاقة ائتمان/خصم</span>
              </Label>
            </div>
            <i className="fas fa-chevron-left"></i>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition duration-300">
            <div className="flex items-center">
              <RadioGroupItem value="paypal" id="paypal" className="ml-3" />
              <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                <i className="fab fa-paypal text-xl ml-3 text-blue-500"></i>
                <span>PayPal</span>
              </Label>
            </div>
            <i className="fas fa-chevron-left"></i>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition duration-300">
            <div className="flex items-center">
              <RadioGroupItem value="apple_pay" id="apple_pay" className="ml-3" />
              <Label htmlFor="apple_pay" className="flex items-center cursor-pointer">
                <i className="fas fa-apple-pay text-xl ml-3"></i>
                <span>Apple Pay</span>
              </Label>
            </div>
            <i className="fas fa-chevron-left"></i>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition duration-300">
            <div className="flex items-center">
              <RadioGroupItem value="crypto" id="crypto" className="ml-3" />
              <Label htmlFor="crypto" className="flex items-center cursor-pointer">
                <i className="fab fa-bitcoin text-xl ml-3 text-yellow-500"></i>
                <span>العملات المشفرة</span>
              </Label>
            </div>
            <i className="fas fa-chevron-left"></i>
          </div>
        </RadioGroup>
      </div>
      
      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold mb-4">تفاصيل البطاقة</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number" className="block text-sm mb-1">رقم البطاقة</Label>
              <Input 
                id="card-number" 
                placeholder="0000 0000 0000 0000" 
                className="w-full bg-white/20 border-none text-white placeholder:text-white/50" 
              />
            </div>
            
            <div className="flex space-x-4 space-x-reverse">
              <div className="w-1/2">
                <Label htmlFor="expiry" className="block text-sm mb-1">تاريخ الانتهاء</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY" 
                  className="w-full bg-white/20 border-none text-white placeholder:text-white/50" 
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="cvv" className="block text-sm mb-1">رمز الأمان (CVV)</Label>
                <Input 
                  id="cvv" 
                  placeholder="123" 
                  className="w-full bg-white/20 border-none text-white placeholder:text-white/50" 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="name" className="block text-sm mb-1">الاسم على البطاقة</Label>
              <Input 
                id="name" 
                placeholder="الاسم الكامل" 
                className="w-full bg-white/20 border-none text-white placeholder:text-white/50" 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Checkout Button */}
      <Button className="w-full bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835] py-3 text-lg font-bold mb-4">
        إتمام الشراء
      </Button>
      
      <p className="text-center text-sm text-white/70">
        <i className="fas fa-lock ml-1"></i>
        جميع المعاملات آمنة ومشفرة
      </p>
    </div>
  );
}
