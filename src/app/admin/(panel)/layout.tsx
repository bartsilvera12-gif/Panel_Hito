import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAuthAdmin } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthAdmin();
  if (!auth) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-claro lg:flex">
      <Sidebar role={auth.profile.role} name={auth.profile.full_name} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-[clamp(16px,3vw,40px)] py-[clamp(20px,3vw,40px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
