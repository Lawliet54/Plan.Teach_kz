import { AuthPortal } from "@/components/auth/AuthPortal";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <AuthPortal
      initialMode="register"
      error={params?.error}
      success={params?.success}
    />
  );
}