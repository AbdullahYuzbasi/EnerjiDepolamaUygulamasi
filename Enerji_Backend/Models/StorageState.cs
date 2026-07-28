// Models klasörünü, uygulamada kullanacağım veri yapılarını ve nesne şablonlarını tanımlamak için kullanacağım!!!
namespace Enerji_Backend.Models
{
    public class StorageState
    {
        // Anlık batarya verilerinin varsayılan değerlerini atadım.
        public double CurrentSoc { get; set; } = 48.0; 
        public double CurrentCapacity { get; set; } = 48.0; 
        public double Soh { get; set; } = 98.5; 
    }
}