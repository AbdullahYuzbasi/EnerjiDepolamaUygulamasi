// Services klasörünü, iş kurallarını çalıştırmak ve veritabanı olmadığı için verileri RAM'de tutmak amacıyla kullanacağım!!!!
using System;
using System.Collections.Generic;
using Enerji_Backend.Models;

namespace Enerji_Backend.Services
{
    // Magic Strings(duzeltme): İşlem tiplerini sabitlere bağladım. 
    public static class TransactionTypes
    {
        public const string Charge = "Şarj";
        public const string Discharge = "Deşarj";
    }

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
            
            // Sistem başladığında grafiğin ve mevcut durumun dolu gözükmesi için SOC'yi %80 olarak ayarladım.
            _state.CurrentSoc = 80.0;
            _state.CurrentCapacity = 80.0; // 100 MWh kapasite varsayımıyla

            // DÜZELTME: Başlangıç mock verilerinde de Guid kullandım.
            _transactions.Add(new Transaction 
            { 
                Id = "TX-" + Guid.NewGuid().ToString().Substring(0,8).ToUpper(), Type = TransactionTypes.Charge, Amount = 20, Loss = 1.0, 
                Efficiency = 95, Price = 1450.50, Soc = 60.0, 
                Operator = "Ahmet Yılmaz", Date = DateTime.Now.AddHours(-4).ToString("dd.MM.yyyy HH:mm:ss") 
            });
            
            _transactions.Add(new Transaction 
            { 
                Id = "TX-" + Guid.NewGuid().ToString().Substring(0,8).ToUpper(), Type = TransactionTypes.Discharge, Amount = 10, Loss = 0.0, 
                Efficiency = 95, Price = 2100.00, Soc = 50.0, 
                Operator = "Ayşe Demir", Date = DateTime.Now.AddHours(-2).ToString("dd.MM.yyyy HH:mm:ss") 
            });
            
            _transactions.Add(new Transaction 
            { 
                Id = "TX-" + Guid.NewGuid().ToString().Substring(0,8).ToUpper(), Type = TransactionTypes.Charge, Amount = 31.5, Loss = 1.5, 
                Efficiency = 95, Price = 1250.00, Soc = 80.0, 
                Operator = "Sistem (Oto)", Date = DateTime.Now.AddMinutes(-30).ToString("dd.MM.yyyy HH:mm:ss") 
            });
        }

        // Mevcut batarya durumunu getiren fonksiyon
        public StorageState GetState() => _state;

        // Mevcut ayarları getiren fonksiyon
        public SystemSettings GetSettings() => _settings;

        // Ayarları güncelleyen fonksiyon
        public void UpdateSettings(SystemSettings newSettings)
        {
            // DÜZELTME: Ayar girdileri doğrulama
            if (newSettings.MaxCapacity <= 0 || newSettings.MinSoc >= newSettings.MaxSoc || newSettings.Efficiency <= 0 || newSettings.Efficiency > 100)
            {
                return; 
            }

            _settings.MaxCapacity = newSettings.MaxCapacity;
            _settings.MinSoc = newSettings.MinSoc;
            _settings.MaxSoc = newSettings.MaxSoc;
            _settings.Efficiency = newSettings.Efficiency;

            // Kapasite değiştiğinde Backend'deki SOC yüzdesini de anında yeniden hesapla!
            if (_settings.MaxCapacity > 0) 
            {
                _state.CurrentSoc = (_state.CurrentCapacity / _settings.MaxCapacity) * 100;
            }
        }

        // İşlem geçmişini getiren fonksiyonu yazdım.
        public List<Transaction> GetTransactions() => _transactions;

        // Şarj ve deşarj işlemlerini sınır ve verim kurallarına göre işleyen ana fonksiyon
        public string ProcessTransaction(string type, double amount, double price, string operatorName)
        {
            // DÜZELTME: Negatif miktar, NaN (Geçersiz Sayı) ve Sıfır Kapasite koruması eklendi.
            if (amount <= 0 || double.IsNaN(amount))
                return "İşlem reddedildi: Geçersiz miktar.";
            
            if (_settings.MaxCapacity <= 0)
                return "İşlem reddedildi: Sistem kapasitesi geçersiz (0). İşlem yapılamaz.";

            double newSocAmount = _state.CurrentCapacity; 
            double loss = 0;
            
            // DÜZELTME: Toplam kaybı bulup ikiye bölüyoruz (Yarısı şarjda, yarısı deşarjda olacak sekilde)
            double totalLossRate = 1.0 - (_settings.Efficiency / 100.0);
            double halfLossRate = totalLossRate / 2.0;

            if (type == TransactionTypes.Charge)
            {
                // Şarj olurken enerjinin bir kısmı ısıya dönüşüp kayboluyor
                loss = amount * halfLossRate;
                double effectiveAmount = amount - loss;
                newSocAmount += effectiveAmount;
            }
            else if (type == TransactionTypes.Discharge)
            {
                // Deşarj olurken de kayıp yaşanır. 
                loss = amount * halfLossRate;
                double totalDrawn = amount + loss;
                newSocAmount -= totalDrawn;
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
            
            // Her başarılı işlemde batarya sağlığı kucukte olsa eskir.
            if (_state.Soh > 50.0) 
            {
                _state.Soh -= 0.1; 
            }

            // Başarılı işlemi geçmiş tablosuna ekledim.
            var transaction = new Transaction
            {
                // DÜZELTME: Random ID yerine benzersiz (Unique) Guid yapısına geçildi.
                Id = "TX-" + Guid.NewGuid().ToString().Substring(0,8).ToUpper(),
                Type = type,
                Amount = amount,
                Loss = Math.Round(loss, 2), // Kaybı 2 ondalığa yuvarlayarak daha şık gösterelim
                Efficiency = _settings.Efficiency,
                Price = price,
                Soc = Math.Round(newSocPercentage, 2), 
                Operator = operatorName,
                Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss"),
                IsCancelled = false 
            };

            // En yeni işlem en üstte görünsün diye listenin en başına (0. indeks) ekledim.
            _transactions.Insert(0, transaction);

            return "Success";
        }

        public void LogCancelledTransaction(string type, double amount, double price, string operatorName, string cancelReason)
        {
            var cancelledTransaction = new Transaction
            {
                // DÜZELTME: Random ID iptal edilen işlemlerde de Guid olarak güncellendi.
                Id = "TX-" + Guid.NewGuid().ToString().Substring(0,8).ToUpper(),
                Type = type,
                Amount = amount,
                Loss = 0, // İşlem gerçekleşmediği için kayıp yok
                Efficiency = _settings.Efficiency,
                Price = price,
                Soc = Math.Round(_state.CurrentSoc, 2), 
                Operator = operatorName,
                Date = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss"),
                IsCancelled = true, 
                CancelReason = cancelReason 
            };

            _transactions.Insert(0, cancelledTransaction);
        }
    }
}