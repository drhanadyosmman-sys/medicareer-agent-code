import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!name || !email || !password) {
        toast.error('Please fill in all fields');
        return;
      }
      const success = register(name, email, password);
      if (success) {
        toast.success('Account created successfully');
        navigate('/dashboard');
      } else {
        toast.error('An account with this email already exists');
      }
    } else {
      const success = login(email, password);
      if (success) {
        toast.success('Welcome back');
        // Check if admin
        const user = JSON.parse(localStorage.getItem('medicareer_currentUser') || '{}');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-ivory">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl text-navy mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-sm text-muted-foreground">
              {isRegister ? 'Join MediCareer Agent to track your application' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Smith" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full bg-navy hover:bg-navy/90 text-white btn-press">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-teal hover:underline">
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>

          <div className="mt-6 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground text-center">Admin: admin@medicareer.com / admin123</p>
            <p className="text-xs text-muted-foreground text-center">User: doctor@example.com / doctor123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
