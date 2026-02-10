namespace IfsDashboardApi.DTOs;

public class MaliyetDto
{
    public string Site { get; set; } = "";

    public string MalzemeNo { get; set; } = "";
    public string? KonfId { get; set; }

    public string? MalzemeTanim { get; set; }
    public string? MuhGrubu { get; set; }

    public decimal? BirimMlyTr { get; set; }
    public decimal? BirimMlyUsd { get; set; }
    public decimal? BirimMlyEur { get; set; }

    public decimal? BrmMlzMlytTr { get; set; }
    public decimal? BrmMlzMlytUsd { get; set; }
    public decimal? BrmMlzMlytEur { get; set; }

    public decimal? BrmIscilikTr { get; set; }
    public decimal? BrmIscilikUsd { get; set; }
    public decimal? BrmIscilikEur { get; set; }

    public decimal? BrmFasonMlytTr { get; set; }
    public decimal? BrmFasonMlytUsd { get; set; }
    public decimal? BrmFasonMlytEur { get; set; }

    public decimal? ToplamMaliyetTr { get; set; }
    public decimal? ToplamMaliyetUsd { get; set; }
    public decimal? ToplamMaliyetEur { get; set; }

    public decimal? MalzemeMlytTr { get; set; }
    public decimal? MalzemeMlytUsd { get; set; }
    public decimal? MalzemeMlytEur { get; set; }

    public decimal? ToplamIscilikTr { get; set; }
    public decimal? ToplamIscilikUsd { get; set; }
    public decimal? ToplamIscilikEur { get; set; }

    public decimal? ToplamFasonMlytTr { get; set; }
    public decimal? ToplamFasonMlytUsd { get; set; }
    public decimal? ToplamFasonMlytEur { get; set; }
}