import { useState, useEffect, useRef } from 'react'; 
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'; 
import { Zap, LogOut, User, Menu, X } from 'lucide-react'; //Mobil menü için Hamburger ve (X) ikonlarını dahil ettim.

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation(); //Mevcut sayfanın URL'ini takip etmek için 

  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  //Profil menüsünün HTML elemanını (div) referans almak için bir ref oluşturdum.
  const profileRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('edys_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Sayfanın herhangi bir yerine tıklandığında çalışacak olan effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Eğer profil menüsü referansım varsa VE tıklanılan yer (event.target) bu referansın içinde değilse menüyü kapat.
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Mousedown olayını dinleme
    document.addEventListener('mousedown', handleClickOutside);
    
    //Bileşen ekrandan kaybolursa dinleyiciyi siliyorum ki hafıza sızıntısı olmasın.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Kullanıcı mobilde menüden bir linke tıkladığında, URL değişeceği için açık kalan mobil menüyü otomatik kapatıyorum.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('edys_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ÜST MENÜ*/}
      {/*mobilde kenar boşluğunu biraz kıstım (px-6 yerine px-4 sm:px-6 yaptım) */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-50">
        
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
            className={({isActive}) => `h-full flex items-center px-3 lg:px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Genel Bakış
          </NavLink>
          <NavLink 
            to="/kontrol" 
            className={({isActive}) => `h-full flex items-center px-3 lg:px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            İşlem ve Kontrol
          </NavLink>
          <NavLink 
            to="/gecmis" 
            className={({isActive}) => `h-full flex items-center px-3 lg:px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            İşlem Geçmişi
          </NavLink>
          {/* YENİ EKLENEN AYARLAR LİNKİ */}
          <NavLink 
            to="/ayarlar" 
            className={({isActive}) => `h-full flex items-center px-3 lg:px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Ayarlar
          </NavLink>
        </nav>

        {/* Durum ve Cikis(sag taraftaki) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {user && (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <User size={16} />
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                  <span className="text-xs font-bold leading-tight">{user.name}</span>
                  <span className="text-[10px] text-gray-500 leading-tight">{user.title}</span>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-4 animate-fade-in">
                  <div className="flex flex-col items-center text-center border-b border-gray-100 pb-3 mb-3">
                    <div className="w-12 h-12 bg-green-50 text-[#00E500] rounded-full flex items-center justify-center mb-2">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                    <span className="text-xs font-semibold text-[#00E500] uppercase mt-1 tracking-wider">{user.role}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    <p className="mb-1">{user.title}</p>
                    <p className="font-medium text-gray-400">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/*Canlı etiketini mobilde biraz daha sıkı ve küçük yaptım ki yer kaplamasın. */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-green-50 px-2 sm:px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-2 h-2 rounded-full bg-[#00E500] animate-pulse"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-green-700">Canlı</span>
          </div>
          
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2">
            <LogOut size={18} />
            {/*Çıkış Yap yazısını tablette gizleyip sadece büyük ekranda (lg) gösterdim. */}
            <span className="text-sm font-medium hidden lg:block">Çıkış Yap</span>
          </button>

          {/* Sadece mobil cihazlarda görünecek olan Hamburger Menü butonunu yerleştirdim. */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-500 hover:text-gray-900 transition-colors p-1"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-gray-200 animate-fade-in absolute top-16 left-0 w-full z-40 shadow-sm flex flex-col">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `p-4 text-sm font-medium border-l-4 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500] bg-green-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            Genel Bakış
          </NavLink>
          <NavLink 
            to="/kontrol" 
            className={({isActive}) => `p-4 text-sm font-medium border-l-4 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500] bg-green-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            İşlem ve Kontrol
          </NavLink>
          <NavLink 
            to="/gecmis" 
            className={({isActive}) => `p-4 text-sm font-medium border-l-4 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500] bg-green-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            İşlem Geçmişi
          </NavLink>
          <NavLink 
            to="/ayarlar" 
            className={({isActive}) => `p-4 text-sm font-medium border-l-4 transition-colors ${isActive ? 'border-[#00E500] text-[#00E500] bg-green-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            Ayarlar
          </NavLink>
        </nav>
      )}

      {/* SAYFA ICERIGI*/}
      <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
        <Outlet /> 
      </main>
    </div>
  );
}