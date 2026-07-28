# EDYS Panel (Enerji Depolama Yönetim Sistemi)
Bu proje, SOC (State of Charge) değerini izlemek, yönetmek ve enerji piyasası verilerine dayalı arbitraj (alım-satım) kararları vermek amacıyla geliştirilmiş bir web uygulamasıdır. Proje, "Separation of Concerns" (Sorumlulukların Ayrılığı) prensibiyle React tabanlı bir Frontend ve .NET tabanlı bir Backend mimarisinden oluşmaktadır.

## 🚀 Proje Kapsamı ve Özellikler

- **Dashboard:** Anlık SOC durumu, mevcut kapasite, döngü verimliliği ve anlık piyasa fiyatlarının görselleştirilmesi.
- **İşlem ve Kontrol:** Sisteme manuel olarak şarj (alım) ve deşarj (satım) komutları gönderme. Yapay zeka tabanlı "Al/Sat/Bekle" karar destek simülasyonu.
- **İşlem Geçmişi (Audit Trail):** Yapılan tüm işlemlerin detaylı (Fiyat, MWh, Verim Kaybı) ve "İşlemi Yapan" bazlı olarak listelenmesi.
- **Sistem Ayarları & RBAC:** Minimum/Maksimum güvenli çalışma aralıklarının ve sistem verimliliğinin tanımlanması. Rol bazlı erişim kontrolü ile sadece "Admin" yetkisine sahip kullanıcıların ayarları değiştirebilmesi.
- **Dinamik Veri Yönetimi:** Arka planda çalışan Singleton tabanlı .NET servisi sayesinde verilerin RAM üzerinde güvenle tutulması ve iş kurallarının (limit ve verim kontrolleri) otonom olarak API seviyesinde denetlenmesi.

## 🛠 Kullanılan Teknolojiler

**Frontend:**
- React.js & React Router DOM
- Tailwind CSS & Lucide React (İkonlar)

**Backend:**
- .NET 8 (C#)
- ASP.NET Core Web API (Controllers & Singleton Services)
- Swagger / OpenAPI (API Dokümantasyonu)

## ⚙️ Kurulum ve Çalıştırma

Proje iki ayrı katmandan (Backend ve Frontend) oluştuğu için tam entegrasyonlu çalışması adına sırasıyla iki sunucunun da ayağa kaldırılması gerekmektedir.

### 1. Adım: Backend'i Başlatmak
1. Yeni bir terminal açın ve Backend klasörüne gidin: `cd Enerji_Backend`
2. Eksik paketleri yükleyin: `dotnet restore`
3. Sunucuyu ayağa kaldırın: `dotnet run`
*(Sunucu varsayılan olarak `http://localhost:5252` veya benzeri bir portta çalışmaya başlayacaktır. Terminali kapatmayın.)*

### 2. Adım: Frontend'i Başlatmak
1. Yeni bir terminal sekmesi açın ve Frontend klasörüne gidin: `cd Enerji_Frontend`
2. Gerekli kütüphaneleri yükleyin: `npm install`
3. React uygulamasını başlatın: `npm run dev`
*(Uygulama tarayıcınızda açılacaktır.)*

## 👤 Test Hesapları

Sistemin .NET API üzerinden çalışan yetkilendirme (Login) kısmını test etmek için aşağıdaki hesaplar kullanılabilir:

- **Sistem Yöneticisi (Admin):** `admin@edys.com` / `123` (Tam yetkili)
- **Tesis Operatörü (Operator):** `operator@edys.com` / `123` (Sadece okuma yetkisi)

*Not: Bu sürüm, önceki sürümlerde yapılan Frontend mimarisi üzerine Backend mimarisinin başladığı, klasör yapısının oluşturulduğu, ekstra olarak login ekranında kontrol yapılması ve devamında çalıştığının denenmesi ile ilgili bir sürümdür.*