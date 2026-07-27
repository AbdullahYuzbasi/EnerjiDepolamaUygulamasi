# EDYS Panel (Enerji Depolama Yönetim Sistemi)
Bu proje, SOC değerini izlemek, yönetmek ve enerji piyasası verilerine dayalı arbitraj (alım-satım) kararları vermek amacıyla geliştirilmiş basit bir web uygulamasıdır.

## 🚀 Proje Kapsamı ve Özellikler

- **Dashboard:** Anlık SOC (State of Charge) durumu, mevcut kapasite, döngü verimliliği ve anlık piyasa fiyatlarının görselleştirilmesi.
- **İşlem ve Kontrol:** Sisteme manuel olarak şarj (alım) ve deşarj (satım) komutları gönderme. Yapay zeka tabanlı "Al/Sat/Bekle" karar destek simülasyonu.
- **İşlem Geçmişi (Audit Trail):** Yapılan tüm işlemlerin detaylı (Fiyat, MWh, Verim Kaybı) ve "İşlemi Yapan" (Operatör/Admin) bazlı olarak listelenmesi. Gelişmiş veri tablosu filtreleme mimarisi.
- **Sistem Ayarları & RBAC:** Minimum/Maksimum güvenli çalışma aralıklarının ve sistem verimliliğinin tanımlanması. Rol bazlı erişim kontrolü ile (Role-Based Access Control) sadece "Admin" yetkisine sahip kullanıcıların ayarları değiştirebilmesi.

## 🛠 Kullanılan Teknolojiler (Frontend)

- **React.js** 
- **Tailwind CSS** 
- **React Router DOM** (Sayfalar arası yönlendirme)

## 👤 Test Hesapları (Geliştirme Aşaması)

Sistemin yetkilendirme kısmını test etmek için aşağıdaki statik hesaplar kullanılabilir:

- **Sistem Yöneticisi (Admin):** `admin@edys.com` / `123` (Tam yetkili)
- **Tesis Operatörü (Operator):** `operator@edys.com` / `123` (Sadece okuma yetkisi)

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1. Repoyu klonlayın ya da indirin.
2. Klasöre gidin (yeni terminal açıp içine yazın): `cd Enerji_Frontend`
3. Bağımlılıkları yükleyin: `npm install`
4. Projeyi başlatın (yeni bir sekmede ya da IDE içinde açılır): `npm run dev`

---

*Not: Bu proje, Frontend ve Backend olarak iki kısımdan oluşacak şekilde tasarlanmıştır. v2.3 sürümüne kadar olan kısım, mimarinin React tabanlı Frontend kısmının temsil etmektedir.*