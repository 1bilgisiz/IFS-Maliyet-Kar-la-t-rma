using System.Data;
using Dapper;
using Oracle.ManagedDataAccess.Client;
using IfsDashboardApi.Repositories.Interfaces;

namespace IfsDashboardApi.Repositories;

public class IfsRepository : IIfsRepository
{
    private readonly IConfiguration _config;

    public IfsRepository(IConfiguration config)
    {
        _config = config;
    }

    private IDbConnection CreateConnection()
    {
        var cs = _config.GetConnectionString("IfsDb");
        return new OracleConnection(cs);
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? param = null)
    {
        using var conn = CreateConnection();
        return await conn.QueryAsync<T>(sql, param);
    }
}