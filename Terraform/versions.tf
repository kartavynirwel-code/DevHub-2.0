terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Local state for now (fine for solo dev/demo).
  # Move to S3 + DynamoDB backend once you want remote state / team usage.
}

provider "aws" {
  region = var.aws_region
}
