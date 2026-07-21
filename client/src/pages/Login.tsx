import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { readableError } from '@/lib/errorMessage';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/** Messages for the ?error= values the login-link route redirects back with. */
const LINK_ERRORS: Record<string, { en: string; ar: string }> = {
  'invalid-link': {
    en: 'That sign-in link is not valid. It may already have been used — request a new one below.',
    ar: 'رابط الدخول غير صالح. ربما تم استخدامه من قبل — اطلب رابطاً جديداً بالأسفل.',
  },
  'expired-link': {
    en: 'That sign-in link has expired. Request a new one below.',
    ar: 'انتهت صلاحية رابط الدخول. اطلب رابطاً جديداً بالأسفل.',
  },
  'link-failed': {
    en: 'Something went wrong signing you in. Please request a new link.',
    ar: 'حدث خطأ أثناء تسجيل دخولك. من فضلك اطلب رابطاً جديداً.',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const { t, lang } = useLanguage();
  const requestLoginLink = trpc.auth.requestLoginLink.useMutation();

  // The login-link route redirects here with ?error=... when a link fails.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('error');
    if (!reason) return;
    const message = LINK_ERRORS[reason];
    if (message) toast.error(lang === 'ar' ? message.ar : message.en);
    // Clear it so a refresh does not show the same error again.
    window.history.replaceState({}, '', window.location.pathname);
  }, [lang]);

  const handleSendLink = async () => {
    if (!email) {
      toast.error(lang === 'ar' ? 'أدخل بريدك الإلكتروني أولاً' : 'Enter your email address first');
      return;
    }
    setSendingLink(true);
    try {
      await requestLoginLink.mutateAsync({ email, lang: lang === 'ar' ? 'ar' : 'en' });
      // Shown regardless of whether the address has an account, matching what the
      // server reports - the page must not reveal who is registered either.
      setLinkSent(true);
    } catch (error) {
      toast.error(readableError(error));
    } finally {
      setSendingLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (isRegister && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (isRegister && password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        toast.success('Account created successfully');
        navigate('/dashboard');
      } else {
        await login(email, password);
        toast.success('Welcome back');
        // The redirect target depends on the role the *server* reports.
        navigate('/dashboard');
      }
    } catch (error) {
      // The server deliberately returns the same message for an unknown email as
      // for a wrong password; surface it as-is rather than guessing which it was.
      toast.error(readableError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-ivory">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl text-navy mb-2">{isRegister ? t('login.createAccount') : t('login.welcomeBack')}</h1>
            <p className="text-sm text-muted-foreground">
              {isRegister ? t('login.createAccountDesc') : t('login.signInDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium">{t('login.fullName')}</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Smith" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="mt-1.5"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">{t('login.password')}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90 text-white btn-press">
              {loading ? t('login.pleaseWait') : isRegister ? t('login.createBtn') : t('login.signInBtn')}
            </Button>
          </form>

          {!isRegister && (
            <div className="mt-6 pt-6 border-t border-border">
              {linkSent ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-navy mb-1">
                    {lang === 'ar' ? 'تحقّق من بريدك الإلكتروني' : 'Check your email'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === 'ar'
                      ? `إذا كان لديك حساب بهذا البريد، فقد أرسلنا إليه رابط دخول. الرابط يعمل مرة واحدة وينتهي خلال ١٥ دقيقة.`
                      : `If an account exists for that address, we have sent it a sign-in link. It works once and expires in 15 minutes.`}
                  </p>
                  <button
                    onClick={() => setLinkSent(false)}
                    className="text-xs text-teal hover:underline mt-3"
                  >
                    {lang === 'ar' ? 'استخدام بريد آخر' : 'Use a different address'}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    {lang === 'ar' ? 'نسيت كلمة السر؟' : 'Forgotten your password?'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={sendingLink}
                    onClick={handleSendLink}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {sendingLink
                      ? lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'
                      : lang === 'ar' ? 'أرسل لي رابط دخول' : 'Email me a sign-in link'}
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-teal hover:underline">
              {isRegister ? t('login.hasAccount') : t('login.noAccount')}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
