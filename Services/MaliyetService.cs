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

    public async Task<IEnumerable<MaliyetDto>> Liste(string tepeKod)
    {
        if (string.IsNullOrWhiteSpace(tepeKod))
            throw new ArgumentException("Tepe kod zorunludur.", nameof(tepeKod));

        return await _repo.QueryAsync<MaliyetDto>(
            MaliyetQueries.TrStdCostPartOwr,
            new
            {
                tepeKod
            }
        );
    }
}