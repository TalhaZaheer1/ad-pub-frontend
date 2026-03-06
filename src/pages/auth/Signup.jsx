import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Building2, User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from company name if it's currently empty or being typed
    if (name === 'companyName' && !prev.companySlug) {
      setFormData(p => ({ ...p, companySlug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
    }
  };

  const handleSlugChange = (e) => {
    setFormData(prev => ({ ...prev, companySlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Because there's no official endpoint documented for this yet, we hit a generic
      // /api/auth/register-company that creates the company + the initial ADMIN user.
      const response = await api.post('/auth/register-company', formData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="m-auto w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center animate-in fade-in-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-6">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 mb-6">
            Your company workspace has been created successfully. You can now log in with your admin credentials.
          </p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
            Scale your corporate media effortlessly.
          </h1>
          <p className="text-lg lg:text-xl text-primary-100 mb-12 max-w-lg opacity-80 animate-in fade-in-up" style={{ animationDelay: '100ms' }}>
            Join thousands of companies managing their design, production, and sales flow in one intuitive platform.
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
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in-up">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">AdPub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create Workspace</h2>
            <p className="text-gray-500">Sign up your company and get started instantly.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger flex items-start gap-3 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Building2 className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Company Details</h3>
              </div>

              <Input
                label="Company Name"
                name="companyName"
                placeholder="Acme Corp"
                required
                value={formData.companyName}
                onChange={handleChange}
              />
              <Input
                label="Workspace URL Slug"
                name="companySlug"
                placeholder="acme-corp"
                required
                value={formData.companySlug}
                onChange={handleSlugChange}
                helperText="This will be used for your unique login portal."
              />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Admin Account</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Jane"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <Input
                type="email"
                label="Work Email"
                name="email"
                placeholder="jane@acmecorp.com"
                required
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
              />
              <Input
                type="password"
                label="Password"
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full text-base py-3" isLoading={isLoading}>
                Create Workspace
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 pt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:text-indigo transition-colors duration-200">
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
