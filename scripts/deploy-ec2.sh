#!/bin/bash
#
# InviteGenerator - EC2 Deployment Script
#
# This script deploys the complete InviteGenerator infrastructure to AWS
# including EC2, DynamoDB, S3, Cognito, and all other services.
#
# Prerequisites:
#   - AWS CLI installed and configured (aws configure)
#   - An EC2 Key Pair created in your AWS account
#
# Usage:
#   ./scripts/deploy-ec2.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   InviteGenerator EC2 Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed.${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured.${NC}"
    echo "Run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

echo -e "${GREEN}✓ AWS CLI configured${NC}"
echo -e "  Account: ${AWS_ACCOUNT_ID}"
echo -e "  Region: ${AWS_REGION}"
echo ""

# Configuration
STACK_NAME="invitegenerator-production"
TEMPLATE_FILE="infrastructure/ec2-deployment.yaml"

# Check for existing key pairs
echo -e "${YELLOW}Available EC2 Key Pairs:${NC}"
aws ec2 describe-key-pairs --query 'KeyPairs[*].KeyName' --output table

echo ""
read -p "Enter your Key Pair name (or press Enter to create new): " KEY_PAIR_NAME

if [ -z "$KEY_PAIR_NAME" ]; then
    KEY_PAIR_NAME="invitegenerator-key"
    echo -e "${YELLOW}Creating new key pair: ${KEY_PAIR_NAME}${NC}"

    aws ec2 create-key-pair \
        --key-name "$KEY_PAIR_NAME" \
        --query 'KeyMaterial' \
        --output text > "${KEY_PAIR_NAME}.pem"

    chmod 400 "${KEY_PAIR_NAME}.pem"
    echo -e "${GREEN}✓ Key pair created and saved to ${KEY_PAIR_NAME}.pem${NC}"
    echo -e "${RED}  IMPORTANT: Keep this file safe! You need it to SSH into the server.${NC}"
fi

# Get Stripe keys (optional)
echo ""
echo -e "${YELLOW}Stripe Configuration (optional - press Enter to skip):${NC}"
read -p "Stripe Secret Key (sk_test_...): " STRIPE_SECRET
read -p "Stripe Publishable Key (pk_test_...): " STRIPE_PUBLISHABLE

# Get OpenAI key (optional)
echo ""
echo -e "${YELLOW}OpenAI Configuration (optional - press Enter to skip):${NC}"
read -p "OpenAI API Key (sk-...): " OPENAI_KEY

# Confirm deployment
echo ""
echo -e "${YELLOW}Deployment Configuration:${NC}"
echo -e "  Stack Name: ${STACK_NAME}"
echo -e "  Region: ${AWS_REGION}"
echo -e "  Key Pair: ${KEY_PAIR_NAME}"
echo -e "  Instance Type: t3.small"
echo -e "  Allowed Email: ianmerrill10@gmail.com"
echo ""
read -p "Proceed with deployment? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy CloudFormation stack
echo ""
echo -e "${BLUE}Deploying CloudFormation stack...${NC}"
echo "This will take 5-10 minutes."
echo ""

aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        Environment=production \
        KeyPairName="$KEY_PAIR_NAME" \
        InstanceType=t3.small \
        AllowedEmail="ianmerrill10@gmail.com" \
        StripeSecretKey="${STRIPE_SECRET:-}" \
        StripePublishableKey="${STRIPE_PUBLISHABLE:-}" \
        OpenAIKey="${OPENAI_KEY:-}" \
    --no-fail-on-empty-changeset

echo -e "${GREEN}✓ CloudFormation stack deployed${NC}"

# Get outputs
echo ""
echo -e "${BLUE}Getting deployment information...${NC}"

EC2_IP=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`EC2PublicIP`].OutputValue' \
    --output text)

APP_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`AppURL`].OutputValue' \
    --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

# Wait for EC2 instance to be ready
echo ""
echo -e "${YELLOW}Waiting for EC2 instance to initialize (this takes 3-5 minutes)...${NC}"

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=InviteGenerator-production" "Name=instance-state-name,Values=running,pending" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text) 2>/dev/null || true

# Give it extra time for user-data to complete
echo "Waiting for application setup to complete..."
sleep 180

# Display results
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Application URL:${NC}"
echo -e "  ${APP_URL}"
echo ""
echo -e "${BLUE}SSH Access:${NC}"
echo -e "  ssh -i ${KEY_PAIR_NAME}.pem ec2-user@${EC2_IP}"
echo ""
echo -e "${BLUE}View Setup Logs:${NC}"
echo -e "  ssh -i ${KEY_PAIR_NAME}.pem ec2-user@${EC2_IP} 'sudo cat /var/log/user-data.log'"
echo ""
echo -e "${BLUE}Cognito User Pool:${NC}"
echo -e "  ${USER_POOL_ID}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Wait 2-3 minutes for the app to finish building"
echo "  2. Open ${APP_URL} in your browser"
echo "  3. Sign up with: ianmerrill10@gmail.com"
echo "  4. Check setup logs if the app doesn't load"
echo ""
echo -e "${BLUE}To check app status:${NC}"
echo "  ssh -i ${KEY_PAIR_NAME}.pem ec2-user@${EC2_IP} 'pm2 status'"
echo ""
echo -e "${RED}To delete everything:${NC}"
echo "  aws cloudformation delete-stack --stack-name ${STACK_NAME}"
echo ""
