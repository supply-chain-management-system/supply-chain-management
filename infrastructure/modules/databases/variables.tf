variable "vpc_id" {
  description = "The ID of the VPC where the databases will be deployed"
  type        = string
}

variable "vpc_cidr" {
  description = "The CIDR block of the VPC for security group rules"
  type        = string
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs for database placement"
  type        = list(string)
}

variable "environment" {
  description = "The deployment environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "The project prefix for resource naming"
  type        = string
  default     = "supply-chain"
}
