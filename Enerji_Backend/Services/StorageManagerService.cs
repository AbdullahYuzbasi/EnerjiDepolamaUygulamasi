// Services klasörünü, iş kurallarını çalıştırmak ve veritabanı olmadığı için verileri RAM'de tutmak amacıyla kullanacağım!!!!
using System;
using System.Collections.Generic;
using Enerji_Backend.Models;

namespace Enerji_Backend.Services
{
    public class StorageManagerService
    {
        // Verileri RAM'de tutmak için private değişkenler oluşturdum.
        private readonly StorageState _state;
        private readonly SystemSettings _settings;
        private readonly List<Transaction> _transactions;

        public StorageManagerService()
        {
            // Başlangıç değerleriimiz
            _state = new StorageState();
            _settings = new SystemSettings();
            _transactions = new List<Transaction>();
            
            //Sistem başladığında grafiğin ve mevcut durumun dolu gözükmesi için SOC'yi %80 olarak ayarladım.
            _state.CurrentSoc = 80.0;
            _state.CurrentCapacity = 80.0; // 100 MWh kapasite varsayımıyla

            // Arayüz boş kalmasın diye test amaçlı sahte bir geçmiş işlemi ekledim.
            _transactions.Add(new Transaction 
            { 
                Id = "TX-1001", Type = "Şarj", Amount = 20, Loss = 1.0, 
                Efficiency = 95, Price = 1450.50, Soc = 60.0, 
                Operator = "Ahmet Yılmaz", Date = DateTime.Now.AddHours(-4).ToString("dd.MM.yyyy HH:mm:ss") 
            });
            
            _transactions.Add(new Transaction 
            { 
                Id = "TX-1002", Type = "Deşarj", Amount = 10, Loss = 0.0, 
                Efficiency = 95, Price = 2100.00, Soc = 50.0, 
                Operator = "Ayşe Demir", Date = DateTime.Now.AddHours(-2).ToString("dd.MM.yyyy HH:mm:ss") 
            });
            
            _transactions.Add(new Transaction 
            { 
                Id = "TX-1003", Type = "Şarj", Amount = 31.5, Loss = 1.5, 
                Efficiency = 95, Price = 1250.00, Soc = 80.0, 
                Operator = "Sistem (Oto)", Date = DateTime.Now.AddMinutes(-30).ToString("dd.MM.yyyy HH:mm:ss") 
            });
        }

        // Mevcut batarya durumunu getiren fonksiyon
        public StorageState GetState() => _state;

        // Mevcut ayarları getiren fonksiyo
        public SystemSettings GetSettings() => _settings;

        // Ayarları güncelleyen fonksiyon
        public void UpdateSettings(SystemSettings newSettings)
        {
            _settings.MaxCapacity = newSettings.MaxCapacity;
            _settings.MinSoc = newSettings.MinSoc;
            _settings.MaxSoc = newSettings.MaxSoc;
            _settings.Efficiency = newSettings.Efficiency;
        }

        // İşlem geçmişini getiren fonksiyonu yazdım.
        public List<Transaction> GetTransactions() => _transactions;

        // Şarj ve deşarj işlemlerini sınır ve verim kurallarına göre işleyen ana fonksiyon
        public string ProcessTransaction(string type, double amount, double price, string operatorName)
        {
            // SOC yüzdesini MWh cinsine çevirdim.
            double currentSocAmount = (_state.CurrentSoc / 100) * _settings.MaxCapacity;
            double newSocAmount = currentSocAmount;
            double loss = 0;
            double efficiencyMultiplier = _settings.Efficiency / 100.0;

            if (type == "Şarj")
            {
                // Şarj işleminde verim kaybını hesapladım.
                loss = amount * (1 - efficiencyMultiplier);
                double effectiveAmount = amount - loss;
                newSocAmount += effectiveAmount;
            }
            else if (type == "Deşarj")
            {
                // Deşarj işleminde kapasiteden doğrudan düşüm yaptım.
                newSocAmount -= amount;
            }
            else
            {
                return "Geçersiz işlem tipi.";
            }

            // Yeni miktarı tekrar yüzdeye (SOC) çevirdim.
            double newSocPercentage = (newSocAmount / _settings.MaxCapacity) * 100;

            // İşlemin güvenli SOC sınırlarını aşıp aşmadığını kontrol etdilen yer
            if (newSocPercentage < _settings.MinSoc)
                return $"İşlem reddedildi: Minimum SOC sınırı ({_settings.MinSoc}%) aşılamaz.";
                
            if (newSocPercentage > _settings.MaxSoc)
                return $"İşlem reddedildi: Maksimum SOC sınırı ({_settings.MaxSoc}%) aşılamaz.";

            // KURALLARA UYUYORSA yeni durumu hafızaya kaydettim.
            _state.CurrentSoc = newSocPercentage;
            _state.CurrentCapacity = newSocAmount;

            // Başarılı işlemi geçmiş tablosuna ekledim.
            var transaction = new Transaction
            {
                Id = "TX-" + new Random().Next(1001, 9999),
                Type = type,
                Amount = amount,
                Loss = loss,
                Efficiency = _settings.Efficiency,
                Price = price,
                Soc = newSocPercentage,
                Operator = operatorName,
                Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss"),
                IsCancelled = false // Ekledim: Normal başarılı işlemlerde iptal bayrağı false olur.
            };

            // En yeni işlem en üstte görünsün diye listenin en başına (0 =s indeks) ekledim.
            _transactions.Insert(0, transaction);

            return "Success";
        }

        // Ekledim: İşlemden vazgeçilme niyetini (İptal) batarya değerlerini HİÇ değiştirmeden loglayan özel fonksiyon.
        public void LogCancelledTransaction(string type, double amount, double price, string operatorName, string cancelReason)
        {
            var cancelledTransaction = new Transaction
            {
                Id = "TX-" + new Random().Next(1001, 9999),
                Type = type,
                Amount = amount,
                Loss = 0, // İşlem gerçekleşmediği için kayıp yok
                Efficiency = _settings.Efficiency,
                Price = price,
                Soc = _state.CurrentSoc, // Mevcut SOC değerine hiç dokunmadan logluyoruz
                Operator = operatorName,
                Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss"),
                IsCancelled = true, // İptal edildi damgasını vurduk
                CancelReason = cancelReason // İptal nedenini kaydettik
            };

            // Niyet edilen ancak iptal edilen işlemi de geçmiş tablosunun en üstüne ekledim.
            _transactions.Insert(0, cancelledTransaction);
        }
    }
}