#!/bin/bash
# Deploy Lambda function for Bedrock template generation
# Run this in AWS CloudShell

set -e

FUNCTION_NAME="template-generator-bedrock"
ROLE_NAME="LambdaBedrockRole"
S3_BUCKET="invitegenerator-templates-983101357971"
REGION="us-west-2"  # Bedrock is available here

echo "=== Step 1: Create IAM Role ==="

# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://trust-policy.json \
  2>/dev/null || echo "Role may already exist"

# Create permissions policy
cat > permissions-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name BedrockS3Policy \
  --policy-document file://permissions-policy.json

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"

echo "Waiting for role to propagate..."
sleep 10

echo "=== Step 2: Create Lambda Package ==="

# Create directory for Lambda
mkdir -p lambda-package
cd lambda-package

# Copy function code
cat > index.js << 'LAMBDACODE'
/**
 * Lambda function to generate invitation templates using AWS Bedrock
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const S3_BUCKET = process.env.S3_BUCKET || "invitegenerator-templates-983101357971";
const BEDROCK_REGION = "us-west-2";
const S3_REGION = "us-east-1";

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });
const s3Client = new S3Client({ region: S3_REGION });

const TEMPLATE_SIZE = 1748;
const THUMBNAIL_SIZE = 400;

const STYLE_MOODS = {
  minimalist: "clean, simple, lots of white space, subtle, refined",
  elegant: "sophisticated, graceful, luxurious, refined, high-end",
  modern: "contemporary, fresh, sleek, trendy, geometric",
  vintage: "retro, nostalgic, classic, antique charm, timeless",
  rustic: "natural, earthy, farmhouse, organic, warm wood tones",
  bohemian: "free-spirited, eclectic, artistic, natural, layered textures",
  tropical: "vibrant, lush, exotic, paradise, palm fronds and flowers",
  romantic: "soft, dreamy, delicate, pastel, roses and hearts",
  playful: "fun, colorful, energetic, whimsical, party vibes",
  luxurious: "opulent, gold accents, marble, velvet, rich textures",
  whimsical: "magical, fairytale, dreamy, fantastical, enchanted",
  classic: "traditional, timeless, formal, distinguished, heritage",
};

const EVENT_ELEMENTS = {
  wedding: "rings, flowers, doves, hearts, elegant script",
  birthday: "balloons, confetti, cake, candles, celebration",
  baby_shower: "baby items, stork, soft pastels, rattles, clouds",
  bridal_shower: "flowers, champagne, dress silhouette, hearts",
  graduation: "cap and gown, diploma, stars, academic elements",
  corporate: "professional, clean lines, geometric, modern",
  holiday: "seasonal decorations, festive elements, traditional motifs",
  dinner_party: "elegant table setting, wine glasses, candles",
  anniversary: "intertwined hearts, roses, gold accents, rings",
  engagement: "diamond ring, champagne, hearts, romantic florals",
  housewarming: "house silhouette, keys, plants, home elements",
  retirement: "celebration, gold watch, flowers, achievement",
  reunion: "group silhouette, memories, nostalgic elements",
  religious: "appropriate religious symbols, elegant, reverent",
  kids_party: "fun characters, bright colors, toys, games",
  sports: "sports equipment, action lines, team colors",
  seasonal: "nature elements matching the season",
};

const COLOR_PALETTES = [
  { name: "Blush Rose", colors: ["#D4919F", "#F5E1E5", "#FFFFFF"] },
  { name: "Sage Garden", colors: ["#87A878", "#E8F0E5", "#FFFFFF"] },
  { name: "Ocean Blue", colors: ["#4A90A4", "#E0F0F5", "#FFFFFF"] },
  { name: "Sunset Gold", colors: ["#D4A574", "#FFF5E8", "#FFFFFF"] },
  { name: "Lavender Dream", colors: ["#9B8AA6", "#F0EBF5", "#FFFFFF"] },
  { name: "Midnight Navy", colors: ["#2C3E50", "#E8ECF0", "#FFFFFF"] },
  { name: "Terracotta", colors: ["#C4785A", "#F5EBE6", "#FFFFFF"] },
  { name: "Forest Green", colors: ["#2D5A4A", "#E5F0EB", "#FFFFFF"] },
  { name: "Dusty Mauve", colors: ["#B08D9B", "#F5EEF0", "#FFFFFF"] },
  { name: "Champagne", colors: ["#C9B896", "#F8F5F0", "#FFFFFF"] },
];

function createPrompt(category, subcategory, style, colors) {
  const elements = EVENT_ELEMENTS[category] || "elegant decorations";
  const mood = STYLE_MOODS[style] || "elegant";
  const [primary, secondary] = colors;

  return `Create a beautiful invitation design template for a ${subcategory.replace(/-/g, " ")} ${category.replace(/_/g, " ")} event.
Style: ${style} (${mood}). Colors: ${primary}, ${secondary}. Elements: ${elements}.
Square format. Clear center for text. Decorative edges. NO text/letters. Print quality.`;
}

async function generateWithBedrock(prompt) {
  const input = {
    text_prompts: [
      { text: prompt, weight: 1.0 },
      { text: "text, words, letters, numbers, watermark, blurry, low quality", weight: -1.0 },
    ],
    cfg_scale: 7,
    steps: 40,
    seed: Math.floor(Math.random() * 4294967295),
    width: 1024,
    height: 1024,
    samples: 1,
  };

  const command = new InvokeModelCommand({
    modelId: "stability.stable-diffusion-xl-v1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(input),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (!responseBody.artifacts?.[0]?.base64) {
    throw new Error("No image generated");
  }

  return Buffer.from(responseBody.artifacts[0].base64, "base64");
}

async function processImage(imageBuffer) {
  const [fullSize, thumbnail] = await Promise.all([
    sharp(imageBuffer).resize(TEMPLATE_SIZE, TEMPLATE_SIZE, { fit: "cover" }).png().toBuffer(),
    sharp(imageBuffer).resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" }).png({ quality: 80 }).toBuffer(),
  ]);
  return { fullSize, thumbnail };
}

async function uploadToS3(buffer, key) {
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/png",
    CacheControl: "public, max-age=31536000",
  }));
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

async function generateTemplate(category, subcategory, style) {
  const timestamp = Date.now().toString(36);
  const templateId = `tmpl_${category}_${subcategory}_${style}_${timestamp}`.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const colorPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

  const prompt = createPrompt(category, subcategory, style, colorPalette.colors);
  const imageBuffer = await generateWithBedrock(prompt);
  const { fullSize, thumbnail } = await processImage(imageBuffer);

  const fullKey = `templates/${category}/${subcategory}/${templateId}_full.png`;
  const thumbKey = `templates/${category}/${subcategory}/${templateId}_thumb.png`;

  await Promise.all([uploadToS3(fullSize, fullKey), uploadToS3(thumbnail, thumbKey)]);

  return { templateId, category, subcategory, style };
}

exports.handler = async (event) => {
  const { templates } = event;
  if (!templates?.length) return { statusCode: 400, body: "templates array required" };

  const results = [], errors = [];

  for (const t of templates) {
    try {
      console.log(`Generating: ${t.category}/${t.subcategory}/${t.style}`);
      const result = await generateTemplate(t.category, t.subcategory, t.style);
      results.push(result);
    } catch (err) {
      console.error(`Failed: ${t.category}/${t.subcategory}/${t.style}`, err.message);
      errors.push({ template: t, error: err.message });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ success: results.length, failed: errors.length, results, errors }) };
};
LAMBDACODE

# Create package.json
cat > package.json << 'EOF'
{
  "name": "template-generator",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "sharp": "^0.33.0"
  }
}
EOF

# Install dependencies
npm install --platform=linux --arch=x64

# Create zip
zip -r ../function.zip .

cd ..

echo "=== Step 3: Create Lambda Function ==="

aws lambda create-function \
  --function-name $FUNCTION_NAME \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 1024 \
  --region $REGION \
  --environment "Variables={S3_BUCKET=$S3_BUCKET}" \
  2>/dev/null || \
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip \
  --region $REGION

echo "=== Done! Lambda deployed: $FUNCTION_NAME ==="
echo ""
echo "To generate templates, run:"
echo "aws lambda invoke --function-name $FUNCTION_NAME --region $REGION --payload '{\"templates\":[{\"category\":\"wedding\",\"subcategory\":\"ceremony\",\"style\":\"elegant\"}]}' output.json && cat output.json"
