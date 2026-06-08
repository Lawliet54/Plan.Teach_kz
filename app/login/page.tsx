import { AuthPortal } from "@/components/auth/AuthPortal";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthPortal
      initialMode="login"
      error={params?.error}
      success={params?.success}
    />
  );
}