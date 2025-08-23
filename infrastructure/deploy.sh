#!/bin/bash
# MADFAM Infrastructure Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
ACTION="plan"
AUTO_APPROVE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --action)
            ACTION="$2"
            shift 2
            ;;
        --auto-approve)
            AUTO_APPROVE="-auto-approve"
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --env <environment>     Environment to deploy (dev|staging|prod) [default: dev]"
            echo "  --action <action>       Terraform action (plan|apply|destroy) [default: plan]"
            echo "  --auto-approve         Skip interactive approval for apply/destroy"
            echo "  --help                 Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid environments: dev, staging, prod"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    echo -e "${RED}Invalid action: $ACTION${NC}"
    echo "Valid actions: plan, apply, destroy"
    exit 1
fi

# Confirm production operations
if [[ "$ENVIRONMENT" == "prod" ]] && [[ "$ACTION" =~ ^(apply|destroy)$ ]]; then
    echo -e "${YELLOW}WARNING: You are about to $ACTION in PRODUCTION!${NC}"
    read -p "Are you sure you want to continue? Type 'yes' to confirm: " confirmation
    if [[ "$confirmation" != "yes" ]]; then
        echo -e "${RED}Operation cancelled${NC}"
        exit 0
    fi
fi

# Set working directory
TERRAFORM_DIR="terraform/environments/$ENVIRONMENT"

if [[ ! -d "$TERRAFORM_DIR" ]]; then
    echo -e "${RED}Environment directory not found: $TERRAFORM_DIR${NC}"
    exit 1
fi

cd "$TERRAFORM_DIR"

echo -e "${GREEN}=== MADFAM Infrastructure Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "Directory: $TERRAFORM_DIR"
echo ""

# Check for required tools
echo "Checking prerequisites..."
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}terraform is required but not installed.${NC}" >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo -e "${RED}aws cli is required but not installed.${NC}" >&2; exit 1; }

# Verify AWS credentials
echo "Verifying AWS credentials..."
aws sts get-caller-identity >/dev/null 2>&1 || { echo -e "${RED}AWS credentials not configured.${NC}" >&2; exit 1; }

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init -upgrade

# Format check
echo -e "${YELLOW}Checking Terraform formatting...${NC}"
terraform fmt -check -recursive ../.. || {
    echo -e "${YELLOW}Running terraform fmt to fix formatting...${NC}"
    terraform fmt -recursive ../..
}

# Validate configuration
echo -e "${YELLOW}Validating Terraform configuration...${NC}"
terraform validate

# Execute the requested action
case $ACTION in
    plan)
        echo -e "${YELLOW}Creating Terraform plan...${NC}"
        terraform plan -out="tfplan_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}Plan created successfully!${NC}"
        echo "To apply this plan, run: $0 --env $ENVIRONMENT --action apply"
        ;;
    apply)
        if [[ -z "$AUTO_APPROVE" ]]; then
            echo -e "${YELLOW}Creating and showing plan...${NC}"
            terraform plan
            echo ""
            read -p "Do you want to apply these changes? (yes/no): " confirm
            if [[ "$confirm" != "yes" ]]; then
                echo -e "${RED}Apply cancelled${NC}"
                exit 0
            fi
        fi
        echo -e "${YELLOW}Applying Terraform changes...${NC}"
        terraform apply $AUTO_APPROVE
        echo -e "${GREEN}Infrastructure deployed successfully!${NC}"
        
        # Show outputs
        echo ""
        echo -e "${GREEN}=== Deployment Outputs ===${NC}"
        terraform output
        ;;
    destroy)
        echo -e "${RED}WARNING: This will destroy all infrastructure!${NC}"
        if [[ -z "$AUTO_APPROVE" ]]; then
            terraform plan -destroy
            echo ""
            read -p "Are you ABSOLUTELY sure you want to destroy all infrastructure? Type 'destroy' to confirm: " confirm
            if [[ "$confirm" != "destroy" ]]; then
                echo -e "${GREEN}Destroy cancelled${NC}"
                exit 0
            fi
        fi
        echo -e "${RED}Destroying infrastructure...${NC}"
        terraform destroy $AUTO_APPROVE
        echo -e "${YELLOW}Infrastructure destroyed${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}=== Operation Complete ===${NC}"

# Post-deployment steps for apply
if [[ "$ACTION" == "apply" ]]; then
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update application secrets in AWS Secrets Manager"
    echo "2. Build and push Docker images to ECR"
    echo "3. Update ECS task definitions with new image versions"
    echo "4. Configure DNS records if using custom domain"
    echo ""
    echo "To view the infrastructure:"
    echo "  cd $TERRAFORM_DIR && terraform show"
fi