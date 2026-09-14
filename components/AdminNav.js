'use client';

import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="admin-nav">
      <div className="admin-nav-tabs">
        <a
          href="/admin"
          className={'admin-nav-link' + (pathname === '/admin' ? ' active' : '')}
        >
          Input Pesanan
        </a>
        <a
          href="/admin/pembukuan"
          className={'admin-nav-link' + (pathname === '/admin/pembukuan' ? ' active' : '')}
        >
          Pembukuan
        </a>
      </div>
      <button onClick={handleLogout} className="admin-nav-logout">
        Logout
      </button>
    </div>
  );
}