from datetime import datetime
from elt_pipeline.utils.logger import get_logger
from elt_pipeline.core.clickhouse import client

logger = get_logger("LOADER")


def load_to_target(schema, table, data):
    logger.info("🚀 Loading: %s.%s → %s", schema, table, data)

  
    target_table = f"{schema}_{table}"

   
    create_table_if_not_exists(target_table, data)
    update_schema_if_needed(target_table, data)


    insert_into_clickhouse(target_table, data)

    logger.info("✅ Data loaded into: %s", target_table)




def create_table_if_not_exists(table, data):
    columns = []

    for key, value in data.items():
        if isinstance(value, bool):
            col_type = "UInt8"
        elif isinstance(value, datetime):
            col_type = "DateTime64(6)"
        elif isinstance(value, int):
            col_type = "Int64"
        elif isinstance(value, float):
            col_type = "Float64"
        else:
            col_type = "String"

        columns.append(f"{key} Nullable({col_type})")

    columns_sql = ", ".join(columns)

    query = f"""
    CREATE TABLE IF NOT EXISTS analytics.{table} (
        {columns_sql}
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    """

    client.command(query)


def update_schema_if_needed(table, data):
    try:
        result = client.query(f"DESCRIBE TABLE analytics.{table}")
        existing_cols = {row[0] for row in result.result_rows}
    except Exception as e:
        logger.error(f"Failed to describe table {table}: {e}")
        return

    for key, value in data.items():
        if key not in existing_cols:
            if isinstance(value, bool):
                col_type = "UInt8"
            elif isinstance(value, datetime):
                col_type = "DateTime64(6)"
            elif isinstance(value, int):
                col_type = "Int64"
            elif isinstance(value, float):
                col_type = "Float64"
            else:
                col_type = "String"

            logger.info(f"Adding missing column '{key}' (Nullable({col_type})) to table analytics.{table}")
            try:
                client.command(f"ALTER TABLE analytics.{table} ADD COLUMN IF NOT EXISTS {key} Nullable({col_type})")
            except Exception as ex:
                logger.error(f"Failed to add column {key} to {table}: {ex}")


def insert_into_clickhouse(table, data):
    keys = list(data.keys())
    values = [data[k] for k in keys]

    client.insert(
        f"analytics.{table}",
        [values],
        column_names=keys
    )