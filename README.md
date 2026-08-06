# EDYS Panel (Enerji Depolama Yönetim Sistemi)

## 🚀 Proje Kapsamı 

Bu proje, SOC (State of Charge) değerini izlemek, yönetmek ve enerji piyasası verilerine dayalı arbitraj (alım-satım) kararları vermek amacıyla geliştirilmiş bir web uygulamasıdır. Proje, React tabanlı bir Frontend ve .NET tabanlı bir Backend mimarisinden oluşmaktadır.

## 🚀 Proje Özellikler

- **Dashboard:** Anlık SOC durumu, mevcut kapasite, döngü verimliliği ve anlık piyasa fiyatlarının görselleştirilmesi. Ayar değişikliklerinde (maksimum kapasite vb.) SOC değerinin anında ve matematiksel olarak dinamik yeniden hesaplanması.
- **İşlem ve Kontrol:** Sisteme manuel olarak şarj (alım) ve deşarj (satım) komutları gönderme. Fiyat ve mevcut SOC verisine göre çalışan yapay zeka tabanlı "Al/Sat/Bekle" dinamik karar destek simülasyonu. 
- **İşlem Geçmişi (Audit Trail):** Gerçekleşen işlemlerin ve kullanıcı tarafından iptal edilen (Soft Cancel) eylemlerin detaylı (Fiyat, MWh, Verim Kaybı, İptal Nedeni) ve "İşlemi Yapan" bazlı olarak doğrudan API üzerinden canlı listelenmesi.
- **Sistem Ayarları & RBAC:** Minimum/Maksimum güvenli çalışma aralıklarının ve sistem verimliliğinin tanımlanması. Rol bazlı erişim kontrolü ile arayüzdeki formun yetkisiz kullanıcılara kilitlenmesi ve **Backend (C#) seviyesinde** 403 Forbidden koruması (Sadece "Admin" rolünün POST yapabilmesi).
- **Dinamik Veri Yönetimi:** Arka planda çalışan Singleton tabanlı .NET servisi sayesinde verilerin RAM üzerinde güvenle tutulması ve iş kurallarının (limit ve verim kontrolleri, State Desync önlemleri) otonom olarak API seviyesinde denetlenmesi.

## 🛠 Kullanılan Teknolojiler

**Frontend:**
- React.js & React Router DOM (Mimari ve Yönlendirme)
- Tailwind CSS (Stil ve Responsive Tasarım)
- Recharts (Dinamik Veri ve Grafik Görselleştirme)
- Lucide React (Vektörel Modern İkonlar)

**Backend:**
- **.NET 10 (C#)**
- ASP.NET Core Web API (Controllers & Singleton In-Memory Services)

## ⚙️ Kurulum ve Çalıştırma

Proje iki ayrı katmandan (Backend ve Frontend) oluştuğu için tam entegrasyonlu çalışması adına sırasıyla iki sunucunun da ayağa kaldırılması gerekmektedir. *(Not: Proje deposu optimize edilmiş olup gereksiz derleme çıktıları `.gitignore` ile yalıtılmıştır.)*

### 1. Adım: Backend'i Başlatmak
1. Yeni bir terminal açın ve Backend klasörüne gidin: `cd Enerji_Backend`
2. Eksik paketleri yükleyin: `dotnet restore`
3. Sunucuyu ayağa kaldırın: `dotnet run`
*(Sunucu varsayılan olarak `http://localhost:5252` veya benzeri bir portta çalışmaya başlayacaktır. Terminali kapatmayın.)*

### 2. Adım: Frontend'i Başlatmak
1. Yeni bir terminal sekmesi açın ve Frontend klasörüne gidin: `cd Enerji_Frontend`
2. Gerekli kütüphaneleri yükleyin: `npm install`
3. React uygulamasını başlatın: `npm run dev`
*(Uygulama tarayıcınızda ya da default olarak IDE üzerinde açılacaktır.)*

## 👤 Test Hesapları

Sistemin .NET API üzerinden çalışan yetkilendirme (Login) kısmını uçtan uca test etmek için aşağıdaki hesaplar kullanılabilir:

- **Sistem Yöneticisi (Admin):** `admin@edys.com` / `123` (Tam yetkili, Ayarlar sayfasını görüntüleyebilir ve değiştirebilir.)
- **Tesis Operatörü (Operator):** `operator@edys.com` / `123` (İşlem terminalini kullanabilir, Ayarlar sayfasını yalnızca okuyabilir - Backend API kalkanı ile korunmaktadır.)

---

*Not: Bu **v3.2** sürümü; önceki mimarinin üzerine eksik kısımların tamamen backend'e bağlandığı, kapasite değişiminde dinamik SOC algoritmasının devreye girdiği, C# tarafında rol doğrulaması yapıldığı ve gereksiz bin/obj dosyalarının repodan temizlendiği en güncel, stabil sürümüdür.*