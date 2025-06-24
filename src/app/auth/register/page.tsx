import InviteForm from '@/components/forms/InviteForm';
import FormAlert from '@/components/ux/FormAlert';
import { registerAction } from '@/lib/actions/auth';

type Props = {
  searchParams: Promise<{ code: string }>;
};

export default async function SignIn(props: Props) {
  const searchParams = await props.searchParams;

  if (!searchParams.code) {
    return <FormAlert message="Invalid invite code." />;
  }

  return <InviteForm code={searchParams.code} action={registerAction} />;
}
