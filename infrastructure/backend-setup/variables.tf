variable "aws_region" {
  description = "The AWS region to deploy the bootstrap state backend in"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The project name prefix for resource naming"
  type        = string
  default     = "supply-chain"
}
