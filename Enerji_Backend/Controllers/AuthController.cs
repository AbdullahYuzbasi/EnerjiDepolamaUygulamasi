// Controllers klasörünü, React'ten gelecek olan internet isteklerini karşılamak ve yönlendirmek için kullanacağım!!!!!

using Microsoft.AspNetCore.Mvc;
using Enerji_Backend.Models;
using System.Collections.Generic;
using System.Linq;

namespace Enerji_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Gelen e-posta ve şifreyi karşılamak için geçici bir veri modeli (DTO) tanımladım.
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // VERİTABANIMIZ OLMADIĞI İÇİN statik kullanıcı listemi doğrudan burada oluşturdum.
            var users = new List<User>
            {
                new User { Email = "admin@edys.com", Password = "123", Name = "Ahmet Yılmaz", Role = "admin", Title = "Sistem Yöneticisi" },
                new User { Email = "operator@edys.com", Password = "123", Name = "Ayşe Demir", Role = "operator", Title = "Tesis Operatörü" }
            };

            // React'ten gelen bilgilerle listemdeki kullanıcı eşleşiyor mu diye kontrol ettim.
            var user = users.FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);

            if (user != null)
            {
                // Güvenlik gereği şifreyi Frontend'e geri göndermemek için sildim.
                user.Password = "";
                return Ok(user);
            }

            // Eşleşme yoksa React tarafına 401 Yetkisiz hatası ve mesajı döndüm.
            return Unauthorized(new { message = "E-posta veya şifre hatalı. Lütfen tekrar deneyin." });
        }
    }
}