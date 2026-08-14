import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Sun, Wind, ArrowDownRight, ArrowUpRight, Activity, Clock, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [marketData, setMarketData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  
  const [fullDayHistory, setFullDayHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Backend'den gelecek olan verileri tutacağımız dinamik stateler. (SOH buraya eklendi!)
  const [systemData, setSystemData] = useState({ soc: 0, capacity: 0, soh: 98.5 });
  const [settings, setSettings] = useState({ maxCap: 100, min: 15, max: 90, eff: 95 });
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ totalIn: 0, totalOut: 0, totalLoss: 0 });

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

    //Backend'deki State, Ayarlar ve Geçmiş verileri çekiyorum.
    const fetchBackendData = async () => {
      try {
        // DÜZELTME: Sabit localhost adresleri yerine .env dosyasındaki VITE_API_URL değişkenini kullandım.
        const [stateRes, settingsRes, historyRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/storage/state`),
          fetch(`${import.meta.env.VITE_API_URL}/api/storage/settings`),
          fetch(`${import.meta.env.VITE_API_URL}/api/storage/history`)
        ]);

        const stateData = await stateRes.json();
        const settingsData = await settingsRes.json();
        const historyData = await historyRes.json();

        // 1. SOC, Kapasite ve SOH (Sağlık) güncelliyorum
        const dynamicSoc = (stateData.currentCapacity / settingsData.maxCapacity) * 100;
        
        // DÜZELTME: Backend'den gelen SOH (Sağlık) verisini de state'e kaydediyoruz!
        setSystemData({ 
          soc: dynamicSoc, 
          capacity: stateData.currentCapacity,
          soh: stateData.soh 
        });
        
        // 2. Limit ayarlarını güncelliyorum
        setSettings({ 
          maxCap: settingsData.maxCapacity, 
          min: settingsData.minSoc, 
          max: settingsData.maxSoc, 
          eff: settingsData.efficiency 
        });

        // 3. Geçmiş işlemlere bakarak Giren/Çıkan toplam enerjiyi hesaplıyorum
        let tIn = 0, tOut = 0, tLoss = 0;
        historyData.forEach(tx => {
          // İptal edilen işlemleri toplam hesaplamalarından çıkardım ki metriklerimiz doğru sonuç versin.
          if (!tx.isCancelled) {
            if (tx.type === 'Şarj') {
              tIn += tx.amount;
              tLoss += tx.loss;
            } else if (tx.type === 'Deşarj') {
              tOut += tx.amount;
            }
          }
        });
        setMetrics({ totalIn: tIn, totalOut: tOut, totalLoss: tLoss });

        // 4. Grafiği doğru (soldan sağa) çizebilmesi için verileri tarihe göre sıralıyorum
        const parseDate = (d) => {
          const [datePart, timePart] = d.split(' ');
          const [day, month, year] = datePart.split('.');
          return new Date(`${year}-${month}-${day}T${timePart}`);
        };

        const sortedHistory = [...historyData].sort((a, b) => parseDate(a.date) - parseDate(b.date));
        
        // İptal edilen işlemleri grafikten süzdüm ve noktaların ezilmemesi için saniyeleri kırpan kısmı kaldırdım.
        const formattedChart = sortedHistory
          .filter(tx => !tx.isCancelled)
          .map(tx => {
            const timeStr = tx.date.split(' ')[1]; // "06:00:20" -> "06:00:20"
            return { time: timeStr, soc: tx.soc };
          });
        
        setChartData(formattedChart);

      } catch (error) {
        console.error("Backend verileri çekilemedi:", error);
      }
    };

    fetchMarketData();
    fetchBackendData();
  }, []);

  // SOC Yüzdesine Göre Durumlar (Limitleri backend'den gelen settings'e bağladım)
  const getSocBadge = (soc) => {
    if (soc <= settings.min) return { text: "KRİTİK DÜŞÜK", className: "bg-red-100 text-red-700 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]" };
    if (soc <= settings.min + 20) return { text: "DÜŞÜK", className: "bg-orange-100 text-orange-700 border-orange-300" };
    if (soc <= settings.max - 15) return { text: "NORMAL", className: "bg-blue-100 text-blue-700 border-blue-300" };
    if (soc < settings.max) return { text: "YÜKSEK", className: "bg-green-100 text-green-700 border-green-300" };
    return { text: "TAM KAPASİTE", className: "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]" };
  };
  const socBadge = getSocBadge(systemData.soc);

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
            {/* Pie grafigi (Verileri backend state'e bağladım) */}
            <div className="w-32 h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: systemData.soc }, { value: Math.max(0, 100 - systemData.soc) }]}
                    innerRadius={45}
                    outerRadius={60}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill={systemData.soc <= settings.min ? "#ef4444" : "#00E500"} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{systemData.soc.toFixed(1)}%</span>
                <span className="text-xs text-gray-400 uppercase">SOC</span>
              </div>
            </div>
            
            {/* Sağ Taraftaki Teknik Bilgiler */}
            <div className="space-y-4 w-full">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mevcut Kapasite</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{systemData.capacity.toFixed(1)}</span>
                  <span className="text-sm text-gray-500 font-medium">MWh</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Maks. Kapasite</p>
                  <p className="text-xs text-gray-900 font-semibold">{settings.maxCap} MWh</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SOH (Sağlık)</p>
                  {/* DÜZELTME: SOH verisi artık statik değil, systemData objesinden dinamik olarak geliyor! */}
                  <p className="text-xs text-gray-900 font-semibold">%{systemData.soh.toFixed(1)}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 pt-1">
                {/* Rozet Tasarımı */}
                <span className={`inline-flex items-center w-max px-3 py-1.5 text-[10px] uppercase rounded-md border ${socBadge.className}`}>
                  <span className="font-semibold opacity-70 mr-1">SEVİYE:</span>
                  <span className="font-extrabold">{socBadge.text}</span>
                </span>
                <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1">
                  Güvenli Aralık: %{settings.min} - %{settings.max}
                </p>
              </div>
            </div>
          </div>

          {/* Dinamik Uyarı Banner'ı - Limitleri backend'den gelen değerlere bağladım */}
          <div className={`p-3 rounded-xl flex items-center gap-3 border transition-colors duration-300 ${
            systemData.soc <= settings.min ? 'bg-red-50/50 border-red-200 text-red-700' :
            systemData.soc >= settings.max ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' :
            'bg-blue-50/50 border-blue-200 text-blue-700'
          }`}>
            <div className="shrink-0">
              {systemData.soc <= settings.min || systemData.soc >= settings.max ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <p className="text-[11.5px] font-medium leading-relaxed">
              {systemData.soc <= settings.min 
                ? `Kritik Seviye: Batarya güvenli alt sınırın (%${settings.min}) altına düştü, deşarj durduruldu.` 
                : systemData.soc >= settings.max 
                ? `Uyarı: Batarya güvenli üst sınıra (%${settings.max}) ulaştı, şarj durduruldu.` 
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

      {/* Ortadaki kartlar (Hesaplamaları dinamik state'e bağladım) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <ArrowDownRight size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Giren Enerji</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#00E500]">{metrics.totalIn.toFixed(1)}</span>
            <span className="text-sm font-medium text-gray-500">MWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <ArrowUpRight size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Çıkan Enerji</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#00E500]">{metrics.totalOut.toFixed(1)}</span>
            <span className="text-sm font-medium text-gray-500">MWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <Activity size={16} className="text-[#00E500]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Döngü Verimliliği</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-[#00E500]">%{(settings.eff).toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-400">Kayıp: -{metrics.totalLoss.toFixed(1)} MWh</p>
        </div>
      </div>

      {/* ALT GRAFİK BÖLÜMÜ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Activity size={18} className="text-[#00E500]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Geçmiş Batarya Doluluk Oranı (SOC)</h2>
            </div>
            {chartData.length === 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-1 rounded-md">
                  Veri Bekleniyor
              </span>
            )}
        </div>
        
        <div className="h-72 w-full relative">
            {/* Eğer chartData boşsa blur ve uyarı yazısı devreye giriyor */}
            {chartData.length === 0 && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                  <p className="text-sm font-semibold text-gray-500 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
                    İşlem ve Kontrol sayfasından aktivite yapıldığında grafik güncellenecektir.
                  </p>
              </div>
            )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
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
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}