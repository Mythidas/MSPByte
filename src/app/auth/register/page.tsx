import RegisterForm from '@/components/forms/RegisterForm';
import ErrorDisplay from '@/components/ux/ErrorDisplay';

type Props = {
  searchParams: Promise<{ code: string }>;
};

export default async function SignIn(props: Props) {
  const searchParams = await props.searchParams;

  if (!searchParams.code) {
    return <ErrorDisplay message="Invalid invite code." />;
  }

  return <RegisterForm code={searchParams.code} />;
}
