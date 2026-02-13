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

    [HttpGet("liste")]
    public async Task<IActionResult> Liste([FromQuery] string? tepeKod)
    {
        if (string.IsNullOrWhiteSpace(tepeKod))
            return BadRequest("tepeKod zorunludur.");

        var data = await _service.Liste(tepeKod);
        return Ok(data);
    }
}