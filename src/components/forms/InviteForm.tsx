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
import { InviteFormValues } from '@/lib/forms/users';
import { FormState } from '@/types';
import { useActionState } from 'react';

type Props = {
  code: string;
  action: (_prevState: unknown, params: FormData) => Promise<FormState<InviteFormValues>>;
};

export default function InviteForm(props: Props) {
  const [state, formAction] = useActionState(props.action, {});

  return (
    <form action={formAction}>
      <input hidden name="code" value={props.code} />
      <FormAlert message={state.message} />
      <Card>
        <CardHeader>
          <CardTitle>Invitation</CardTitle>
          <CardDescription>Welcome to MSPByte!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4">
          <Label className="flex flex-col items-start">
            Set Password
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
          <Button className="w-full">Complete Invite</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
