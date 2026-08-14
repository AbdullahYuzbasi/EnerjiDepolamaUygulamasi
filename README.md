# EDYS Panel (Enerji Depolama Yönetim Sistemi)

## 🚀 Proje Kapsamı 

Bu proje, SOC (State of Charge) değerini izlemek, yönetmek ve enerji piyasası verilerine dayalı arbitraj (alım-satım) kararları vermek amacıyla geliştirilmiş bir web uygulamasıdır. Proje, React tabanlı bir Frontend ve .NET tabanlı bir Backend mimarisinden oluşmaktadır.

## 🚀 Proje Özellikleri

- **Dashboard:** Anlık SOC durumu, mevcut kapasite, döngü verimliliği ve anlık piyasa fiyatlarının görselleştirilmesi. Ayar değişikliklerinde (maksimum kapasite vb.) SOC değerinin anında ve matematiksel olarak dinamik yeniden hesaplanması.
- **İşlem ve Kontrol:** Sisteme manuel olarak şarj (alım) ve deşarj (satım) komutları gönderme. Fiyat ve mevcut SOC verisine göre çalışan yapay zeka tabanlı "Al/Sat/Bekle" dinamik karar destek simülasyonu. 
- **İşlem Geçmişi (Audit Trail):** Gerçekleşen işlemlerin ve kullanıcı tarafından iptal edilen (Soft Cancel) eylemlerin detaylı (Fiyat, MWh, Verim Kaybı, İptal Nedeni) ve "İşlemi Yapan" bazlı olarak doğrudan API üzerinden canlı listelenmesi.
- **Sistem Ayarları & RBAC:** Minimum/Maksimum güvenli çalışma aralıklarının ve sistem verimliliğinin tanımlanması. Rol bazlı erişim kontrolü ile arayüzdeki formun yetkisiz kullanıcılara kilitlenmesi ve **Backend (C#) seviyesinde** 403 Forbidden koruması (Sadece "Admin" rolünün POST yapabilmesi).
- **Dinamik Veri Yönetimi:** Arka planda çalışan Singleton tabanlı .NET servisi sayesinde verilerin RAM üzerinde güvenle tutulması ve iş kurallarının (limit ve verim kontrolleri, State Desync önlemleri) otonom olarak API seviyesinde denetlenmesi.

## 📝 Sürüm Notları ve Mimari (v3.3 Güncellemesi)

Bu sürümde, değerlendirme raporunda belirtilen tüm bulgular analiz edilmiş, sisteme entegre edilmiş ve başarıyla çözülmüştür.

- **Kimlik Doğrulama (Fake Auth) ve Kabul Edilen Risk (OWASP A01):** Projenin mevcut kapsamı gereği, arayüzde çalışan rol tabanlı yetkilendirme (admin/operator) gerçek bir JWT (JSON Web Token) veya Session altyapısına dayanmamaktadır. Yetkilendirme işlemi, istemciden gönderilen statik bir string değere bağlı "Demo" amaçlı bir kurgudur. Bu durumun bir Kırık Erişim Kontrolü (Broken Access Control) zafiyeti yaratabileceğinin farkındalığıyla, proje ölçeği doğrultusunda bu durum bir **Kabul Edilen Risk (Accepted Risk)** olarak projelendirilmiştir.
- **Matematiksel Sistem Koruması:** Backend tarafındaki şarj/deşarj algoritmasına sıfıra bölme (Zero-Division), negatif işlem (`amount <= 0`) ve geçersiz sayı (`NaN`) kalkanları eklenmiştir.
- **Dinamik ve Kriptolojik Kimlikler:** Hızlı işlemlerde yaşanabilecek çakışmaları (Collision) önlemek adına, işlem kimlikleri `Random` sayı üretimi yerine evrensel benzersiz `Guid.NewGuid()` yapısına geçirilmiştir.
- **Verim Asimetrisi ve Dinamik SOH:** Gerçek hayat fiziğine uygun olarak, enerji verim kayıpları simetrik olarak şarj ve deşarj bacaklarına paylaştırılmıştır. Batarya sağlığı (SOH) statik bir değer olmaktan çıkarılıp, her işlemde dinamik olarak yıpranacak şekilde (Simülasyon) güncellenmiştir.
- **Merkezi URL Yönetimi ve CORS Optimizasyonu:** Frontend kodlarının içine gömülü olan sabit (hardcoded) `localhost` adresleri temizlenmiş ve tek bir merkezden yönetilmek üzere `.env` (`VITE_API_URL`) mimarisine geçilmiştir. Backend güvenlik duvarı (CORS), projenin yayına alınacağı `https://abdullahyuzbasi.github.io` adresine güvenli erişim verecek şekilde güncellenmiştir.

## 🛠 Kullanılan Teknolojiler

**Frontend:**
- React.js & React Router DOM (Mimari ve Yönlendirme)
- Tailwind CSS (Stil ve Responsive Tasarım)
- Recharts (Dinamik Veri ve Grafik Görselleştirme)
- Lucide React (Vektörel Modern İkonlar)
- Vite (.env Yönetimi ve Hızlı Derleme)

**Backend:**
- **.NET 10 (C#)**
- ASP.NET Core Web API (Controllers & Singleton In-Memory Services)
- DataAnnotations (Model Validation Koruması)

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

*Not: Bu **v3.3** sürümü; önceki mimarinin üzerine tüm "Düşük Öncelikli", "Orta Öncelikli" ve "Yüksek Öncelikli" güvenlik/matematik zafiyetlerinin giderildiği, URL'lerin merkezileştirildiği ve Enterprise (Kurumsal) kodlama standartlarının uygulandığı en güncel, stabil halidir.*