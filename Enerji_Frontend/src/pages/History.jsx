import { useState, useMemo } from 'react';
import { Search, ArrowDown, ArrowUp, X, Filter } from 'lucide-react';

// --- STATİK (MOCK) VERİLER ---
const mockTransactions = [
  { id: 'TX-1065', type: 'Deşarj', amount: 3.00, loss: 0.15, efficiency: 95, price: 1938.00, soc: 4.8, date: '23.07.2026 10:59:44' },
  { id: 'TX-1064', type: 'İptal', amount: 3.00, loss: 0.00, efficiency: 95, price: 1938.00, soc: 7.8, date: '23.07.2026 10:59:42' },
  { id: 'TX-1063', type: 'İptal', amount: 5.00, loss: 0.00, efficiency: 95, price: 1976.00, soc: 7.8, date: '23.07.2026 10:59:38' },
  { id: 'TX-1062', type: 'Şarj', amount: 5.00, loss: 0.25, efficiency: 95, price: 1976.00, soc: 7.8, date: '23.07.2026 10:59:36' },
  // Filtreleri test etmek için eklenmiş geçmiş veriler
  { id: 'TX-1061', type: 'Şarj', amount: 10.00, loss: 0.50, efficiency: 95, price: 1250.50, soc: 2.8, date: '22.07.2026 14:30:00' },
  { id: 'TX-1060', type: 'Deşarj', amount: 8.00, loss: 0.40, efficiency: 95, price: 4500.00, soc: 12.8, date: '21.07.2026 19:15:22' },
];

export default function History() {
  // --- FİLTRE DURUMLARI (STATES) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tümü");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Gelişmiş filtreleri aç/kapat

  // --- DİNAMİK FİLTRELEME MANTIĞI ---
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tx) => {
      // 1. Kelime Araması (ID veya Tarih içinde arama)
      const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.date.includes(searchTerm);
      
      // 2. İşlem Tipi Filtresi
      const matchesType = filterType === "Tümü" || tx.type === filterType;
      
      // 3. Minimum Fiyat Filtresi
      const matchesMinPrice = minPrice === "" || tx.price >= parseFloat(minPrice);
      
      // 4. Maksimum Fiyat Filtresi
      const matchesMaxPrice = maxPrice === "" || tx.price <= parseFloat(maxPrice);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice;
    });
  }, [searchTerm, filterType, minPrice, maxPrice]);

  // Tablodaki Rozetlerin (Badge) Stillerini Belirleyen Fonksiyon
  const getBadgeStyle = (type) => {
    switch (type) {
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
      case 'İptal':
        return { 
          bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200',
          icon: <X size={14} className="mr-1.5" />, label: 'İptal Edildi'
        };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', icon: null, label: type };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* BAŞLIK BÖLÜMÜ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm manuel ve otomatik işlemlerin geçmişi.</p>
      </div>

      {/* ANA TABLO KARTI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Üst Kısım: Arama ve Filtreler */}
        <div className="p-5 border-b border-gray-100 space-y-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Sol: Arama Çubuğu ve Gelişmiş Filtre Butonu */}
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

            {/* Sağ: Kayıt Sayısı Özeti */}
            <div className="text-xs font-semibold text-gray-500 w-full sm:w-auto text-right">
              Toplam {mockTransactions.length} kayıttan <span className="text-gray-900 font-bold">{filteredTransactions.length}</span> tanesi gösteriliyor.
            </div>
          </div>

          {/* Gelişmiş Filtreler (Açılır Kapanır Alan) */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200 animate-fade-in">
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

        {/* VERİ TABLOSU */}
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
                <th className="px-6 py-4 text-right whitespace-nowrap">Tarih / Saat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => {
                  const badge = getBadgeStyle(tx.type);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                        {tx.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-center whitespace-nowrap">
                        {tx.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-center whitespace-nowrap">
                        {tx.loss.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-[#00E500] font-bold text-center whitespace-nowrap">
                        %{tx.efficiency}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-right whitespace-nowrap">
                        ₺{tx.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-600 text-center whitespace-nowrap">
                        %{tx.soc.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-right text-xs whitespace-nowrap">
                        {tx.date}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
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