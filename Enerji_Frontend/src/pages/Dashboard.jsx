import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Sun, Wind, ArrowDownRight, ArrowUpRight, Activity, Clock, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [marketData, setMarketData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  
  const [fullDayHistory, setFullDayHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // SOC Değeri ve Kapasite (simdilik statik yapıda)
  const currentSoc = 48;
  const currentCapacity = 48.5; // MWh

  // --- DİNAMİK VERİ VE SAAT HESAPLAMALARI ---
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/data/PiyasaFiyatveDurumlar.json');
        const data = await response.json();

        // sistem saati bulma
        const currentHourInt = new Date().getHours();
        const formattedHour = `${currentHourInt.toString().padStart(2, '0')}:00`;
        setCurrentTime(formattedHour);

        const activeData = data.find(item => item.saat === formattedHour) || data[0];

        // tum gun gecmiş veriler için
        const pastData = data.filter(item => {
            const itemHour = parseInt(item.saat.split(':')[0], 10);
            return itemHour < currentHourInt;
        }).reverse(); 
        
        setFullDayHistory(pastData);
        setMarketData(activeData);
      } catch (error) {
        console.error("JSON Verisi çekilemedi:", error);
      }
    };

    fetchMarketData();
  }, []);

  // 30 dakikalık aralıklar - x ekseni için
  const generateEmptyChartData = () => {
    const data = [];
    const currentHour = new Date().getHours();
    
    // geçmiş 6 saati 30dk aralıklarla gösterimi
    for (let i = 6; i >= 0; i--) {
      const hour = (currentHour - i + 24) % 24;
      const formattedHour = hour.toString().padStart(2, '0');
      data.push({ time: `${formattedHour}:00`, soc: null });
      if (i !== 0) {
          data.push({ time: `${formattedHour}:30`, soc: null });
      }
    }
    return data;
  };
  const emptyChartData = generateEmptyChartData();

  // SOC Yüzdesine Göre Durumlar
  const getSocBadge = (soc) => {
    if (soc <= 15) return { text: "KRİTİK DÜŞÜK", className: "bg-red-100 text-red-700 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]" };
    if (soc <= 35) return { text: "DÜŞÜK", className: "bg-orange-100 text-orange-700 border-orange-300" };
    if (soc <= 75) return { text: "NORMAL", className: "bg-blue-100 text-blue-700 border-blue-300" };
    if (soc <= 94) return { text: "YÜKSEK", className: "bg-green-100 text-green-700 border-green-300" };
    return { text: "TAM KAPASİTE", className: "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]" };
  };
  const socBadge = getSocBadge(currentSoc);

  // PTF Fiyatına Göre Renkler
  const getPriceColor = (durum) => {
    if (durum === "Pahali") return "text-red-500";
    if (durum === "Ucuz") return "text-green-500";
    return "text-orange-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* BAŞLIK BÖLÜMÜ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-500 mt-1">Depolama sisteminin genel durum özeti.</p>
      </div>

      {/* ÜST İKİLİ KART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sol Kart: SOC, SOH, Limitler ve Dinamik Banner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Battery size={18} className="text-[#00E500]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Batarya Doluluk Oranı (SOC)</h2>
          </div>
          
          <div className="flex items-center gap-8">
            {/* Pie grafigi */}
            <div className="w-32 h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: currentSoc }, { value: 100 - currentSoc }]}
                    innerRadius={45}
                    outerRadius={60}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill={currentSoc <= 15 ? "#ef4444" : "#00E500"} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{currentSoc}%</span>
                <span className="text-xs text-gray-400 uppercase">SOC</span>
              </div>
            </div>
            
            {/* Sağ Taraftaki Teknik Bilgiler */}
            <div className="space-y-4 w-full">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mevcut Kapasite</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{currentCapacity}</span>
                  <span className="text-sm text-gray-500 font-medium">MWh</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Maks. Kapasite</p>
                  <p className="text-xs text-gray-900 font-semibold">100 MWh</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SOH (Sağlık)</p>
                  <p className="text-xs text-gray-900 font-semibold">%98.5</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 pt-1">
                {/* Rozet Tasarımı */}
                <span className={`inline-flex items-center w-max px-3 py-1.5 text-[10px] uppercase rounded-md border ${socBadge.className}`}>
                  <span className="font-semibold opacity-70 mr-1">SEVİYE:</span>
                  <span className="font-extrabold">{socBadge.text}</span>
                </span>
                <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1">Güvenli Aralık: %15 - %90</p>
              </div>
            </div>
          </div>

          {/* Dinamik Uyarı Banner'ı - SOC Kartı İçinde */}
          <div className={`p-3 rounded-xl flex items-center gap-3 border transition-colors duration-300 ${
            currentSoc <= 15 ? 'bg-red-50/50 border-red-200 text-red-700' :
            currentSoc >= 95 ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' :
            'bg-blue-50/50 border-blue-200 text-blue-700'
          }`}>
            <div className="shrink-0">
              {currentSoc <= 15 || currentSoc >= 95 ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <p className="text-[11.5px] font-medium leading-relaxed">
              {currentSoc <= 15 
                ? 'Kritik Seviye: Batarya güvenli alt sınırın (%15) altına düştü, deşarj durduruldu.' 
                : currentSoc >= 95 
                ? 'Uyarı: Batarya tam kapasiteye ulaştı, şarj durduruldu.' 
                : 'Sistem stabil. Batarya doluluğu güvenli işletme aralığında.'}
            </p>
          </div>
        </div>

        {/* Sağ Kart: Piyasa ve Çevresel Veriler */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-start gap-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Activity size={18} className="text-[#00E500]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Canlı Çevresel Faktörler ve Piyasa ({currentTime})</h2>
          </div>

          {marketData ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                  {/* Güneş Verilerı */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-yellow-500 shrink-0">
                      <Sun size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Güneş Üretimi</p>
                      <p className="font-semibold text-gray-900">{marketData.gunesDurumu}</p>
                    </div>
                  </div>

                  {/* Rüzgar Verilerı */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-400 shrink-0">
                      <Wind size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Rüzgar Hızı</p>
                      <p className="font-semibold text-gray-900">{marketData.ruzgarHizi} km/s</p>
                    </div>
                  </div>
              </div>

              {/* PTF Fiyatları */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Güncel Piyasa Fiyatı (PTF)</p>
                <div className="flex flex-col gap-2">
                   {/* Anlık Fiyat */}
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${getPriceColor(marketData.durum)}`}>
                      ₺{marketData.fiyat}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">/ MWh</span>
                  </div>
                </div>
              </div>

              {/* TÜM GÜN GEÇMİŞİ */}
              <div className="mt-2 pt-2 border-t border-gray-100 border-dashed">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#00E500] hover:bg-green-50 rounded-lg transition-colors"
                >
                  {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showHistory ? 'Geçmişi Gizle' : 'Gün İçi Geçmiş Verileri Gör'}
                </button>

                {showHistory && (
                  <div className="mt-3 max-h-32 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent animate-fade-in">
                    {fullDayHistory.length > 0 ? (
                      fullDayHistory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                            <Clock size={14} className="text-gray-400" />
                            {item.saat}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-medium">
                            <span className="flex items-center gap-1 text-gray-600" title="Güneş">
                              <Sun size={12} className="text-yellow-500" /> {item.gunesDurumu}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600" title="Rüzgar">
                              <Wind size={12} className="text-blue-400" /> {item.ruzgarHizi}
                            </span>
                            <span className={`font-bold text-xs ${getPriceColor(item.durum)}`}>
                              ₺{item.fiyat}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-3">
                        Günün ilk saati olduğu için henüz geçmiş veri bulunmuyor.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Veriler yükleniyor...
            </div>
          )}
        </div>
      </div>

      {/* Ortadaki kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <ArrowDownRight size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Giren Enerji</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#00E500]">545.0</span>
            <span className="text-sm font-medium text-gray-500">MWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <ArrowUpRight size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Çıkan Enerji</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#00E500]">545.2</span>
            <span className="text-sm font-medium text-gray-500">MWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <Activity size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Döngü Verimliliği</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-[#00E500]">100.0%</span>
          </div>
          <p className="text-xs text-gray-400">Kayıp: -0.2 MWh</p>
        </div>
      </div>

      {/* ALT GRAFİK BÖLÜMÜ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Activity size={18} className="text-[#00E500]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Geçmiş Batarya Doluluk Oranı (SOC)</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-1 rounded-md">
                Veri Bekleniyor
            </span>
        </div>
        
        <div className="h-72 w-full relative">
            {/* Boş grafik için blur efekti ve uyarımız */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                 <p className="text-sm font-semibold text-gray-500 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
                    İşlem ve Kontrol sayfasından aktivite yapıldığında grafik güncellenecektir.
                 </p>
            </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emptyChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f3f4f6" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
                dy={10} 
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
              <Line 
                type="monotone" 
                dataKey="soc" 
                stroke="#00E500" 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}