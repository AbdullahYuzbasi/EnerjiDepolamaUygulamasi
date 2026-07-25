import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Lightbulb, ArrowDown, ArrowUp, Activity, X, Zap } from 'lucide-react';

export default function Control() {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  
  // Kontrol Paneli Durumları
  const [energyAmount, setEnergyAmount] = useState("5");
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Sistem SOC Verileri 
  const currentSoc = 48;
  const currentCapacity = 48.5; // MWh
  const maxCapacity = 100.0; // MWh
  const availableCapacity = currentCapacity.toFixed(1);
  const emptySpace = (maxCapacity - currentCapacity).toFixed(1);

  // --- VERİ ÇEKME VE GRAFİK İŞLEME ---
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/data/PiyasaFiyatveDurumlar.json');
        const data = await response.json();

        const currentHourInt = new Date().getHours();
        const formattedHour = `${currentHourInt.toString().padStart(2, '0')}:00`;
        setCurrentTime(formattedHour);

        const activeData = data.find(item => item.saat === formattedHour) || data[0];
        setCurrentPrice(activeData.fiyat);

        // Grafikte Geçmiş (Yeşil) ve Gelecek (Gri Kesik) olarak belirtildi
        const processedData = data.map(item => {
          const itemHour = parseInt(item.saat.split(':')[0], 10);
          return {
            time: item.saat,
            // Şu anki saate kadar
            pastPrice: itemHour <= currentHourInt ? item.fiyat : null,
            // Şu anki saatten sonrakiler 
            futurePrice: itemHour >= currentHourInt ? item.fiyat : null,
            fullPrice: item.fiyat // Tooltip için tam veri
          };
        });

        setChartData(processedData);
      } catch (error) {
        console.error("JSON Verisi çekilemedi:", error);
      }
    };

    fetchMarketData();
  }, []);

  // Özel Tooltip (Grafik üzerine gelindiğinde cıkan kutu)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
          <p className="text-gray-900 font-bold text-sm">₺{payload[0].payload.fullPrice} <span className="text-xs font-normal text-gray-500">/ MWh</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* BAŞLIK BÖLÜMÜ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşlem ve Kontrol</h1>
        <p className="text-sm text-gray-500 mt-1">Sistem için manuel arbitraj ve yönetim paneli.</p>
      </div>

      {/* 1. GRAFİK KARTI: 24 Saatlik Piyasa Fiyat Trendi (gercek bir gunluk EPIAS verisi)*/}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Activity size={18} className="text-[#00E500]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">24 Saatlik Piyasa Fiyat Trendi</h2>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Şimdi: <span className="font-bold text-[#00E500]">₺{currentPrice}</span> / MWh
          </div>
        </div>
        
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f3f4f6" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                dy={10} 
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(value) => `₺${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
              
              {/* Geçmiş Veri (Yesil Kalın Çizgi) */}
              <Line 
                type="monotone" 
                dataKey="pastPrice" 
                stroke="#00E500" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#00E500', stroke: '#fff', strokeWidth: 2 }}
              />
              
              {/* Gelecek Veri (Gri Kesik Cizgi) */}
              <Line 
                type="monotone" 
                dataKey="futurePrice" 
                stroke="#d1d5db" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />
              
              {/* Şimdiki Zamanı Gösteren Dikey Çizgi */}
              {currentTime && (
                <ReferenceLine x={currentTime} stroke="#00E500" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. YAPAY ZEKA KARTI (detaylandirilacak )*/}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
          <Lightbulb size={24} className="text-gray-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Yapay Zeka Karar Desteği(detaylandirilacak)</p>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Öneri: BEKLE</h3>
          <p className="text-sm text-gray-600">Fiyatlar orta seviyede. Mevcut SOC'u koruyun ve trendi izleyin.</p>
        </div>
      </div>

      {/* 3. ALT İKİLİ KART (Kontrol Panelimiz / SOC Özeti) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Soldaki Kart: Manuel Kontrol Paneli */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Zap size={18} className="text-[#00E500]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Manuel Kontrol Paneli</h2>
            </div>
            
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Enerji Miktarı (MWh)
            </label>
            <input 
              type="number" 
              value={energyAmount}
              onChange={(e) => setEnergyAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/20 focus:border-[#00E500] transition-all text-gray-900 font-semibold"
              min="0"
              step="0.1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              onClick={() => setIsBuyModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#00E500] hover:bg-[#00c200] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              <ArrowDown size={18} />
              Şarj Et (Al)
            </button>
            
            <button 
              onClick={() => setIsSellModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-green-100 hover:border-[#00E500] text-[#00E500] py-3.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              <ArrowUp size={18} />
              Deşarj Et (Sat)
            </button>
          </div>
        </div>

        {/* Sagdaki Kart: Mevcut SOC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
           <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mevcut SOC</h2>
           <div className="text-4xl font-black text-[#00E500] mb-6">
             %{currentSoc.toFixed(1)}
           </div>

           {/* Progress Bar */}
           <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-[#00E500] rounded-full transition-all duration-1000"
                style={{ width: `${currentSoc}%` }}
              ></div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <p className="text-[10px] text-gray-500 font-semibold mb-1">Kullanılabilir</p>
                 <p className="text-xs font-bold text-gray-900">{availableCapacity} MWh</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <p className="text-[10px] text-gray-500 font-semibold mb-1">Boş Alan</p>
                 <p className="text-xs font-bold text-gray-900">{emptySpace} MWh</p>
              </div>
           </div>
        </div>

      </div>

      
      {/* ŞARJ ET (AL) */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Şarj İşlemini Onayla</h3>
              <button onClick={() => setIsBuyModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-5">Lütfen aşağıdaki işlem detaylarını onaylayın.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Enerji Miktarı</span>
                  <span className="text-sm font-bold text-gray-900">{energyAmount || 0} MWh</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Mevcut SOC</span>
                  <span className="text-sm font-bold text-gray-900">%48.0</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Piyasa Fiyatı (PTF)</span>
                  <span className="text-sm font-bold text-[#00E500]">₺{currentPrice} / MWh</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setIsBuyModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white"
              >
                İptal
              </button>
              <button 
                onClick={() => {
                  /* İleride API Call Gelecek */
                  setIsBuyModalOpen(false);
                }}
                className="px-8 py-2.5 rounded-xl bg-[#00E500] hover:bg-[#00c200] text-white font-bold text-sm transition-colors shadow-sm"
              >
                Al
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEŞARJ ET (SAT)*/}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Deşarj İşlemini Onayla</h3>
              <button onClick={() => setIsSellModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-5">Lütfen aşağıdaki işlem detaylarını onaylayın.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Enerji Miktarı</span>
                  <span className="text-sm font-bold text-gray-900">{energyAmount || 0} MWh</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Mevcut SOC</span>
                  <span className="text-sm font-bold text-gray-900">%48.0</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Piyasa Fiyatı (PTF)</span>
                  <span className="text-sm font-bold text-[#00E500]">₺{currentPrice} / MWh</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setIsSellModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white"
              >
                İptal
              </button>
              <button 
                onClick={() => {
                  /* İleride API Call Gelecek */
                  setIsSellModalOpen(false);
                }}
                className="px-8 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm"
              >
                Sat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}