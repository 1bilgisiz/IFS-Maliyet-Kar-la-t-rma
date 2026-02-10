using IfsDashboardApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace IfsDashboardApi.Controllers;

[ApiController]
[Route("api/maliyet")]
public class MaliyetController : ControllerBase
{
    private readonly IMaliyetService _service;

    public MaliyetController(IMaliyetService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? malzemeNo, [FromQuery] string? konfId, [FromQuery] string? site)
    {
        var data = await _service.Liste(malzemeNo, konfId, site);
        return Ok(data);
    }
}