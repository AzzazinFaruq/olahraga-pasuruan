import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoKoni from '@/public/logo/logo-koni-white.png';

const Footer = () => {
  return (
    <footer style={{ 
      background: `var(--color-primary-dark)`,
      color: 'var(--color-gray-300)'
    }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-4">
              <Image 
                src={LogoKoni}
                alt="KONI Kabupaten Pasuruan"
                width={200}
                height={40}
                className="object-contain"
              />
            </div>
            <p className="text-sm opacity-80">
              Mengembangkan potensi olahraga dan prestasi masyarakat Kabupaten Pasuruan
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/daftar-atlet" className="opacity-80 hover:opacity-100 transition-opacity">
                  Daftar Atlet
                </Link>
              </li>
              <li>
                <Link href="/hasil-pertandingan" className="opacity-80 hover:opacity-100 transition-opacity">
                  Hasil Pertandingan
                </Link>
              </li>
              <li>
                <Link href="/dokumentasi" className="opacity-80 hover:opacity-100 transition-opacity">
                  Dokumentasi
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Kontak</h4>
            <p className="text-sm opacity-80">
              KONI Kabupaten Pasuruan<br />
              Jl. Raya Pasuruan No. 123<br />
              Telp: (0343) 123456<br />
              Email: koni@pasuruankab.go.id
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-60">
          <p>© 2025 Porprov Jawa Timur. All rights reserved. Komite Olahraga Nasional Kabupaten Pasuruan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;