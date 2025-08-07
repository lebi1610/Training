# Hướng Dẫn Triển Khai AWS SIÊU TIẾT KIỆM - Serverless

## 🎯 Tổng Quan
Triển khai hệ thống PCI DSS Certificate trên AWS với chi phí **$0.50-2/tháng** sử dụng:
- **AWS Lambda**: Serverless functions
- **API Gateway**: REST API endpoints  
- **DynamoDB**: NoSQL database
- **S3**: Static website hosting
- **CloudFront**: CDN + SSL

## 💰 Chi Phí Ước Tính

### **Free Tier (12 tháng đầu):**
- Lambda: 1M requests/tháng = $0
- API Gateway: 1M requests/tháng = $0
- DynamoDB: 25GB storage = $0
- S3: 5GB storage = $0
- CloudFront: 1TB transfer = $0
- **TOTAL: ~$0.50/tháng**

### **Sau Free Tier:**
- Lambda: $0.20/1M requests = $0.01
- API Gateway: $3.50/1M requests = $0.10
- DynamoDB: $0.25/GB = $0.25
- S3: $0.023/GB = $0.12
- CloudFront: $0.085/GB = $0.25
- Route 53: $0.50
- **TOTAL: ~$1.23/tháng**

---

## 🏗️ Kiến Trúc Serverless

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │  API Gateway    │    │     Lambda      │
│   (CDN + SSL)   │◄──►│   (REST API)    │◄──►│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│       S3        │                          │   DynamoDB      │
│ (Static Files)  │                          │   (Database)    │
└─────────────────┘                          └─────────────────┘
```

---

## 🚀 Bước 1: Chuẩn Bị Code cho Serverless

### Tạo file `serverless.yml`
```yaml
service: pci-dss-certificates

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: prod
  environment:
    DYNAMODB_TABLE: ${self:service}-${self:provider.stage}
    JWT_SECRET: ${env:JWT_SECRET}
    
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"

functions:
  # Public API
  verify:
    handler: lambda/verify.handler
    events:
      - http:
          path: api/public/verify
          method: post
          cors: true

  getCertificate:
    handler: lambda/getCertificate.handler
    events:
      - http:
          path: api/public/certificate/{reference}
          method: get
          cors: true

  # Admin API
  adminLogin:
    handler: lambda/admin/login.handler
    events:
      - http:
          path: api/admin/login
          method: post
          cors: true

  adminDashboard:
    handler: lambda/admin/dashboard.handler
    events:
      - http:
          path: api/admin/dashboard
          method: get
          cors: true
          authorizer:
            name: authorizerFunc
            resultTtlInSeconds: 0

  createCertificate:
    handler: lambda/admin/createCertificate.handler
    events:
      - http:
          path: api/admin/certificates
          method: post
          cors: true
          authorizer:
            name: authorizerFunc

  # JWT Authorizer
  authorizerFunc:
    handler: lambda/authorizer.handler

resources:
  Resources:
    # DynamoDB Tables
    CertificatesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
        AttributeDefinitions:
          - AttributeName: PK
            AttributeType: S
          - AttributeName: SK
            AttributeType: S
          - AttributeName: GSI1PK
            AttributeType: S
        KeySchema:
          - AttributeName: PK
            KeyType: HASH
          - AttributeName: SK
            KeyType: RANGE
        GlobalSecondaryIndexes:
          - IndexName: GSI1
            KeySchema:
              - AttributeName: GSI1PK
                KeyType: HASH
            Projection:
              ProjectionType: ALL
            BillingMode: PAY_PER_REQUEST
        BillingMode: PAY_PER_REQUEST

    # S3 Bucket for static files
    StaticFilesBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-${self:provider.stage}-static
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: error.html
        PublicAccessBlockConfiguration:
          BlockPublicAcls: false
          BlockPublicPolicy: false
          IgnorePublicAcls: false
          RestrictPublicBuckets: false

    # CloudFront Distribution
    CloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      Properties:
        DistributionConfig:
          Origins:
            - DomainName:
                Fn::GetAtt: [StaticFilesBucket, DomainName]
              Id: S3Origin
              CustomOriginConfig:
                HTTPPort: 80
                HTTPSPort: 443
                OriginProtocolPolicy: http-only
            - DomainName:
                Fn::Join:
                  - ""
                  - - Ref: ApiGatewayRestApi
                    - ".execute-api."
                    - ${self:provider.region}
                    - ".amazonaws.com"
              Id: ApiGatewayOrigin
              CustomOriginConfig:
                HTTPPort: 80
                HTTPSPort: 443
                OriginProtocolPolicy: https-only
          Enabled: true
          DefaultRootObject: index.html
          DefaultCacheBehavior:
            AllowedMethods:
              - DELETE
              - GET
              - HEAD
              - OPTIONS
              - PATCH
              - POST
              - PUT
            TargetOriginId: S3Origin
            ForwardedValues:
              QueryString: false
              Cookies:
                Forward: none
            ViewerProtocolPolicy: redirect-to-https
          CacheBehaviors:
            - PathPattern: "/api/*"
              TargetOriginId: ApiGatewayOrigin
              AllowedMethods:
                - DELETE
                - GET
                - HEAD
                - OPTIONS
                - PATCH
                - POST
                - PUT
              ForwardedValues:
                QueryString: true
                Headers:
                  - Authorization
                  - Content-Type
              ViewerProtocolPolicy: https-only
              CachingDisabled: true
          PriceClass: PriceClass_100

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

