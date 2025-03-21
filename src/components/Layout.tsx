import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { LogPanel } from './LogPanel';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
      <LogPanel />
    </div>
  );
}