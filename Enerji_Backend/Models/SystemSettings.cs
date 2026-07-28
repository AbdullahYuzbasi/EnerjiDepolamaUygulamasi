// Models klasörünü, uygulamada kullanacağım veri yapılarını ve nesne şablonlarını tanımlamak için kullanacağım!!!
namespace Enerji_Backend.Models
{
    public class SystemSettings
    {
        // Başlangıç ayarlarını varsayılan olarak atadım.
        public double MaxCapacity { get; set; } = 100.0;
        public double MinSoc { get; set; } = 15.0;
        public double MaxSoc { get; set; } = 90.0;
        public double Efficiency { get; set; } = 95.0;
    }
}