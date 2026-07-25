import { useState } from 'react';
import { Settings as SettingsIcon, Battery, ShieldAlert, Save, Check } from 'lucide-react';

export default function Settings() {
  // --- STATİK AYAR DURUMLARI ---
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [minSoc, setMinSoc] = useState(15);
  const [maxSoc, setMaxSoc] = useState(90);
  const [efficiency, setEfficiency] = useState(95);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    // 2.5 saniye sonra "Kaydedildi" yazısını geri al
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="animate-fade-in pb-10 flex justify-center">
      
      <div className="w-full max-w-5xl">
        {/* BAŞLIK BÖLÜMÜ (Ortalanmış) */}
        <div className="text-center mb-10 mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-4">
            <SettingsIcon size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları(su an statik)</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Enerji depolama biriminizin kapasite, verimlilik ve güvenlik sınırlarını bu panel üzerinden yönetebilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* 1. Kart kismi*/}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 text-gray-800 mb-8 border-b border-gray-100 pb-5">
              <Battery size={20} className="text-[#00E500]" />
              <h2 className="text-base font-bold uppercase tracking-wider">Depolama Kapasitesi ve Verim</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Maksimum Kapasite (MWh)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/20 focus:border-[#00E500] transition-all text-gray-900 font-semibold bg-gray-50"
                    min="10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">MWh</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Döngü Verimliliği (%)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/20 focus:border-[#00E500] transition-all text-gray-900 font-semibold bg-gray-50"
                    min="1"
                    max="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/*Sinirlar */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 text-gray-800 mb-8 border-b border-gray-100 pb-5">
              <ShieldAlert size={20} className="text-[#00E500]" />
              <h2 className="text-base font-bold uppercase tracking-wider">Güvenli Çalışma Aralıkları (SOC)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Minimum Alt Sınır
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={minSoc}
                    onChange={(e) => setMinSoc(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-900 font-semibold bg-red-50/50"
                    min="0"
                    max="50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-red-400">%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">Deşarj işleminin durdurulacağı eşik değer.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Maksimum Üst Sınır
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxSoc}
                    onChange={(e) => setMaxSoc(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-[#00E500]/30 focus:outline-none focus:ring-2 focus:ring-[#00E500]/20 focus:border-[#00E500] transition-all text-gray-900 font-semibold bg-green-50/50"
                    min="50"
                    max="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00E500]/70">%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">Şarj işleminin durdurulacağı eşik değer.</p>
              </div>
            </div>
          </div>

          {/* Kaydetme */}
          <div className="flex justify-center pt-6">
            <button 
              type="submit"
              disabled={isSaved}
              className={`flex items-center justify-center gap-2 px-12 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                isSaved 
                  ? 'bg-gray-100 text-green-600 border border-green-200 cursor-not-allowed' 
                  : 'bg-[#00E500] hover:bg-[#00c200] text-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isSaved ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  Değişiklikler Başarıyla Kaydedildi
                </>
              ) : (
                <>
                  <Save size={18} strokeWidth={2.5} />
                  Ayarları Kaydet
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}