import clickhouse_connect

client = clickhouse_connect.get_client(
    host="clickhouse",   # docker service name
    port=8123,
    username="default",
    password='mypassword',
    database='analytics'
)
