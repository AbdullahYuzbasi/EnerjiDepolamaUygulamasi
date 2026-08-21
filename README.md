# EDYS Panel (Enerji Depolama Yönetim Sistemi)

## 🚀 Proje Kapsamı 

Bu proje, SOC (State of Charge) değerini izlemek, yönetmek ve enerji piyasası verilerine dayalı arbitraj (alım-satım) kararları vermek amacıyla geliştirilmiş bir web uygulamasıdır. Proje, React tabanlı bir Frontend ve .NET tabanlı bir Backend mimarisinden oluşmaktadır.

# ⚠️ ÖNEMLİ: GÜVENLİK VE KABUL EDİLEN RİSK (OWASP A01)

Projenin mevcut kapsamı ve bir prototip olması gereği, arayüzde çalışan rol tabanlı yetkilendirme (admin/operator) gerçek bir JWT (JSON Web Token) veya Session altyapısına dayanmamaktadır. Yetkilendirme işlemi, istemciden gönderilen statik bir string değere bağlı "Demo" amaçlı bir kurgudur. Bu durumun bir Kırık Erişim Kontrolü (Broken Access Control) zafiyeti yaratabileceğinin farkındalığıyla, proje ölçeği doğrultusunda bu durum bir **Kabul Edilen Risk (Accepted Risk)** olarak projelendirilmiş ve dokümante edilmiştir.

## 📝 Sürüm Notları ve Mimari (v3.4 Güncellemesi)

Bu sürümde auth ile ilgili aciklama yapilmak ve otomatik testler sisteme entegre edilmek istenmistir.

## 🧪 Otomatik Birim Testleri (Unit Tests)

Sistemin çekirdek iş kurallarını ve dayanıklılığını kanıtlamak için xUnit kullanarak aşağıdaki 5 otomatik test senaryosunu kurguladım:

1. **Negatif İşlem Koruması:** Sisteme negatif değer (Örn: -20) gönderildiğinde işlemin engellendiğini doğruladım.
2. **Aşırı Şarj (Overcharge) Koruması:** Maksimum güvenlik sınırını aşacak bir şarj komutunda sistemin işlemi reddettiğini test ettim.
3. **Aşırı Deşarj (Deep Discharge) Koruması:** Minimum sınırın altına inilmesine sebep olacak komutlarda sistemin işleme izin vermediğini ölçümledim.
4. **Asimetrik Verim Kaybı:** Verim kaybının asimetrik olarak ikiye bölündüğünü ve bataryaya net aktarımın fiziki kurallara uygun yapıldığını doğruladım.
5. **Batarya Sağlığı (SOH) Eskimesi:** Başarılı işlemler sonrası SOH değerinin dinamik olarak düştüğünü test ettim.

**Nasıl Çalıştırılır?**
Yeni bir terminal üzerinden test klasörüne girip test robotunu başlatabilirsiniz:
1. `cd Enerji_Backend.Tests`
2. `dotnet test`

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

*Not: Bu **v3.4** sürümü; önceki mimarinin üzerine otomatik birim testlerinin (Unit Test) eklendiği, güvenlik şeffaflığının sağlandığı stabil sürümdür.*