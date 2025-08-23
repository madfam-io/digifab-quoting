# Development Environment Configuration - Cost-optimized for testing

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "madfam-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "madfam-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "dev"
      Project     = "madfam"
      ManagedBy   = "terraform"
    }
  }
}

# Variables
variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "madfam"
}

variable "environment" {
  default = "dev"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module - Simplified for dev
module "vpc" {
  source = "../../modules/vpc"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr          = "10.1.0.0/16"
  availability_zones = [data.aws_availability_zones.available.names[0]] # Single AZ for dev
}

# RDS Module - Minimal configuration
module "rds" {
  source = "../../modules/rds"
  
  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  instance_class          = "db.t3.micro"  # Smallest instance
  allocated_storage       = 20             # Minimum storage
  backup_retention_period = 1              # Minimal backups
  enable_read_replica     = false          # No read replica in dev
}

# ElastiCache Module - Single node
module "elasticache" {
  source = "../../modules/elasticache"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = "cache.t3.micro"  # Smallest instance
  num_cache_nodes    = 1                 # Single node
}

# S3 Module
module "s3" {
  source = "../../modules/s3"
  
  project_name      = var.project_name
  environment       = var.environment
  enable_versioning = false  # No versioning in dev
}

# ECR Repositories
resource "aws_ecr_repository" "api" {
  name = "${var.project_name}-${var.environment}-api"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "worker" {
  name = "${var.project_name}-${var.environment}-worker"
  image_tag_mutability = "MUTABLE"
}

# ECS Module - Minimal resources
module "ecs" {
  source = "../../modules/ecs"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  
  api_image            = "${aws_ecr_repository.api.repository_url}:latest"
  worker_image         = "${aws_ecr_repository.worker.repository_url}:latest"
  api_cpu              = 256    # Minimum CPU
  api_memory           = 512    # Minimum memory
  api_desired_count    = 1      # Single instance
  worker_cpu           = 512
  worker_memory        = 1024
  worker_desired_count = 1      # Single instance
  
  environment_variables = {
    NODE_ENV  = "development"
    PORT      = "4000"
    REDIS_URL = module.elasticache.redis_connection_url
    S3_BUCKET = module.s3.uploads_bucket_name
    S3_REGION = var.aws_region
  }
  
  secrets = {
    DATABASE_URL = "${module.rds.db_secret_arn}:url::"
  }
}

# Outputs
output "api_endpoint" {
  value = "http://${module.ecs.alb_dns_name}"
}

output "ecr_repositories" {
  value = {
    api    = aws_ecr_repository.api.repository_url
    worker = aws_ecr_repository.worker.repository_url
  }
}

output "database_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  value = module.elasticache.redis_endpoint
}