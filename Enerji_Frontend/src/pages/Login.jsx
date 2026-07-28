import { useState } from 'react'; // E-posta, şifre ve hata durumlarını tutmak için useState'i dahil ettim.
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // Kullanıcının girdiği bilgileri ve olası hata mesajını tutacağım stateleri tanımladım.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => { // Fetch ile veri çekeceğim için fonksiyonu async yaptım.
    e.preventDefault(); // Sayfanın yenilenmesini engelliyorum.
    setError(''); 

    try {
      // Artık yerel bir json dosyasını değil, ayağa kaldırdığımız .NET API'sini çağırıyorum.
      // POST metodu ile kullanıcı adı ve şifreyi güvenli bir şekilde Backend'e yolluyorum.
      const response = await fetch('http://localhost:5252/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Kullanıcının inputlara girdiği verileri JSON string'ine çevirip API'ye gönderiyorum.
        body: JSON.stringify({ email, password }) 
      });

      // Eğer API'den gelen cevap olumlu ise
      if (response.ok) {
        // Backend'in bana yolladığı kullanıcı bilgilerini alıyorum.
        const foundUser = await response.json();

        // Bu bilgileri uygulamanın diğer sayfalarında kullanabilmek için tarayıcının hafızasına (localStorage) kaydediyorum.
        const userData = {
          name: foundUser.name,
          role: foundUser.role,
          title: foundUser.title,
          email: foundUser.email
        };
        localStorage.setItem('edys_user', JSON.stringify(userData));
        
        navigate('/dashboard'); // Dashboard yönlendirmesi 
      } else {
        // Eğer cevap olumsuzsa Backend'den gelen hata mesajını yakalayıp ekrana basıyorum.
        const errorData = await response.json();
        setError(errorData.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      // API'ye hiç ulaşılamıyorsa bu hata gösterilir
      setError('Sisteme (Backend) bağlanırken bir hata oluştu. Sunucunun açık olduğundan emin olun.');
    }
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

        {/* Eğer error state'im boş değilse, formun hemen üstünde kırmızı bir kutu içinde gösteriyorum. */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

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
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
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
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
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