'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { login, loginWithAzure } from '@/services/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { FaMicrosoft } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/shared/components/secure/SubmitButton';
import FormError from '@/shared/components/FormError';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const result = await login(data.email, data.password);
      if (result.error) {
        throw result.error.message;
      }

      router.push('/');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : (err as { message: string })?.message || 'Unknown error';
      toast.error(`Failed to Login: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const ssoLoginAzure = async () => {
    try {
      setIsLoading(true);

      const result = await loginWithAzure();
      if (result.error) throw result.error.message;

      window.location.href = result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : (err as { message: string })?.message || 'Unknown error';
      toast.error(`Failed to Login: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full flex items-center justify-center"
    >
      <Card className="w-2/3 h-fit">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome Back to MSP Byte!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Email (Currently Disabled)
            <Input
              type="email"
              placeholder="John.Doe@example.com"
              disabled
              {...register('email')}
            />
            <FormError name="email" errors={errors} />
          </Label>

          <Label className="grid gap-2">
            Password
            <Input type="password" placeholder="Password" disabled {...register('password')} />
            <FormError name="password" errors={errors} />
          </Label>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton pending={isLoading} disabled className="w-full">
            Login
            <LogIn />
          </SubmitButton>
          <div className="flex gap-2 items-center w-full justify-center overflow-clip">
            <Separator />
            <span className="w-fit">OR</span>
            <Separator />
          </div>
          <div className="grid grid-cols-1">
            <AuthIcon onClick={ssoLoginAzure} disabled={isLoading}>
              <FaMicrosoft />
            </AuthIcon>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

function AuthIcon({
  children,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<typeof Button>) {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  );
}
