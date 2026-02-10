using Dapper;
using IfsDashboardApi.Repositories;
using IfsDashboardApi.Repositories.Interfaces;
using IfsDashboardApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Dapper
DefaultTypeMap.MatchNamesWithUnderscores = true;

// DI
builder.Services.AddScoped<IIfsRepository, IfsRepository>();
builder.Services.AddScoped<IMaliyetService, MaliyetService>();

builder.Services.AddControllers();

var app = builder.Build();

// 1️⃣ Static files ÖNCE
app.UseDefaultFiles();   // index.html
app.UseStaticFiles();    // css / js

// 2️⃣ Routing
app.UseRouting();

// 3️⃣ API
app.MapControllers();

// 4️⃣ SADECE UI için fallback
app.MapFallback(context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

app.Run();