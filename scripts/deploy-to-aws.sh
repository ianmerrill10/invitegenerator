#!/bin/bash
#
# InviteGenerator - AWS Deployment Script
#
# This script deploys to AWS using your EXISTING DynamoDB tables and S3 bucket.
# Your templates and data are preserved.
#
# Prerequisites:
#   - AWS CLI installed and configured (aws configure)
#   - An EC2 Key Pair created in your AWS account
#
# Usage:
#   ./scripts/deploy-to-aws.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   InviteGenerator AWS Deployment${NC}"
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
STACK_NAME="invitegenerator-ec2"
TEMPLATE_FILE="infrastructure/ec2-deployment.yaml"
S3_BUCKET="invitegenerator-uploads-${AWS_ACCOUNT_ID}-production"

# Verify S3 bucket exists
if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
    echo -e "${RED}Error: S3 bucket ${S3_BUCKET} not found.${NC}"
    echo "Make sure your InviteGenerator-Production stack exists."
    exit 1
fi

echo -e "${GREEN}✓ Found existing S3 bucket: ${S3_BUCKET}${NC}"
echo ""

# Check for existing key pairs
echo -e "${YELLOW}Available EC2 Key Pairs:${NC}"
aws ec2 describe-key-pairs --query 'KeyPairs[*].KeyName' --output table

echo ""
read -p "Enter your Key Pair name (or press Enter to create new): " KEY_PAIR_NAME

if [ -z "$KEY_PAIR_NAME" ]; then
    KEY_PAIR_NAME="invitegenerator-key"

    # Check if key already exists
    if aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" &> /dev/null; then
        echo -e "${GREEN}✓ Using existing key pair: ${KEY_PAIR_NAME}${NC}"
    else
        echo -e "${YELLOW}Creating new key pair: ${KEY_PAIR_NAME}${NC}"
        aws ec2 create-key-pair \
            --key-name "$KEY_PAIR_NAME" \
            --query 'KeyMaterial' \
            --output text > "${KEY_PAIR_NAME}.pem"
        chmod 400 "${KEY_PAIR_NAME}.pem"
        echo -e "${GREEN}✓ Key pair created and saved to ${KEY_PAIR_NAME}.pem${NC}"
        echo -e "${RED}  IMPORTANT: Keep this file safe! You need it to SSH into the server.${NC}"
    fi
fi

# Get optional configuration
echo ""
echo -e "${YELLOW}Optional Configuration (press Enter to skip):${NC}"
read -p "Stripe Secret Key (sk_test_...): " STRIPE_SECRET
read -p "Stripe Publishable Key (pk_test_...): " STRIPE_PUBLISHABLE
read -p "OpenAI API Key (sk-...): " OPENAI_KEY

# Step 1: Package and upload code to S3
echo ""
echo -e "${BLUE}Step 1: Packaging application code...${NC}"

# Create zip excluding unnecessary files
cd "$(dirname "$0")/.."
zip -r /tmp/app.zip . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".git/*" \
    -x "*.pem" \
    -x ".env.local" \
    -x "coverage/*" \
    -x "*.log" \
    -x "/tmp/*"

echo -e "${GREEN}✓ Code packaged${NC}"

echo -e "${BLUE}Step 2: Uploading to S3...${NC}"
aws s3 cp /tmp/app.zip "s3://${S3_BUCKET}/deploy/app.zip"
rm /tmp/app.zip

echo -e "${GREEN}✓ Code uploaded to S3${NC}"

# Step 3: Deploy CloudFormation stack
echo ""
echo -e "${BLUE}Step 3: Deploying CloudFormation stack...${NC}"
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

# Wait for EC2 instance
echo ""
echo -e "${YELLOW}Waiting for EC2 instance to initialize (3-5 minutes)...${NC}"
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
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Wait 2-3 more minutes for the app to finish building"
echo "  2. Open ${APP_URL} in your browser"
echo "  3. Sign up with: ianmerrill10@gmail.com"
echo ""
echo -e "${RED}To delete everything:${NC}"
echo "  aws cloudformation delete-stack --stack-name ${STACK_NAME}"
echo ""
