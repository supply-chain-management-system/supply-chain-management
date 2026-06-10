terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Replace the bucket name below with the output from your backend-setup.
  # Since backend config cannot use variables, this must be a literal string.
  backend "s3" {
    bucket       = "supply-chain-terraform-state-6a60d5d9"
    key          = "environments/dev/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

module "networking" {
  source = "../../modules/networking"

  vpc_cidr             = "10.10.0.0/16"
  public_subnet_cidrs  = ["10.10.1.0/24", "10.10.2.0/24", "10.10.3.0/24"]
  private_subnet_cidrs = ["10.10.11.0/24", "10.10.12.0/24", "10.10.13.0/24"]
  availability_zones   = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  environment          = var.environment
  cluster_name         = var.cluster_name
}

module "databases" {
  source = "../../modules/databases"

  vpc_id             = module.networking.vpc_id
  vpc_cidr           = module.networking.vpc_cidr
  private_subnet_ids = module.networking.private_subnet_ids
  environment        = var.environment
}

module "eks" {
  source = "../../modules/eks"

  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  environment        = var.environment
  cluster_name       = var.cluster_name
}
