
import { loginAction } from "@/lib/actions/auth";
import LoginForm from "@/components/forms/LoginForm";

export default async function SignIn() {
  return (
    <LoginForm action={loginAction} />
  );
}
