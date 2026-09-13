'use client';

import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="admin-nav">
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
  );
}