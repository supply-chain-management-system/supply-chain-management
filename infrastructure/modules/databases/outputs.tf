# RDS outputs
output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "The port of the RDS instance"
  value       = aws_db_instance.postgres.port
}

output "rds_database_name" {
  description = "The database name"
  value       = aws_db_instance.postgres.db_name
}

output "rds_username" {
  description = "The master username for RDS"
  value       = aws_db_instance.postgres.username
}

output "rds_password" {
  description = "The master password for RDS"
  value       = random_password.rds_password.result
  sensitive   = true
}

# ElastiCache Redis outputs
output "redis_primary_endpoint" {
  description = "The primary endpoint address for ElastiCache Redis"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_port" {
  description = "The port for ElastiCache Redis"
  value       = aws_elasticache_replication_group.redis.port
}
