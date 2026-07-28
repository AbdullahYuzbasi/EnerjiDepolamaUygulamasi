// Models klasörünü, uygulamada kullanacağım veri yapılarını ve nesne şablonlarını tanımlamak için kullanacağım!!!
namespace Enerji_Backend.Models
{
    public class User
    {
        // Özellikleri (Property) tanımladım.
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
    }
}