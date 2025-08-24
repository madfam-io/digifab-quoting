'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: unknown, tokens: unknown) => void;
  onRegisterWithQuote?: (data: RegisterForm) => Promise<void>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  mode?: 'login' | 'register' | 'guest-conversion';
  redirectTo?: string;
  guestQuoteId?: string;
  actionIntent?: 'export' | 'share' | 'save';
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  onRegisterWithQuote,
  mode = 'login',
  redirectTo = '/dashboard',
  guestQuoteId,
  actionIntent,
}: AuthModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(mode === 'register' ? 'register' : 'login');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('auth.errors.invalid_credentials'));
      } else {
        toast.success(t('auth.success.logged_in'));
        
        if (onSuccess) {
          // For guest conversion flow
          onSuccess({ email: data.email }, { accessToken: result?.ok });
        } else {
          router.push(redirectTo);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('auth.errors.login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      if (onRegisterWithQuote && guestQuoteId) {
        // Guest conversion with registration
        await onRegisterWithQuote(data);
        onClose();
      } else {
        // Regular registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        // Auto-login after registration
        await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        toast.success(t('auth.success.registered'));
        router.push(redirectTo);
        onClose();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('auth.errors.registration_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogContent = () => {
    if (mode === 'guest-conversion') {
      const actionMessages = {
        export: t('auth.guest.export_message'),
        share: t('auth.guest.share_message'),
        save: t('auth.guest.save_message'),
      };

      return {
        title: t('auth.guest.title'),
        description: actionMessages[actionIntent || 'save'],
      };
    }

    return {
      title: t('auth.title'),
      description: t('auth.description'),
    };
  };

  const { title, description } = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === 'guest-conversion' && (
          <Alert className="mt-4">
            <AlertDescription>
              {t('auth.guest.benefits')}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="login-email">{t('auth.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  {...loginForm.register('email')}
                  placeholder={t('auth.email_placeholder')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  {...loginForm.register('password')}
                  placeholder={t('auth.password_placeholder')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    {t('auth.logging_in')}
                  </>
                ) : (
                  t('auth.login_button')
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <Label htmlFor="register-name">{t('auth.name')}</Label>
                <Input
                  id="register-name"
                  {...registerForm.register('name')}
                  placeholder={t('auth.name_placeholder')}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-email">{t('auth.email')}</Label>
                <Input
                  id="register-email"
                  type="email"
                  {...registerForm.register('email')}
                  placeholder={t('auth.email_placeholder')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-password">{t('auth.password')}</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...registerForm.register('password')}
                  placeholder={t('auth.password_placeholder')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-company">{t('auth.company')} ({t('common.optional')})</Label>
                <Input
                  id="register-company"
                  {...registerForm.register('company')}
                  placeholder={t('auth.company_placeholder')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    {t('auth.registering')}
                  </>
                ) : (
                  t('auth.register_button')
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {mode === 'guest-conversion' && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('auth.guest.privacy_note')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}