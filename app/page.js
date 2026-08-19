import { supabase } from '@/lib/supabaseClient';
import CatalogClient from '@/components/CatalogClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from('produk')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container">
      <CatalogClient products={products || []} errorMessage={error ? error.message : null} />
    </div>
  );
}