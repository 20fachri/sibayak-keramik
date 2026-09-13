'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PesananForm from '@/components/PesananForm';
import AdminNav from '@/components/AdminNav';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login');
      } else {
        setSession(data.session);
      }
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (checking) {
    return (
      <div className="container">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="brand-link">
          <img src="/logo.png" alt="Logo Sibayak Keramik" className="site-logo" />
          <div>
            <div className="wordmark">Sibayak Keramik</div>
            <div className="tagline">Keramik &amp; Ubin Bahan Bangunan</div>
          </div>
        </a>
      </header>

      <AdminNav />

      <h1 className="page-title">Dashboard Admin</h1>

      <p>Login berhasil sebagai {session.user.email}.</p>
      <button onClick={handleLogout} className="btn-pesan" style={{ marginTop: 16 }}>
        Logout
      </button>

      <h2 style={{ marginTop: 32, fontSize: 18 }}>Input Pesanan Baru</h2>
      <PesananForm />
    </div>
  );
}