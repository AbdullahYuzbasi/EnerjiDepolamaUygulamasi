using Enerji_Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Controller (API Uçları) desteğini ekledim.
builder.Services.AddControllers();

// Swagger (API dökümantasyonu ve test aracı) desteğini ekledim.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Verilerimizin uygulama açık kaldığı sürece silinmemesi için servisi Singleton olarak sisteme kaydettim.
builder.Services.AddSingleton<StorageManagerService>();

// React uygulamamızın (port 5173) bu API'ye güvenle istek atabilmesi için CORS politikasını tanımladım.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            // Hem yerel test ortamına (localhost) hem de GitHub Pages canlı ortamına izin vermek istedim.
            policy.WithOrigins("http://localhost:5173", "https://abdullahyuzbasi.github.io") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Geliştirme ortamında Swagger'ı aktif ettim.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Frontend ile konuşabilmek için yazdığım CORS politikasını aktif ettim.
app.UseCors("AllowReactApp");

app.UseAuthorization();

// Controller yollarını haritalandırdım.
app.MapControllers();

app.Run();