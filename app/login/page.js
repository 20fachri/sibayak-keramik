'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg('Email atau password salah.');
      return;
    }
    router.push('/admin');
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
      <h1 className="page-title">Login Admin</h1>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMsg && <div className="scaffold-note">{errorMsg}</div>}
        <button type="submit" className="btn-pesan" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
        <a href="/forgot-password" style={{ fontSize: 13, textAlign: 'center', color: 'var(--muted)' }}>
          Lupa password?
        </a>
      </form>
    </div>
  );
}