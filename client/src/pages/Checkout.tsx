import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock, CreditCard, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const [, navigate] = useLocation();
  const { lang } = useLanguage();

  // Read plan details from URL params
  const params = new URLSearchParams(window.location.search);
  const planName = params.get('planName') || 'Standard Package';
  const price = params.get('price') || '299';
  const plan = params.get('plan') || '';

  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  // Format expiry MM/YY
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePay = () => {
    if (!form.cardName || !form.cardNumber || !form.expiry || !form.cvv) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-teal-500" />
              </div>
              <h2 className="font-serif text-3xl text-blue-900 mb-3">
                {lang === 'ar' ? 'تمّت عملية الدفع بنجاح!' : 'Payment Successful!'}
              </h2>
              <p className="text-gray-600 mb-2">
                {lang === 'ar'
                  ? `شكراً لاختيارك باقة "${planName}". سيتواصل معك فريقنا خلال 24 ساعة.`
                  : `Thank you for choosing the "${planName}" package. Our team will contact you within 24 hours.`}
              </p>
              <p className="text-sm text-gray-400">
                {lang === 'ar' ? 'جاري تحويلك إلى لوحة التحكم...' : 'Redirecting to your dashboard...'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl text-blue-900 mb-2">
                  {lang === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
                </h1>
                <p className="text-gray-500">
                  {lang === 'ar' ? 'آمن ومشفّر بالكامل' : 'Secure and fully encrypted'}
                </p>
              </div>

              {/* Order Summary */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-500" />
                    {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-blue-900">{planName}</div>
                      <div className="text-sm text-gray-500">
                        {lang === 'ar' ? 'MediCareer Agent — UK Doctor Jobs' : 'MediCareer Agent — UK Doctor Jobs'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">£{price}</div>
                  </div>
                  <div className="flex items-center justify-between py-3 text-sm text-gray-500">
                    <span>{lang === 'ar' ? 'دفعة واحدة — لا رسوم متكررة' : 'One-time payment — no recurring fees'}</span>
                    <span className="text-teal-600 font-medium">
                      {lang === 'ar' ? 'مشمول: مراجعة السيرة الذاتية' : 'Includes: CV Review'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-500" />
                    {lang === 'ar' ? 'بيانات البطاقة' : 'Card Details'}
                  </h3>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {lang === 'ar' ? 'الاسم على البطاقة' : 'Name on Card'}
                    </Label>
                    <Input
                      value={form.cardName}
                      onChange={e => updateForm('cardName', e.target.value)}
                      placeholder={lang === 'ar' ? 'الاسم كما يظهر على البطاقة' : 'As it appears on your card'}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {lang === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        value={form.cardNumber}
                        onChange={e => updateForm('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                      </Label>
                      <Input
                        value={form.expiry}
                        onChange={e => updateForm('expiry', formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">CVV</Label>
                      <Input
                        value={form.cvv}
                        onChange={e => updateForm('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="mt-1.5"
                        type="password"
                      />
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    onClick={handlePay}
                    disabled={loading || !form.cardName || !form.cardNumber || !form.expiry || !form.cvv}
                    className="w-full h-14 text-lg font-semibold bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        {lang === 'ar' ? `ادفع الآن — £${price}` : `Pay Now — £${price}`}
                      </span>
                    )}
                  </Button>

                  {/* Security note */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'ar'
                        ? 'مدفوعاتك محمية بتشفير SSL 256-bit'
                        : 'Your payment is protected by 256-bit SSL encryption'}
                    </span>
                  </div>

                  {/* Demo notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 text-center">
                    {lang === 'ar'
                      ? '⚠️ هذه صفحة دفع تجريبية — لن يتم خصم أي مبلغ حقيقي'
                      : '⚠️ This is a demo payment page — no real charges will be made'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
