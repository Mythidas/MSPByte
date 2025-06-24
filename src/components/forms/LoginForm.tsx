'use client';

import { Button } from '@/components/ui/button';
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
import { LoginFormValues } from '@/lib/forms/auth';
import { FormState } from '@/types';
import { useActionState } from 'react';

type Props = {
  action: (_prevState: unknown, params: FormData) => Promise<FormState<LoginFormValues>>;
};

export default function LoginForm(props: Props) {
  const [state, formAction] = useActionState(props.action, {});

  return (
    <form action={formAction}>
      <FormAlert message={state.message} />
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back to MSPByte!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4">
          <Label className="flex flex-col items-start">
            Email
            <Input
              name="email"
              placeholder="John.doe@email.com"
              type="email"
              defaultValue={state.values?.email}
            />
            <FormError name="email" errors={state.errors} />
          </Label>
          <Label className="flex flex-col items-start">
            Password
            <Input
              name="password"
              placeholder="123456"
              type="password"
              defaultValue={state.values?.password}
            />
            <FormError name="password" errors={state.errors} />
          </Label>
        </CardContent>
        <Separator />
        <CardFooter>
          <Button className="w-full">Login</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
