namespace IfsDashboardApi.Repositories.Interfaces;

public interface IIfsRepository
{
    Task<IEnumerable<T>> QueryAsync<T>(string sql, object? param = null);
}