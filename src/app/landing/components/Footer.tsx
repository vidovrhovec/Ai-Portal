'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold">Learning Sensei</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              vaš mojster učenja, ki se prilagaja vam. Revolucioniramo izobraževanje
              z najsodobnejšo AI tehnologijo in dokazanimi pedagoškimi metodami.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produkt</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Funkcije
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Cenik
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-white transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Podpora</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Pomoč
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Zasebnost
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Pogoji uporabe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © {currentYear} AI Learning Sensei. Vse pravice pridržane.
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Narejeno z</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>za boljšo izobrazbo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}