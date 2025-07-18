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
import FormError from '@/components/shared/FormError';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { register as authRegister } from '@/services/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const formSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password mus be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

type Props = {
  code: string;
};

export default function RegisterForm({ code }: Props) {
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

      const result = await authRegister(code, data.password);
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
          <CardTitle>Register</CardTitle>
          <CardDescription>Welcome to MSP Byte!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Set Password
            <Input type="password" placeholder="Password" {...register('password')} />
            <FormError name="password" errors={errors} />
          </Label>

          <Label className="grid gap-2">
            Confirm Password
            <Input
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword')}
            />
            <FormError name="confirmPassword" errors={errors} />
          </Label>
        </CardContent>
        <CardFooter className="grid gap-4">
          <SubmitButton pending={isSaving} className="w-full">
            Register
            <LogIn />
          </SubmitButton>
          <Separator />
          <span className="flex items-center">
            Already have an account?
            <Button asChild variant="link" className="px-2 text-base">
              <Link href="/auth/login">Login</Link>
            </Button>
          </span>
        </CardFooter>
      </Card>
    </form>
  );
}
