namespace IfsDashboardApi.Repositories.Queries;

public static class MaliyetQueries
{
     public const string TrStdCostPartOwr = @"
SELECT
       po.contract              AS site,
       po.part_no               AS malzeme_no,
       po.configuration_id      AS konf_id,
       ifsapp.trstdcost_part_api.get_description(
            po.company,
            po.year,
            po.period,
            po.contract,
            po.catalog_no,
            po.version,
            po.ref_seq_no
       )                         AS malzeme_tanim,
       ifsapp.accounting_group_api.get_description(
            ifsapp.inventory_part_api.get_accounting_group(po.contract, po.part_no)
       )                         AS muh_grubu,
       po.unit_cost_a            AS birim_mly_tr,
       po.unit_cost_b            AS birim_mly_usd,
       po.unit_cost_c            AS birim_mly_eur,
       po.unit_cost_part_a       AS brm_mlz_mlyt_tr,
       po.unit_cost_part_b       AS brm_mlz_mlyt_usd,
       po.unit_cost_part_c       AS brm_mlz_mlyt_eur,
       po.unit_cost_a2           AS brm_iscilik_tr,
       po.unit_cost_b2           AS brm_iscilik_usd,
       po.unit_cost_c2           AS brm_iscilik_eur,
       po.unit_outside_cost_a    AS brm_fason_mlyt_tr,
       po.unit_outside_cost_b    AS brm_fason_mlyt_usd,
       po.unit_outside_cost_c    AS brm_fason_mlyt_eur,
       po.total_cost_a           AS toplam_maliyet_tr,
       po.total_cost_b           AS toplam_maliyet_usd,
       po.total_cost_c           AS toplam_maliyet_eur,
       po.cost_part_a            AS malzeme_mlyt_tr,
       po.cost_part_b            AS malzeme_mlyt_usd,
       po.cost_part_c            AS malzeme_mlyt_eur,
       po.cost_a2                AS toplam_iscilik_tr,
       po.cost_b2                AS toplam_iscilik_usd,
       po.cost_c2                AS toplam_iscilik_eur,
       po.outside_cost_a         AS toplam_fason_mlyt_tr,
       po.outside_cost_b         AS toplam_fason_mlyt_usd,
       po.outside_cost_c         AS toplam_fason_mlyt_eur
FROM ifsapp.trstdcost_part_owr po
WHERE po.year    = '2026'
  AND po.period  = '1'
  AND po.version = '8'
AND (:malzemeNo IS NULL OR po.part_no = :malzemeNo)
AND (:konfId IS NULL OR po.configuration_id = :konfId)
AND (:site IS NULL OR po.contract = :site)
";
}