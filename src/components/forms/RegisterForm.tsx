'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import FormAlert from '@/components/ux/FormAlert';
import FormError from '@/components/ux/FormError';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { register } from '@/services/auth';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  code: string;
};

export default function RegisterForm({ code }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(undefined);
    setMessage(undefined);

    if (password !== confirm) {
      setErrors({ confirm: ['Passwords do not match'] });
      return;
    }

    setLoading(true);

    const result = await register(code, password);
    if (result.ok) {
      redirect('/');
    } else {
      toast.error(result.error.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormAlert message={message} />
      <Card>
        <CardHeader>
          <CardTitle>Invitation</CardTitle>
          <CardDescription>Welcome to MSPByte!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-2">
          <Label className="flex flex-col items-start">
            Set Password
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormError name="password" errors={errors} />
          </Label>
          <Label className="flex flex-col items-start">
            Confirm Password
            <Input
              name="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <FormError name="confirm" errors={errors} />
          </Label>
        </CardContent>
        <Separator />
        <CardFooter>
          <SubmitButton className="w-full" pending={loading}>
            Register
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
