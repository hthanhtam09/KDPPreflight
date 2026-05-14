import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { getAdminSession } from '@/lib/admin-session';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4 dark:bg-[#090d16]">
      <LoginForm />
    </div>
  );
}
