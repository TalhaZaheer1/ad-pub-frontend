import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertCircle } from 'lucide-react'; // Assuming AlertCircle is needed for the new design

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auth Store selectors
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error); // Renamed 'error' to 'authError' to match new JSX
  const clearError = useAuthStore((state) => state.clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authError) clearError(); // Use authError here

    await login(email, password);
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-900 z-0"></div>
        {/* Decorative blobs/shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-accent blur-[120px]"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-16 lg:p-24 w-full h-full text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-lg">AP</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">AdPub System</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight animate-in fade-in-up">
            Welcome back.
          </h1>
          <p className="text-lg lg:text-xl text-primary-100 mb-12 max-w-lg opacity-80 animate-in fade-in-up" style={{ animationDelay: '100ms' }}>
            Manage your media, production schedules, and organizational hierarchy.
          </p>

          <div className="mt-auto flex items-center gap-4 text-sm font-medium text-white/60">
            <span>© 2026 Ad Publication System</span>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md animate-in fade-in-up">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">AdPub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Enter your credentials to access your account.</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) clearError();
              }}
              placeholder="you@example.com"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm font-medium text-accent hover:text-indigo transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) clearError();
                }}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-base py-3"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 pt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-accent hover:text-indigo transition-colors duration-200">
                Request Access
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
