output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "A list of public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "A list of private subnet IDs"
  value       = module.networking.private_subnet_ids
}

# RDS Outputs
output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = module.databases.rds_endpoint
}

output "rds_port" {
  description = "The port of the RDS instance"
  value       = module.databases.rds_port
}

output "rds_username" {
  description = "The master username for RDS"
  value       = module.databases.rds_username
}

output "rds_password" {
  description = "The master password for RDS"
  value       = module.databases.rds_password
  sensitive   = true
}

# Redis Outputs
output "redis_primary_endpoint" {
  description = "The primary endpoint address for ElastiCache Redis"
  value       = module.databases.redis_primary_endpoint
}

output "redis_port" {
  description = "The port for ElastiCache Redis"
  value       = module.databases.redis_port
}

# EKS Outputs
output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "The endpoint for the EKS cluster control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "The Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_security_group_id" {
  description = "The security group ID associated with the cluster control plane"
  value       = module.eks.cluster_security_group_id
}
