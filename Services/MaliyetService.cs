using IfsDashboardApi.DTOs;
using IfsDashboardApi.Repositories.Interfaces;
using IfsDashboardApi.Repositories.Queries;

namespace IfsDashboardApi.Services;

public class MaliyetService : IMaliyetService
{
    private readonly IIfsRepository _repo;

    public MaliyetService(IIfsRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MaliyetDto>> Liste(string? malzemeNo, string? konfId, string? site)
    {
        return await _repo.QueryAsync<MaliyetDto>(
            MaliyetQueries.TrStdCostPartOwr,
            new
            {
                malzemeNo = string.IsNullOrWhiteSpace(malzemeNo) ? null : malzemeNo,
                konfId = string.IsNullOrWhiteSpace(konfId) ? null : konfId,
                site = string.IsNullOrWhiteSpace(site) ? null : site
            }
        );
    }
}