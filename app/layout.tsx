import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Simulador de Otro La Travaladna",
  description: "Simulador de torneo de fútbol argentino",
};

export const viewport = {
  width: "device-width",
  initialScale: 0.4,
  maximumScale: 2,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @media screen and (max-width: 768px) and (orientation: portrait) {
            .landscape-warning {
              display: flex;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.95);
              color: white;
              justify-content: center;
              align-items: center;
              z-index: 9999;
              flex-direction: column;
              padding: 20px;
              text-align: center;
            }
            .landscape-warning svg {
              width: 80px;
              height: 80px;
              margin-bottom: 20px;
              animation: rotate 2s ease-in-out infinite;
            }
            @keyframes rotate {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(90deg); }
            }
          }
          @media screen and (max-width: 768px) and (orientation: landscape) {
            .landscape-warning {
              display: none;
            }
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="landscape-warning">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h2 style={{fontSize: '24px', marginBottom: '10px'}}>Por favor, rota tu dispositivo</h2>
          <p style={{fontSize: '16px', opacity: 0.8}}>Esta aplicación funciona mejor en modo horizontal</p>
        </div>
        {children}
      </body>
    </html>
  );
}
