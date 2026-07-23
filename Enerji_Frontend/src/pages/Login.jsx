import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // sayfanın yenilenmesini engeller
    navigate('/dashboard'); // dashboard yonlendirmesi
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* İkon ve Başlık Bölümü */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-green-50 text-[#00E500] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,229,0,0.2)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EDYS Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Enerji Depolama Yönetim Sistemi paneline giriş yapın</p>
        </div>

        {/* Form Bölümü */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              E-POSTA
            </label>
            <input
              type="email"
              placeholder="ornek@sirket.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/30 focus:border-[#00E500] transition-colors text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              ŞİFRE
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/30 focus:border-[#00E500] transition-colors text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00E500] hover:bg-[#00cc00] text-white font-semibold py-3 rounded-lg transition-colors mt-2 shadow-[0_4px_14px_rgba(0,229,0,0.3)] text-sm"
          >
            Giriş Yap
          </button>
        </form>
        
      </div>
    </div>
  );
}