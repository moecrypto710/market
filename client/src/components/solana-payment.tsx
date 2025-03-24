import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  initializeSolanaConnection, 
  getWalletBalance, 
  requestAirdrop, 
  generateNewWallet
} from '@/lib/solana-payments';
import * as solanaWeb3 from '@solana/web3.js';

interface SolanaPaymentProps {
  productId?: number;
  productName?: string;
  amount?: number;
  recipientWallet?: string;
  onPaymentSuccess?: (txSignature: string) => void;
  onPaymentError?: (error: Error) => void;
  className?: string;
}

export default function SolanaPayment({
  productId,
  productName = "منتج",
  amount = 0.1,
  recipientWallet = "5oQKGSYXmQ1CqNK67ACGHZnvGxEoRNYsqs1K93gGGEzn", // Demo recipient wallet
  onPaymentSuccess,
  onPaymentError,
  className = "",
}: SolanaPaymentProps) {
  const { toast } = useToast();
  
  // State for wallet
  const [wallet, setWallet] = useState<solanaWeb3.Keypair | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [signature, setSignature] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [network, setNetwork] = useState<'devnet' | 'testnet' | 'mainnet-beta'>('devnet');
  
  // Initialize Solana connection on component mount
  useEffect(() => {
    initializeSolanaConnection(network);
  }, [network]);
  
  // Create a new wallet on component mount
  useEffect(() => {
    createNewWallet();
  }, []);
  
  // Function to create a new wallet
  const createNewWallet = () => {
    try {
      const newWallet = generateNewWallet();
      setWallet(newWallet);
      
      // Update wallet balance
      fetchWalletBalance(newWallet.publicKey);
      
      toast({
        title: "تم إنشاء محفظة جديدة",
        description: `تم إنشاء محفظة برصيد 0 SOL. استخدم airdrop للحصول على رصيد تجريبي.`,
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "خطأ في إنشاء المحفظة",
        description: "حدث خطأ أثناء إنشاء المحفظة الجديدة",
        variant: "destructive",
      });
    }
  };
  
  // Function to fetch wallet balance
  const fetchWalletBalance = async (publicKey: solanaWeb3.PublicKey) => {
    if (!publicKey) return;
    
    try {
      const balance = await getWalletBalance(publicKey);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };
  
  // Function to request an airdrop of SOL
  const handleAirdropRequest = async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    try {
      const signature = await requestAirdrop(wallet.publicKey, 1); // Request 1 SOL
      
      toast({
        title: "تم استلام SOL",
        description: `تم إيداع 1 SOL في محفظتك بنجاح.`,
      });
      
      // Refresh wallet balance
      await fetchWalletBalance(wallet.publicKey);
    } catch (error) {
      console.error("Airdrop error:", error);
      toast({
        title: "فشل عملية الإيداع",
        description: "حدث خطأ أثناء طلب الإيداع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to execute payment
  const handlePayment = async () => {
    if (!wallet) {
      toast({
        title: "لا يوجد محفظة",
        description: "يرجى إنشاء محفظة أولاً قبل إجراء الدفع.",
        variant: "destructive",
      });
      return;
    }
    
    if (walletBalance < amount) {
      toast({
        title: "رصيد غير كافي",
        description: "لا يوجد رصيد كافي في المحفظة لإتمام عملية الدفع.",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentStatus('loading');
    setIsLoading(true);
    
    try {
      // Create connection manually since we're in a callback
      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl(network),
        'confirmed'
      );
      
      // Create recipient public key
      const recipientKey = new solanaWeb3.PublicKey(recipientWallet);
      
      // Create transaction
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipientKey,
          lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
        })
      );
      
      // Send and confirm transaction
      const txSignature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
      );
      
      console.log("Transaction successful!", txSignature);
      setSignature(txSignature);
      setPaymentStatus('success');
      
      toast({
        title: "تمت عملية الدفع بنجاح",
        description: `تم إرسال ${amount} SOL بنجاح. رقم العملية: ${txSignature.slice(0, 8)}...`,
      });
      
      // Call the success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(txSignature);
      }
      
      // Refresh wallet balance
      await fetchWalletBalance(wallet.publicKey);
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus('error');
      
      toast({
        title: "فشل عملية الدفع",
        description: "حدث خطأ أثناء إجراء عملية الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      
      // Call the error callback if provided
      if (onPaymentError && error instanceof Error) {
        onPaymentError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="text-right" style={{ direction: 'rtl' }}>
        <h2 className="text-xl font-bold mb-4">الدفع بواسطة Solana</h2>
        
        {/* Product and payment details */}
        <div className="mb-4 space-y-2">
          {productName && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">المنتج:</span>
              <span className="font-medium">{productName}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">المبلغ:</span>
            <span className="font-medium">{amount} SOL</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">الشبكة:</span>
            <span className="font-medium">{network}</span>
          </div>
        </div>
        
        {/* Wallet section */}
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">المحفظة:</span>
            <span className="font-mono text-sm truncate max-w-[200px]">
              {wallet ? wallet.publicKey.toString().slice(0, 8) + '...' : 'لا يوجد محفظة'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">الرصيد:</span>
            <span className="font-medium">{walletBalance.toFixed(4)} SOL</span>
          </div>
          
          <div className="mt-2 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={createNewWallet}
              disabled={isLoading}
            >
              محفظة جديدة
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={handleAirdropRequest}
              disabled={isLoading || !wallet || network === 'mainnet-beta'}
            >
              طلب رصيد تجريبي
            </Button>
          </div>
        </div>
        
        {/* Advanced settings toggle */}
        <div className="mb-4">
          <button 
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'إخفاء الإعدادات المتقدمة' : 'إظهار الإعدادات المتقدمة'}
          </button>
          
          {showAdvanced && (
            <div className="mt-2 space-y-2 p-3 border rounded-md">
              <div className="space-y-1">
                <Label htmlFor="network">الشبكة</Label>
                <select
                  id="network"
                  className="w-full p-2 border rounded"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as any)}
                  disabled={isLoading}
                >
                  <option value="devnet">Devnet (تجريبية)</option>
                  <option value="testnet">Testnet (اختبارية)</option>
                  <option value="mainnet-beta">Mainnet (رئيسية)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="recipient">عنوان المستلم</Label>
                <Input
                  id="recipient"
                  type="text"
                  value={recipientWallet}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Payment action */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
          onClick={handlePayment}
          disabled={isLoading || !wallet || walletBalance < amount}
        >
          {isLoading ? 'جاري التنفيذ...' : `دفع ${amount} SOL`}
        </Button>
        
        {/* Transaction result */}
        {paymentStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">تمت عملية الدفع بنجاح!</p>
            <p className="text-sm text-green-600 font-mono break-all mt-1">
              رقم العملية: {signature}
            </p>
          </div>
        )}
        
        {paymentStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">فشلت عملية الدفع</p>
            <p className="text-sm text-red-600 mt-1">
              يرجى التحقق من الرصيد والمحاولة مرة أخرى.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}