import './globals.css';

export const metadata = {
  title: 'DigiZone Africa',
  description: 'La marketplace digitale francophone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}