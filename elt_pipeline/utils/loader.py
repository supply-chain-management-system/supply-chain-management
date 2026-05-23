from datetime import datetime
from elt_pipeline.utils.logger import get_logger
from elt_pipeline.core.clickhouse import client

logger = get_logger("LOADER")


def load_to_target(schema, table, data):
    logger.info("🚀 Loading: %s.%s → %s", schema, table, data)

    # 🔑 flatten table name
    target_table = f"{schema}_{table}"

    # STEP 1: ensure table exists
    create_table_if_not_exists(target_table, data)

    # STEP 2: insert data
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

        columns.append(f"{key} {col_type}")

    columns_sql = ", ".join(columns)

    query = f"""
    CREATE TABLE IF NOT EXISTS analytics.{table} (
        {columns_sql}
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    """

    client.command(query)

def insert_into_clickhouse(table, data):
    keys = list(data.keys())
    values = [data[k] for k in keys]

    client.insert(
        f"analytics.{table}",
        [values],
        column_names=keys
    )