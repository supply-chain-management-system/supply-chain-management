variable "vpc_id" {
  description = "The ID of the VPC where the EKS cluster is deployed"
  type        = string
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs for EKS node placement"
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

variable "kubernetes_version" {
  description = "The Kubernetes version for the EKS control plane"
  type        = string
  default     = "1.30"
}

variable "app_node_instance_types" {
  description = "Instance types for standard application worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "ai_node_instance_types" {
  description = "Instance types for AI compute worker nodes"
  type        = list(string)
  default     = ["c5.xlarge"]
}

variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
}
