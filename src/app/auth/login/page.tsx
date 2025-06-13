
import { loginAction } from "@/lib/actions/form/auth";
import LoginForm from "@/components/forms/LoginForm";

export default async function SignIn() {
  return (
    <LoginForm action={loginAction} />
  );
}
