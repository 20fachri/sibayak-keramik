'use client';

const NOMOR_WA_TOKO = '6285358564197';

export default function Cart({ items, onUpdateJumlah, onRemove }) {
  let teks = 'Halo, saya mau pesan:\n';
  items.forEach((item) => {
    teks += `- ${item.nama} (${item.ukuran}) x${item.jumlah} dus\n`;
  });
  teks += '\nMohon info harga & totalnya ya.';
  const waLink = `https://wa.me/${NOMOR_WA_TOKO}?text=${encodeURIComponent(teks)}`;

  return (
    <div className="cart-box">
      <div className="cart-title">Keranjang Belanja</div>
      {items.map((item) => (
        <div key={item.produk_id} className="cart-item">
          <div className="cart-item-info">
            <div className="cart-item-nama">{item.nama}</div>
            <div className="cart-item-spek">{item.ukuran}</div>
          </div>
          <input
            type="number"
            min="0"
            value={item.jumlah}
            onChange={(e) => onUpdateJumlah(item.produk_id, Number(e.target.value))}
            className="cart-item-qty"
          />
          <span className="cart-item-unit">dus</span>
          <button onClick={() => onRemove(item.produk_id)} className="cart-item-remove">
            ✕
          </button>
        </div>
      ))}
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-pesan cart-checkout">
        Pesan via WhatsApp
      </a>
    </div>
  );
}