import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // İleride doldurulacak
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ÜST MENÜ*/}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between sticky top-0 z-50">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 text-[#00E500] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,229,0,0.2)]">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">EDYS Panel</span>
        </div>

        {/*Sayfa linkleri */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Genel Bakış
          </NavLink>
          <NavLink 
            to="/kontrol" 
            className={({isActive}) => `h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            İşlem ve Kontrol
          </NavLink>
          <NavLink 
            to="/gecmis" 
            className={({isActive}) => `h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            İşlem Geçmişi
          </NavLink>
          {/* YENİ EKLENEN AYARLAR LİNKİ */}
          <NavLink 
            to="/ayarlar" 
            className={({isActive}) => `h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Ayarlar
          </NavLink>
        </nav>

        {/* Durum ve Cikis(sag taraftaki) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-2 h-2 rounded-full bg-[#00E500] animate-pulse"></div>
            <span className="text-xs font-semibold text-green-700">Canlı</span>
          </div>
          
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2">
            <LogOut size={18} />
            <span className="text-sm font-medium hidden sm:block">Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* SAYFA ICERIGI*/}
      <main className="flex-1 p-6 max-w-screen-2xl mx-auto w-full">
        <Outlet /> 
      </main>
    </div>
  );
}