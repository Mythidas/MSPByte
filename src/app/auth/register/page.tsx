import RegisterForm from '@/features/users/components/RegisterForm';

type Props = {
  searchParams: Promise<{ code: string }>;
};

export default async function Page({ ...props }: Props) {
  const searchParams = await props.searchParams;
  return <RegisterForm code={searchParams.code} />;
}
