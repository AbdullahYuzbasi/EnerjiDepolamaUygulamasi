import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Lightbulb, ArrowDown, ArrowUp, Activity, Zap, AlertCircle, CheckCircle2, Calculator, TrendingUp, Loader2, X } from 'lucide-react'; 

export default function Control() {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  
  // Kontrol Paneli Durumları
  const [energyAmount, setEnergyAmount] = useState("5");
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // İptal modlarının kendi iç durumları
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Arka plan algoritmaları için gerekli sistem verileri
  const [systemData, setSystemData] = useState({ soc: 0, capacity: 0 });
  const [settings, setSettings] = useState({ maxCap: 100, min: 15, max: 90, eff: 95 });
  
  // Ekranın sağ altında çıkacak "Toast" bildiriminin durum yönetimi
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Yapay Zeka karar state'i
  const [aiDecision, setAiDecision] = useState({ action: "YÜKLENİYOR...", reason: "Piyasa verileri analiz ediliyor...", color: "text-gray-500", iconBg: "bg-gray-100", iconColor: "text-gray-600" });

  // Arka plan mantığı ve yapay zeka için anlık sistem verilerini çekiyorum
  const fetchBackendData = async () => {
    try {
      const timestamp = new Date().getTime(); 
      const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      const [stateRes, settingsRes] = await Promise.all([
        fetch(`http://localhost:5252/api/storage/state?t=${timestamp}`, { headers: noCacheHeaders, cache: 'no-store' }),
        fetch(`http://localhost:5252/api/storage/settings?t=${timestamp}`, { headers: noCacheHeaders, cache: 'no-store' })
      ]);

      const stateData = await stateRes.json();
      const settingsData = await settingsRes.json();

      setSystemData({ soc: stateData.currentSoc, capacity: stateData.currentCapacity });
      setSettings({ maxCap: settingsData.maxCapacity, min: settingsData.minSoc, max: settingsData.maxSoc, eff: settingsData.efficiency });
    } catch (error) {
      console.error("Backend verileri çekilemedi:", error);
    }
  };

  // Veri Çekme ve Grafik
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

        const processedData = data.map(item => {
          const itemHour = parseInt(item.saat.split(':')[0], 10);
          return {
            time: item.saat,
            pastPrice: itemHour <= currentHourInt ? item.fiyat : null,
            futurePrice: itemHour >= currentHourInt ? item.fiyat : null,
            fullPrice: item.fiyat 
          };
        });

        setChartData(processedData);
      } catch (error) {
        console.error("JSON Verisi çekilemedi:", error);
      }
    };

    fetchMarketData();
    fetchBackendData();
  }, []);

  // Yapay Zeka Karar Algoritması
  useEffect(() => {
    if (currentPrice > 0 && chartData.length > 0 && settings.maxCap > 0) {
      const avgPrice = chartData.reduce((acc, curr) => acc + curr.fullPrice, 0) / chartData.length;
      const isCheap = currentPrice < avgPrice * 0.90; 
      const isExpensive = currentPrice > avgPrice * 1.10; 

      if (systemData.soc >= settings.max) {
        setAiDecision({ action: "BEKLE", reason: `Maksimum doluluk sınırındasınız (%${settings.max}). Şarj işlemi yapılamaz, satım fırsatlarını izleyin.`, color: "text-blue-500", iconBg: "bg-blue-100", iconColor: "text-blue-600" });
      } else if (systemData.soc <= settings.min) {
        setAiDecision({ action: "AL (ŞARJ)", reason: `Batarya minimum sınırda (%${settings.min}). Sistemi korumak ve fırsatı kaçırmamak için şarj yapmalısınız.`, color: "text-[#00E500]", iconBg: "bg-green-100", iconColor: "text-[#00E500]" });
      } else if (isCheap) {
        setAiDecision({ action: "AL (ŞARJ)", reason: `Güncel fiyat (₺${currentPrice}) günlük ortalamanın (₺${avgPrice.toFixed(0)}) altında. Bataryayı ucuzken doldurmak kârlı olacaktır.`, color: "text-[#00E500]", iconBg: "bg-green-100", iconColor: "text-[#00E500]" });
      } else if (isExpensive) {
        setAiDecision({ action: "SAT (DEŞARJ)", reason: `Fiyatlar zirvede (₺${currentPrice}). Bataryadaki enerjiyi satarak maksimum kâr elde edebilirsiniz.`, color: "text-red-500", iconBg: "bg-red-100", iconColor: "text-red-600" });
      } else {
        setAiDecision({ action: "BEKLE", reason: "Fiyatlar ortalama seviyede. Şu an agresif bir alım veya satım yapmak yerine piyasayı izleyin.", color: "text-gray-700", iconBg: "bg-gray-100", iconColor: "text-gray-700" });
      }
    }
  }, [currentPrice, chartData, systemData, settings]);

  // Yardımcı Fonksiyon: İşlemi Yapanı Bul
  const getOperatorName = () => {
    const storedUser = JSON.parse(localStorage.getItem('edys_user') || '{}');
    if (storedUser.email === 'admin@edys.com') return "Ahmet Yılmaz";
    if (storedUser.email === 'operator@edys.com') return "Ayşe Demir";
    if (storedUser.role === 'admin') return "Sistem Yöneticisi";
    return "Sistem Otomasyonu";
  };

  // Toast Bildirimini tetikleyen fonksiyon
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Modalları ve state'leri temiz bir şekilde kapatan yardımcı fonksiyon
  const closeModal = () => {
    setIsBuyModalOpen(false);
    setIsSellModalOpen(false);
    setIsCancelMode(false);
    setCancelReason("");
  };

  // Alım/Satım İşlemi (Normal Akış)
  const handleTransaction = async (type) => {
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:5252/api/storage/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type, 
          amount: Number(energyAmount),
          price: Number(currentPrice),
          operator: getOperatorName()
        })
      });

      const data = await response.json(); 

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await fetchBackendData(); 
        
        setIsProcessing(false);
        setEnergyAmount("5");
        closeModal();
        
        showToast('success', 'İşlem başarıyla gerçekleştirildi.');
      } else {
        setIsProcessing(false);
        // Güncelledim: Sınır ihlali/Hata olduğunda da modal artık kapanacak
        closeModal();
        showToast('error', data.message || 'İşlem reddedildi.');
      }
    } catch (error) {
      setIsProcessing(false);
      // Güncelledim: Bağlantı hatası olduğunda da modal kapanacak
      closeModal();
      showToast('error', 'Sunucu ile iletişim kurulamadı.');
    }
  };

  // İptal İşlemini Backend'e Loglayan Fonksiyon
  const handleCancelTransaction = async (type) => {
    if (!cancelReason.trim()) {
      showToast('error', 'Lütfen bir iptal nedeni giriniz.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:5252/api/storage/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type, 
          amount: Number(energyAmount),
          price: Number(currentPrice),
          operator: getOperatorName(),
          cancelReason: cancelReason
        })
      });

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await fetchBackendData();
        
        setIsProcessing(false);
        closeModal();
        
        showToast('success', 'İptal işlemi sisteme başarıyla loglandı.');
      } else {
        setIsProcessing(false);
        //İptal loglanırken bir hata olsa bile modal kapanacak
        closeModal();
        showToast('error', 'İptal loglanırken bir hata oluştu.');
      }
    } catch (error) {
      setIsProcessing(false);
      // Bağlantı hatasında da kapanacak
      closeModal();
      showToast('error', 'Sunucu ile iletişim kurulamadı.');
    }
  };

  // Arbitraj Simülatörü hesaplamaları
  const maxDailyPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.fullPrice)) : 0;
  const simAmount = Number(energyAmount) || 0;
  const simCost = simAmount * currentPrice;
  const simRevenue = simAmount * maxDailyPrice;
  const simProfit = simRevenue - simCost;
  const isGoodArbitrage = simProfit > 0 && currentPrice < maxDailyPrice;

  // Özel Tooltip
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

      {/* 1. GRAFİK KARTI */}
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
              
              <Line 
                type="monotone" 
                dataKey="pastPrice" 
                stroke="#00E500" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#00E500', stroke: '#fff', strokeWidth: 2 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="futurePrice" 
                stroke="#d1d5db" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />
              
              {currentTime && (
                <ReferenceLine x={currentTime} stroke="#00E500" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. YAPAY ZEKA KARTI */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-start gap-4 transition-all">
        <div className={`w-12 h-12 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 ${aiDecision.iconBg}`}>
          <Lightbulb size={24} className={aiDecision.iconColor} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Yapay Zeka Karar Desteği</p>
          <h3 className={`text-lg font-bold mb-1 ${aiDecision.color}`}>Öneri: {aiDecision.action}</h3>
          <p className="text-sm text-gray-600">{aiDecision.reason}</p>
        </div>
      </div>

      {/* 3. İKİLİ KART DÜZENİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KOLON 1: Ticaret Terminali */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Zap size={18} className="text-[#00E500]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Ticaret Terminali</h2>
            </div>
            
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              İşlem Hacmi (MWh)
            </label>
            
            <div className="relative mb-3">
              <input 
                type="number" 
                value={energyAmount}
                onChange={(e) => setEnergyAmount(e.target.value)}
                className="w-full pl-6 pr-16 py-4 bg-gray-50 rounded-xl border-2 border-gray-200 focus:outline-none focus:bg-white focus:border-[#00E500] focus:ring-4 focus:ring-[#00E500]/10 transition-all text-gray-900 text-2xl font-black text-center"
                min="0"
                step="0.1"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                MWh
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
            <button 
              onClick={() => setIsBuyModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#00E500] hover:bg-[#00c200] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              <ArrowDown size={18} />
              Alış (Şarj)
            </button>
            <button 
              onClick={() => setIsSellModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-green-100 hover:border-[#00E500] text-[#00E500] py-3.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              <ArrowUp size={18} />
              Satış (Deşarj)
            </button>
          </div>
        </div>

        {/* KOLON 2: Arbitraj Projeksiyonu */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
          <div>
             <div className="flex items-center gap-2 text-gray-500 mb-6">
               <Calculator size={18} className="text-[#00E500]" />
               <h2 className="text-sm font-semibold uppercase tracking-wider">Arbitraj Projeksiyonu</h2>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-500">Mevcut Alış Maliyeti</span>
                   <span className="text-sm font-bold text-gray-900">₺{simCost.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-500">Maks. Satış Beklentisi</span>
                   <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₺{simRevenue.toLocaleString('tr-TR')}</p>
                      <p className="text-[10px] text-gray-400">₺{maxDailyPrice} / MWh zirvesinden</p>
                   </div>
                </div>
             </div>
          </div>
          
          <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${isGoodArbitrage ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
             <div className={`p-2 rounded-lg ${isGoodArbitrage ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <TrendingUp size={18} />
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tahmini Kâr</p>
                <p className={`text-xl font-black ${isGoodArbitrage ? 'text-[#00E500]' : 'text-gray-400'}`}>
                   {isGoodArbitrage ? `+₺${simProfit.toLocaleString('tr-TR')}` : 'Fırsat Yok'}
                </p>
             </div>
          </div>
        </div>

      </div>

      
      {/* ŞARJ ET (AL) MODAL */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Alış İşlemini Onayla</h3>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-5">Lütfen aşağıdaki işlem detaylarını onaylayın.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Enerji Miktarı</span>
                  <span className="text-sm font-bold text-gray-900">{energyAmount || 0} MWh</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Piyasa Fiyatı (PTF)</span>
                  <span className="text-sm font-bold text-[#00E500]">₺{currentPrice} / MWh</span>
                </div>
              </div>

              {isCancelMode && (
                <div className="mt-5 animate-fade-in">
                  <label className="block text-xs font-bold text-gray-600 mb-2">İptal Nedenini Belirtiniz *</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Örn: Yanlış miktar girildi, piyasa fiyatı aniden değişti..."
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-20"
                  />
                </div>
              )}
            </div>

            <div className="p-5 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100">
              {isCancelMode ? (
                <>
                  <button 
                    onClick={() => { setIsCancelMode(false); setCancelReason(""); }}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={() => handleCancelTransaction("Şarj")}
                    disabled={isProcessing || !cancelReason.trim()}
                    className="w-32 flex items-center justify-center py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin text-white" size={18} /> : "İptali Kaydet"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsCancelMode(true)}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white disabled:opacity-50"
                  >
                    İptal Et
                  </button>
                  <button 
                    onClick={() => handleTransaction("Şarj")}
                    disabled={isProcessing || !energyAmount || energyAmount <= 0}
                    className="w-24 flex items-center justify-center py-2.5 rounded-xl bg-[#00E500] hover:bg-[#00c200] text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin text-white" size={18} /> : "Onayla"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEŞARJ ET (SAT) MODAL */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Satış İşlemini Onayla</h3>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-5">Lütfen aşağıdaki işlem detaylarını onaylayın.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Enerji Miktarı</span>
                  <span className="text-sm font-bold text-gray-900">{energyAmount || 0} MWh</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Piyasa Fiyatı (PTF)</span>
                  <span className="text-sm font-bold text-[#00E500]">₺{currentPrice} / MWh</span>
                </div>
              </div>

              {isCancelMode && (
                <div className="mt-5 animate-fade-in">
                  <label className="block text-xs font-bold text-gray-600 mb-2">İptal Nedenini Belirtiniz *</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Örn: Yanlış miktar girildi, piyasa fiyatı aniden değişti..."
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-20"
                  />
                </div>
              )}
            </div>

            <div className="p-5 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100">
              {isCancelMode ? (
                <>
                  <button 
                    onClick={() => { setIsCancelMode(false); setCancelReason(""); }}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={() => handleCancelTransaction("Deşarj")}
                    disabled={isProcessing || !cancelReason.trim()}
                    className="w-32 flex items-center justify-center py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin text-white" size={18} /> : "İptali Kaydet"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsCancelMode(true)}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors bg-white disabled:opacity-50"
                  >
                    İptal Et
                  </button>
                  <button 
                    onClick={() => handleTransaction("Deşarj")}
                    disabled={isProcessing || !energyAmount || energyAmount <= 0}
                    className="w-24 flex items-center justify-center py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin text-white" size={18} /> : "Onayla"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zarif Toast Notification "Bildirim Kutusu" */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
            toast.type === 'success' ? 'border-green-100' : 'border-red-100'
          }`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              toast.type === 'success' ? 'bg-green-100 text-[#00E500]' : 'bg-red-100 text-red-500'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {toast.type === 'success' ? 'İşlem Başarılı' : 'Sınır İhlali / Hata'}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ show: false, type: '', message: '' })} 
              className="ml-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}