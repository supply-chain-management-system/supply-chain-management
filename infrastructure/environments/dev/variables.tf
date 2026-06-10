variable "aws_region" {
  description = "The AWS region to deploy the dev environment in"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The environment name"
  type        = string
  default     = "dev"
}

variable "cluster_name" {
  description = "The name of the EKS cluster (used for networking subnet tagging)"
  type        = string
  default     = "supply-chain-dev-eks"
}
