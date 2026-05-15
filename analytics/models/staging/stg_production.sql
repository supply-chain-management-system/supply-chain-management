SELECT
    id,
    product_name,
    target_qty,
    output_qty,
    status,
    factory_id,
    created_at,
    (output_qty::float / NULLIF(target_qty,0)) * 100 AS efficiency
FROM t_dkja_8bb04.production