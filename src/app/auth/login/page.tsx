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
import FormError from '@/components/ux/FormError';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { login } from '@/services/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function SignIn() {
  const [isSaving, setIsSaving] = useState(false);
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
      setIsSaving(true);

      const result = await login(data.email, data.password);
      if (!result.ok) {
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
      setIsSaving(false);
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
            Email
            <Input type="email" placeholder="John.Doe@example.com" {...register('email')} />
            <FormError name="email" errors={errors} />
          </Label>

          <Label className="grid gap-2">
            Password
            <Input type="password" placeholder="Password" {...register('password')} />
            <FormError name="password" errors={errors} />
          </Label>
        </CardContent>
        <CardFooter>
          <SubmitButton pending={isSaving} className="w-full">
            Login
            <LogIn />
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
