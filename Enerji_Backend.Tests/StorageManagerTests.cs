using Xunit;
using Enerji_Backend.Services;
using Enerji_Backend.Models;

namespace Enerji_Backend.Tests
{
    public class StorageManagerTests
    {
        // Her test senaryom için sıfırdan, temiz bir servis oluşturuyorum.
        // Başlangıç değerlerim: Mevcut Kapasite = 80 MWh, Max Kapasite = 100 MWh, Min Sınır = %15, Max Sınır = %90, Verim = %95
        private StorageManagerService CreateService()
        {
            return new StorageManagerService();
        }

        [Fact]
        public void Test1_NegativeAmount_ShouldReject()
        {
            // SENARYO 1: Kötü niyetli bir kullanıcının (veya sistemsel bir hatanın) negatif değer göndermesini test ettim.
            var service = CreateService();
            
            // Sisteme -20 MWh'lik bir şarj komutu gönderiyorum.
            var result = service.ProcessTransaction(TransactionTypes.Charge, -20.0, 1500, "Tester");
            
            // BEKLENTİM: Sistemin matematiği bozmamak için bu işlemi "Geçersiz miktar" diyerek reddetmesi.
            Assert.Contains("Geçersiz miktar", result);
        }

        [Fact]
        public void Test2_OverchargeLimit_ShouldReject()
        {
            // SENARYO 2: Bataryanın aşırı şarj edilip patlamasını/bozulmasını engelleme mantığını test ettim.
            var service = CreateService();
            
            // Bataryada halihazırda 80 MWh var (sınır %90). Ben 20 MWh daha ekleyip %100 yapmaya çalışıyorum.
            var result = service.ProcessTransaction(TransactionTypes.Charge, 20.0, 1500, "Tester");
            
            // BEKLENTİM: Sistemin donanımsal sınırları korumak adına "Maksimum SOC sınırı" uyarısı fırlatması.
            Assert.Contains("Maksimum SOC sınırı", result);
        }

        [Fact]
        public void Test3_OverDischargeLimit_ShouldReject()
        {
            // SENARYO 3: Bataryanın tamamen boşaltılıp (Deep Discharge) ölmesini engelleme mantığını test ettim.
            var service = CreateService();
            
            // Bataryada 80 MWh var. Güvenli alt sınır %15. Ben 70 MWh enerjiyi birden satıp (deşarj) bataryayı %10'a düşürmeyi deniyorum.
            var result = service.ProcessTransaction(TransactionTypes.Discharge, 70.0, 2000, "Tester");
            
            // BEKLENTİM: Sistemin kendini korumaya alıp "Minimum SOC sınırı" uyarısı vermesi.
            Assert.Contains("Minimum SOC sınırı", result);
        }

        [Fact]
        public void Test4_EfficiencyLoss_ShouldApplyAsymmetrically()
        {
            // SENARYO 4: Fizik kuralları gereği verim kaybının şarj ve deşarj anlarına asimetrik bölünmesini test ettim.
            var service = CreateService();
            
            // Sınır kalkanlarına takılmamak için limitleri esnetip, Verimi %90'a düşürdüm. Toplam kayıp %10 olacak.
            service.UpdateSettings(new SystemSettings { MaxCapacity = 100, MinSoc = 0, MaxSoc = 100, Efficiency = 90 });
            
            // 10 MWh şarj ediyorum. Beklentim %10 kaybın yarısının (%5) şarj girişinde erimesi.
            var result = service.ProcessTransaction(TransactionTypes.Charge, 10.0, 1500, "Tester");
            var state = service.GetState();

            // BEKLENTİM: İşlem başarılı olmalı ve bataryaya 10 değil, tam 9.5 MWh eklenmeli (80 + 9.5 = 89.5).
            Assert.Equal("Success", result);
            Assert.Equal(89.5, state.CurrentCapacity);
        }

        [Fact]
        public void Test5_SohDegradation_ShouldDecreaseOnSuccess()
        {
            // SENARYO 5: Başarılı her işlem döngüsünde batarya sağlığının (SOH) eskimesini simüle ettiğimi test ettim.
            var service = CreateService();
            var initialSoh = service.GetState().Soh; // Başlangıç SOH'u (98.5)
            
            // Sisteme küçük ve güvenli bir deşarj işlemi yaptırıyorum.
            service.ProcessTransaction(TransactionTypes.Discharge, 5.0, 2000, "Tester");
            
            var currentSoh = service.GetState().Soh;

            // BEKLENTİM: İşlemden sonra SOH değerinin ilk halinden daha düşük olması ve tam 0.1 azalmış olması.
            Assert.True(currentSoh < initialSoh);
            Assert.Equal(initialSoh - 0.1, currentSoh);
        }
    }
}