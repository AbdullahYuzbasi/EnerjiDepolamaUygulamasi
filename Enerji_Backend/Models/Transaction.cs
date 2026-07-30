// Models klasörünü, uygulamada kullanacağım veri yapılarını ve nesne şablonlarını tanımlamak için kullanacağım!!!
namespace Enerji_Backend.Models
{
    public class Transaction
    {
        // İşlem detayları için özellikleri tanımladım.
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; 
        public double Amount { get; set; }
        public double Loss { get; set; }
        public double Efficiency { get; set; }
        public double Price { get; set; }
        public double Soc { get; set; }
        public string Operator { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;

        //Vazgeçilen/İptal edilen işlemleri loglamak için iki yeni özellik tanımladım.
        public bool IsCancelled { get; set; } = false;
        public string CancelReason { get; set; } = string.Empty;
    }
}