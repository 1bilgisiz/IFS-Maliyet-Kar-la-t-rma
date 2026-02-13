using IfsDashboardApi.DTOs;

namespace IfsDashboardApi.Services;

public interface IMaliyetService
{
    Task<IEnumerable<MaliyetDto>> Liste(string tepeKod);
}