package:
  exclude:
    - node_modules/**
    - .git/**
    - README.md
```

### Tạo Lambda Functions

#### `lambda/verify.js`
```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { reference_number, certificate_id } = JSON.parse(event.body);
    
    // Query DynamoDB
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `CERT#${reference_number}`,
        SK: 'METADATA'
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Chứng nhận không tồn tại'
        })
      };
    }
    
    const certificate = result.Item;
    
    // Check expiry
    const currentDate = new Date();
    const expiryDate = new Date(certificate.expiry_date);
    
    if (expiryDate < currentDate) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Chứng nhận đã hết hạn'
        })
      };
    }
    
    // Log verification
    await logVerification(reference_number, event.requestContext.identity.sourceIp, 'success');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Chứng nhận hợp lệ',
        certificate: {
          certificate_id: certificate.certificate_id,
          company_name: certificate.company_name,
          certificate_type: certificate.certificate_type,
          issue_date: certificate.issue_date,
          expiry_date: certificate.expiry_date,
          status: certificate.status,
          assessment_level: certificate.assessment_level,
          qsa_company: certificate.qsa_company
        }
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Lỗi hệ thống'
      })
    };
  }
};

async function logVerification(reference_number, ip_address, result) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      PK: `LOG#${Date.now()}`,
      SK: 'VERIFICATION',
      reference_number,
      ip_address,
      result,
      timestamp: new Date().toISOString()
    }
  };
  
  await dynamodb.put(params).promise();
}
```

#### `lambda/admin/login.js`
```javascript
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);
    
    // Get user from DynamoDB
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `USER#${username}`,
        SK: 'PROFILE'
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        })
      };
    }
    
    const user = result.Item;
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        })
      };
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      })
    };
    
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Lỗi hệ thống'
      })
    };
  }
};
```

#### `lambda/authorizer.js`
```javascript
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    };
    
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
```

---

## 🗄️ Bước 2: DynamoDB Schema Design

### Single Table Design
```javascript
// Certificates
PK: "CERT#REF-12345678"
SK: "METADATA"
certificate_id: "PCI-1234567890-001"
company_name: "ABC Company"
// ... other fields

// Companies  
PK: "COMPANY#ABC001"
SK: "PROFILE"
company_name: "ABC Technology"
// ... other fields

// Users
PK: "USER#admin"
SK: "PROFILE" 
username: "admin"
password_hash: "..."
// ... other fields

// Verification Logs
PK: "LOG#1640995200000"
SK: "VERIFICATION"
reference_number: "REF-12345678"
ip_address: "1.2.3.4"
result: "success"
```

---

## 🚀 Bước 3: Deploy với Serverless Framework

### 1. Cài đặt Serverless
```bash
npm install -g serverless
npm install --save-dev serverless-offline serverless-dotenv-plugin
```

### 2. Cài đặt Dependencies
```bash
npm install aws-sdk bcryptjs jsonwebtoken
```

### 3. Cấu hình AWS Credentials
```bash
aws configure
# Nhập Access Key ID và Secret Access Key
```

### 4. Deploy
```bash
# Deploy lần đầu
serverless deploy

# Deploy chỉ functions (nhanh hơn)
serverless deploy function -f verify
```

### 5. Upload Static Files lên S3
```bash
# Upload public folder
aws s3 sync ./public s3://pci-dss-certificates-prod-static --delete
```

---

## 📊 Bước 4: Seed Data vào DynamoDB

### Script seed data
```javascript
// scripts/seed-dynamodb.js
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1'
});

async function seedData() {
  const tableName = 'pci-dss-certificates-prod';
  
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const items = [
    // Admin User
    {
      PK: 'USER#admin',
      SK: 'PROFILE',
      user_id: 'admin',
      username: 'admin',
      email: 'admin@company.com',
      password_hash: adminPassword,
      full_name: 'System Administrator',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString()
    },
    
    // Sample Company
    {
      PK: 'COMPANY#ABC001',
      SK: 'PROFILE',
      company_id: 'ABC001',
      company_name: 'ABC Technology Co., Ltd',
      company_code: 'ABC001',
      contact_email: 'contact@abc-tech.com',
      contact_phone: '+84-123-456-789',
      address: '123 Tech Street, Ho Chi Minh City',
      status: 'active',
      created_at: new Date().toISOString()
    },
    
    // Sample Certificate
    {
      PK: 'CERT#REF-DEMO1234',
      SK: 'METADATA',
      certificate_id: 'PCI-1640995200000-001',
      reference_number: 'REF-DEMO1234',
      company_id: 'ABC001',
      company_name: 'ABC Technology Co., Ltd',
      certificate_type: 'PCI DSS Level 1',
      issue_date: '2024-01-01',
      expiry_date: '2025-01-01',
      status: 'active',
      assessment_level: 'Level 1 Merchant',
      qsa_company: 'ABC Security Assessment Company',
      verification_hash: 'hash123',
      created_at: new Date().toISOString(),
      GSI1PK: 'COMPANY#ABC001' // For querying by company
    }
  ];
  
  for (const item of items) {
    await dynamodb.put({
      TableName: tableName,
      Item: item
    }).promise();
    
    console.log(`Seeded: ${item.PK}#${item.SK}`);
  }
  
  console.log('Seed completed!');
}

seedData().catch(console.error);
```

```bash
node scripts/seed-dynamodb.js
```

---

## 🌐 Bước 5: Custom Domain (Optional)

### 1. Mua domain rẻ
- Namecheap: $8.88/năm
- Route 53: $12/năm

### 2. Cấu hình Route 53
```bash
# Tạo hosted zone
aws route53 create-hosted-zone --name your-domain.com --caller-reference $(date +%s)

# Point domain đến CloudFront
```

### 3. SSL Certificate
```bash
# Request certificate qua AWS Certificate Manager (FREE)
aws acm request-certificate --domain-name your-domain.com --validation-method DNS
```

---

## 📈 Monitoring & Optimization

### 1. CloudWatch Logs (Free)
- Tự động log Lambda functions
- Monitor errors và performance

### 2. X-Ray Tracing (Optional)
- $5/1M traces
- Không cần với traffic thấp

### 3. Cost Optimization
```bash
# Set up billing alerts
aws budgets create-budget --account-id YOUR_ACCOUNT_ID --budget file://budget.json
```

---

## 💡 Chi Phí Thực Tế với 30 Truy Vấn/Tháng

### **Miễn phí trong 12 tháng đầu:**
- Lambda: 30 requests < 1M free = $0
- API Gateway: 30 requests < 1M free = $0  
- DynamoDB: < 25GB free = $0
- S3: < 5GB free = $0
- CloudFront: < 1TB free = $0
- **Total: $0/tháng**

### **Sau free tier:**
- Lambda: 30 × $0.0000002 = $0.000006
- API Gateway: 30 × $0.0000035 = $0.0001
- DynamoDB: $0.25/GB × 0.001GB = $0.0003
- S3: $0.023/GB × 0.1GB = $0.002
- CloudFront: $0.085/GB × 0.001GB = $0.00008
- Route 53 (nếu có): $0.50
- **Total: ~$0.50/tháng**

---

## 🎯 Kết Luận

### **Ưu điểm:**
- ✅ **Siêu tiết kiệm**: $0-0.50/tháng
- ✅ **Auto-scaling**: Tự động scale theo traffic
- ✅ **No server management**: Không cần quản lý server
- ✅ **High availability**: 99.95% uptime
- ✅ **Global CDN**: Tốc độ nhanh toàn cầu

### **Nhược điểm:**
- ❌ Cold start latency (~1-3 giây lần đầu)
- ❌ Phức tạp setup ban đầu
- ❌ Vendor lock-in

### **Khuyến nghị:**
Với 20-30 truy vấn/tháng, **AWS Serverless là lựa chọn tốt nhất** về mặt chi phí và độ tin cậy. Bạn có thể bắt đầu hoàn toàn miễn phí trong 12 tháng đầu!

Bạn có muốn tôi tạo script tự động deploy toàn bộ hệ thống này không?