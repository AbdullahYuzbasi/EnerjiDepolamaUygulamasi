// Controllers klasörünü, React'ten gelecek olan internet isteklerini karşılamak ve yönlendirmek için kullanacağım!!!!!

using Microsoft.AspNetCore.Mvc;
using Enerji_Backend.Models;
using Enerji_Backend.Services;

namespace Enerji_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        private readonly StorageManagerService _storageService;

        // RAM'de çalışan Singleton servisi bu kapıya bağladım .
        public StorageController(StorageManagerService storageService)
        {
            _storageService = storageService;
        }

        [HttpGet("state")]
        public IActionResult GetState()
        {
            // Anlık SOC durumunu React'e döndüm.
            return Ok(_storageService.GetState());
        }

        [HttpGet("settings")]
        public IActionResult GetSettings()
        {
            // Mevcut sınır ayarlarını React'e döndüm.
            return Ok(_storageService.GetSettings());
        }

        [HttpPost("settings")]
        public IActionResult UpdateSettings([FromBody] SystemSettings newSettings)
        {
            // React'teki admin'den gelen yeni ayarları servise (hafıza) kaydettim.
            _storageService.UpdateSettings(newSettings);
            return Ok(new { message = "Ayarlar başarıyla güncellendi." });
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            // İşlem geçmişi listesini React'e döndüm.
            return Ok(_storageService.GetTransactions());
        }

        // React'ten gelen Alım/Satım komutlarını karşılamak için geçici bir veri modeli (DTO) tanımladım.
        public class TransactionRequest
        {
            public string Type { get; set; } = string.Empty;
            public double Amount { get; set; }
            public double Price { get; set; }
            public string Operator { get; set; } = string.Empty;
        }

        [HttpPost("transaction")]
        public IActionResult ProcessTransaction([FromBody] TransactionRequest request)
        {
            // React'ten gelen şarj/deşarj isteğini güvenlik kurallarından geçmesi için servise yolladım.
            var result = _storageService.ProcessTransaction(request.Type, request.Amount, request.Price, request.Operator);

            if (result == "Success")
            {
                // Kurallara uyduysa başarılı mesajı döndüm.
                return Ok(new { message = "İşlem başarıyla gerçekleştirildi." });
            }

            // Sınır aşımı varsa işlemi reddedip hata mesajını React'e döndüm.
            return BadRequest(new { message = result });
        }
    }
}