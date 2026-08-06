import { useState, useMemo, useEffect } from 'react'; 
//Bilgi balonu için 'Info' ikonunu dahil ettim.
import { Search, ArrowDown, ArrowUp, X, Filter, User, Info } from 'lucide-react';  

export default function History() {
  // Backend'den çekeceğim gerçek işlem geçmişi verilerini tutacağım state
  const [transactions, setTransactions] = useState([]);

  // --- FİLTRE DURUMLARI (STATES) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tümü");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterOperator, setFilterOperator] = useState("Tümü"); 
  const [showFilters, setShowFilters] = useState(false);

  // Sayfa yüklendiğinde backend'deki geçmiş işlemler listesini çekiyorum.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Tarayıcı önbelleğini kırmak için Control.jsx'teki aynı sert kuralları buraya da ekledim.
        const timestamp = new Date().getTime(); 
        const noCacheHeaders = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };

        const response = await fetch(`http://localhost:5252/api/storage/history?t=${timestamp}`, {
          headers: noCacheHeaders,
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data); 
        }
      } catch (error) {
        console.error("Geçmiş veriler backend'den çekilemedi:", error);
      }
    };
    
    fetchHistory();
  }, []);

  // --- DİNAMİK FİLTRELEME MANTIĞI ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Kelime Araması
      const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.date.includes(searchTerm);
      
      //  2. İşlem Tipi (Artık backend'den gelen IsCancelled bayrağına göre akıllı filtreleme yapıyoruz)
      const matchesType = (() => {
        if (filterType === "Tümü") return true;
        if (filterType === "İptal") return tx.isCancelled === true;
        // Eğer Şarj veya Deşarj seçildiyse, sadece BAŞARILI (iptal edilmemiş) olanları göster
        return tx.type === filterType && !tx.isCancelled;
      })();

      // 3. Minimum Fiyat 
      const matchesMinPrice = minPrice === "" || tx.price >= parseFloat(minPrice);
      // 4. Maksimum Fiyat 
      const matchesMaxPrice = maxPrice === "" || tx.price <= parseFloat(maxPrice);
      // 5. İşlemi Yapan Kişi filtresi 
      const matchesOperator = filterOperator === "Tümü" || tx.operator === filterOperator;

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesOperator;
    });
  }, [searchTerm, filterType, minPrice, maxPrice, filterOperator, transactions]); 

  // Tablodaki Rozetlerin Stillerini Belirleyen Fonksiyon 
  const getBadgeStyle = (tx) => {
    if (tx.isCancelled) {
      return { 
        bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200',
        icon: <X size={14} className="mr-1.5" />, label: 'İptal Edildi'
      };
    }

    switch (tx.type) {
      case 'Şarj':
        return { 
          bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200',
          icon: <ArrowDown size={14} className="mr-1.5" />, label: 'Şarj'
        };
      case 'Deşarj':
        return { 
          bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200',
          icon: <ArrowUp size={14} className="mr-1.5" />, label: 'Deşarj'
        };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', icon: null, label: tx.type };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* BASLIK*/}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm manuel ve otomatik işlemlerin geçmişi.</p>
      </div>

      {/* ANA TABLO KARTI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 space-y-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Arama cubugu*/}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="İşlem ID veya Tarih ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E500]/20 focus:border-[#00E500] transition-all bg-white"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-xl transition-colors flex items-center gap-2 text-sm font-medium ${showFilters ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtreler</span>
              </button>
            </div>

            {/* Kayıt Sayisi */}
            <div className="text-xs font-semibold text-gray-500 w-full sm:w-auto text-right">
              Toplam {transactions.length} kayıttan <span className="text-gray-900 font-bold">{filteredTransactions.length}</span> tanesi gösteriliyor.
            </div>
          </div>

          {/* Filtrelerimiz */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-200 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">İşlem Tipi</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00E500] bg-white"
                >
                  <option value="Tümü">Tümü</option>
                  <option value="Şarj">Şarj Edilenler</option>
                  <option value="Deşarj">Deşarj Edilenler</option>
                  <option value="İptal">İptal Edilenler</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">İşlemi Yapan</label>
                <select 
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00E500] bg-white"
                >
                  <option value="Tümü">Tümü</option>
                  <option value="Ahmet Yılmaz">Ahmet Yılmaz</option>
                  <option value="Ayşe Demir">Ayşe Demir</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Min. Piyasa Fiyatı (₺)</label>
                <input 
                  type="number"
                  placeholder="Örn: 1000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00E500] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Maks. Piyasa Fiyatı (₺)</label>
                <input 
                  type="number"
                  placeholder="Örn: 3000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00E500] bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">İşlem ID</th>
                <th className="px-6 py-4 whitespace-nowrap">İşlem Tipi</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Miktar (MWh)</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Verim Kaybı</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Verimlilik</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Piyasa Fiyatı</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">SOC Değeri</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">İşlemi Yapan</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Tarih / Saat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => {
                  const badge = getBadgeStyle(tx);
                  const isCancelled = tx.isCancelled; // Satırın soluk görünüp görünmeyeceğini belirleyen değişken

                  return (
                    <tr key={index} className={`transition-colors ${isCancelled ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                      
                      <td className={`px-6 py-4 font-semibold whitespace-nowrap ${isCancelled ? 'text-gray-400' : 'text-gray-800'}`}>
                        {tx.id}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                          
                          {isCancelled && tx.cancelReason && (
                            <div className="relative group flex items-center">
                              <Info size={16} className="text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                              {/* GÜNCELLEME: Yönlendirici sınıfları (top-full, mt-2 ve border-b) alta açılacak şekilde değiştirdim */}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block min-w-[200px] max-w-[320px] p-3 bg-gray-800 text-white text-[11px] rounded-lg shadow-xl z-50 whitespace-normal break-words">
                                <p className="font-bold text-gray-300 mb-1 border-b border-gray-600 pb-1">İptal Nedeni</p>
                                <p className="leading-relaxed">{tx.cancelReason}</p>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-gray-800"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className={`px-6 py-4 font-bold text-center whitespace-nowrap ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {tx.amount.toFixed(2)}
                      </td>
                      
                      <td className="px-6 py-4 text-gray-400 text-center whitespace-nowrap">
                        {tx.loss.toFixed(2)}
                      </td>
                      
                      <td className={`px-6 py-4 font-bold text-center whitespace-nowrap ${isCancelled ? 'text-gray-400' : 'text-[#00E500]'}`}>
                        %{tx.efficiency}
                      </td>
                      
                      <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>
                        ₺{tx.price.toFixed(2)}
                      </td>
                      
                      <td className={`px-6 py-4 font-semibold text-center whitespace-nowrap ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                        %{tx.soc.toFixed(1)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isCancelled ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                            <User size={10} />
                          </div>
                          <span className={`font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-700'}`}>
                            {tx.operator}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-gray-400 text-right text-xs whitespace-nowrap">
                        {tx.date}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                    Belirtilen filtrelere uygun işlem bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}