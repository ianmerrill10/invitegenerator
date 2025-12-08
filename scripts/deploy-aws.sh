#!/bin/bash

# ===========================================
# InviteGenerator - AWS Deployment Script
# ===========================================
# This script deploys all AWS infrastructure
# Run: ./scripts/deploy-aws.sh

set -e

echo "🚀 InviteGenerator AWS Deployment"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"

# Variables
STACK_NAME="InviteGenerator-Production"
TEMPLATE_FILE="infrastructure/aws-cloudformation.yaml"
REGION="us-east-1"

# Get domain from user
read -p "Enter your domain (e.g., invitegenerator.com): " APP_DOMAIN

echo ""
echo "📦 Creating CloudFormation stack..."
echo "   Stack: $STACK_NAME"
echo "   Region: $REGION"
echo "   Domain: $APP_DOMAIN"
echo ""

# Deploy CloudFormation
aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --parameters ParameterKey=AppDomain,ParameterValue=$APP_DOMAIN \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

echo "⏳ Waiting for stack creation (this takes 3-5 minutes)..."

aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $REGION

echo "✅ Stack created successfully!"
echo ""
echo "📋 Your credentials (SAVE THESE!):"
echo "=================================="

# Get outputs
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "=================================="
echo "✅ AWS Infrastructure deployed!"
echo ""
echo "Next steps:"
echo "1. Copy the values above to your .env.local"
echo "2. Set up Stripe (see SETUP-GUIDE.md)"
echo "3. Deploy to Vercel"
echo ""
