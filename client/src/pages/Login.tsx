import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      if (!name || !email || !password) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }
      const success = register(name, email, password);
      if (success) {
        toast.success('Account created successfully');
        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        toast.error('An account with this email already exists');
      }
    } else {
      const success = login(email, password);
      if (success) {
        // Read role directly from store after login to ensure fresh data
        const currentUser = store.getCurrentUser();
        const destination = currentUser?.role === 'admin' ? '/admin' : '/dashboard';
        toast.success(`Welcome back, ${currentUser?.name}`);
        setTimeout(() => navigate(destination), 100);
      } else {
        toast.error('Invalid email or password. Please check your credentials.');
      }
    }
    setLoading(false);
  };

  const fillDemo = (type: 'admin' | 'doctor') => {
    if (type === 'admin') {
      setEmail('admin@medicareer.com');
      setPassword('admin123');
    } else {
      setEmail('doctor@example.com');
      setPassword('doctor123');
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

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-teal hover:underline">
              {isRegister ? t('login.hasAccount') : t('login.noAccount')}
            </button>
          </div>

          {/* Demo credentials with quick-fill buttons */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-xs font-medium text-navy text-center mb-3">{t('login.demoTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="p-2.5 rounded-lg bg-navy/5 hover:bg-navy/10 border border-navy/10 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-navy">Admin</p>
                <p className="text-xs text-muted-foreground">admin@medicareer.com</p>
                <p className="text-xs text-muted-foreground">admin123</p>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('doctor')}
                className="p-2.5 rounded-lg bg-teal/5 hover:bg-teal/10 border border-teal/10 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-teal">Doctor</p>
                <p className="text-xs text-muted-foreground">doctor@example.com</p>
                <p className="text-xs text-muted-foreground">doctor123</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
