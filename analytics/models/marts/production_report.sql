SELECT
    factory_id,
    DATE(created_at) AS production_date,
    COUNT(*) AS total_orders,
    SUM(target_qty) AS total_target,
    SUM(output_qty) AS total_output,
    AVG(efficiency) AS avg_efficiency
FROM {{ ref('stg_production') }}
GROUP BY factory_id, DATE(created_at)