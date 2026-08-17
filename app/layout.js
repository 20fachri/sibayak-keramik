import './globals.css';

export const metadata = {
  title: 'Sibayak Keramik',
  description: 'Katalog keramik & ubin bahan bangunan — Sibayak Keramik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
