# Hướng Dẫn Triển Khai MIỄN PHÍ - Vercel + PlanetScale

## 🎯 Tổng Quan
Hướng dẫn này sẽ giúp bạn triển khai hệ thống PCI DSS Certificate hoàn toàn **MIỄN PHÍ** với:
- **Vercel**: Hosting frontend + API
- **PlanetScale**: MySQL database
- **Cloudflare**: CDN + SSL (optional)

## 💰 Chi Phí: $0/tháng
- Vercel Free: 100GB bandwidth
- PlanetScale Free: 5GB storage, 1 billion row reads
- Đủ cho hàng nghìn truy vấn/tháng

---

## 🚀 Bước 1: Chuẩn Bị Code

### Tạo file `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Cập nhật `package.json`
```json
{
  "scripts": {
    "build": "echo 'Build completed'",
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Tạo file `api/index.js` (Vercel format)
```javascript
const app = require('../server.js');
module.exports = app;
```

---

## 🗄️ Bước 2: Setup PlanetScale Database

### 1. Đăng ký PlanetScale
```bash
# Truy cập: https://planetscale.com
# Đăng ký tài khoản miễn phí
# Tạo database mới: "pci-dss-certificates"
```

### 2. Tạo Connection String
```bash
# Vào PlanetScale Dashboard
# Tạo branch "main"
# Lấy connection string
```

### 3. Cập nhật Database Schema
```sql
-- Chạy trên PlanetScale Console
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active'
);

CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(100) UNIQUE NOT NULL,
  reference_number VARCHAR(100) UNIQUE NOT NULL,
  company_id INT NOT NULL,
  certificate_type ENUM('PCI DSS Level 1', 'PCI DSS Level 2', 'PCI DSS Level 3', 'PCI DSS Level 4') NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status ENUM('active', 'expired', 'revoked', 'suspended') DEFAULT 'active',
  assessment_level VARCHAR(50),
  qsa_company VARCHAR(255),
  compliance_details JSON,
  verification_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_reference_number (reference_number),
  INDEX idx_certificate_id (certificate_id),
  INDEX idx_status (status),
  INDEX idx_expiry_date (expiry_date)
);

CREATE TABLE verification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(100) NOT NULL,
  reference_number VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  verification_result ENUM('success', 'failed', 'not_found') NOT NULL,
  error_message TEXT,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_certificate_id (certificate_id),
  INDEX idx_verified_at (verified_at)
);

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Thêm dữ liệu mẫu
```sql
-- Admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgbzwJ5O8YjvOmy', 'System Administrator', 'admin');

-- Sample companies
INSERT INTO companies (company_name, company_code, contact_email, contact_phone, address)
VALUES 
  ('ABC Technology Co., Ltd', 'ABC001', 'contact@abc-tech.com', '+84-123-456-789', '123 Tech Street, Ho Chi Minh City'),
  ('XYZ E-commerce Solutions', 'XYZ002', 'info@xyz-ecom.com', '+84-987-654-321', '456 Commerce Ave, Hanoi');
```

---

## 🚀 Bước 3: Deploy lên Vercel

### 1. Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### 2. Login và Deploy
```bash
# Login
vercel login

# Deploy
vercel --prod
```

### 3. Cấu hình Environment Variables
```bash
# Vào Vercel Dashboard > Project > Settings > Environment Variables
# Thêm các biến sau:

DB_HOST=aws.connect.psdb.cloud
DB_USERNAME=your_planetscale_username
DB_PASSWORD=your_planetscale_password  
DB_DATABASE=pci-dss-certificates
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
BASE_URL=https://your-project.vercel.app
```

---

## 🌐 Bước 4: Cấu hình Domain (Optional)

### 1. Domain miễn phí
```bash
# Sử dụng subdomain Vercel miễn phí:
# your-project.vercel.app

# Hoặc mua domain rẻ:
# Namecheap: $8.88/năm
# Godaddy: $9.99/năm
```

### 2. Cấu hình Custom Domain
```bash
# Vào Vercel Dashboard > Domains
# Thêm custom domain
# Cấu hình DNS records
```

---

## 🔧 Bước 5: Tối Ưu cho Vercel

### Cập nhật `config/database.js`
```javascript
const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: {
        rejectUnauthorized: true
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}

module.exports = new Database();
```

### Cập nhật `server.js` cho Vercel
```javascript
// Thêm vào đầu file
if (process.env.NODE_ENV === 'production') {
  // Vercel serverless functions
  module.exports = app;
} else {
  // Local development
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

---

## 📊 Bước 6: Monitoring & Analytics

### 1. Vercel Analytics (Free)
```bash
# Enable trong Vercel Dashboard
# Theo dõi traffic, performance
```

### 2. PlanetScale Insights
```bash
# Monitor database usage
# Query performance
# Storage usage
```

---

## 🔒 Bước 7: Security

### 1. Environment Variables
```bash
# Đảm bảo tất cả secrets trong Vercel Environment Variables
# Không commit vào Git
```

### 2. Database Security
```bash
# PlanetScale tự động encrypt
# Connection qua SSL
# Branch-based development
```

---

## 📈 Giới Hạn Free Tier

### Vercel Free Tier:
- ✅ 100GB bandwidth/tháng
- ✅ 100 deployments/tháng  
- ✅ Serverless functions
- ✅ Custom domains
- ❌ Team features

### PlanetScale Free Tier:
- ✅ 5GB storage
- ✅ 1 billion row reads/tháng
- ✅ 10 million row writes/tháng
- ✅ 1 production branch
- ❌ Multiple databases

---

## 🚀 Testing

### 1. Test URLs
```bash
# Homepage
https://your-project.vercel.app

# Admin panel  
https://your-project.vercel.app/admin

# Verification
https://your-project.vercel.app/verify

# API Health check
https://your-project.vercel.app/api/public/health
```

### 2. Load Testing
```bash
# Với 20-30 truy vấn/tháng, không cần load test
# Nhưng có thể test với:
curl https://your-project.vercel.app/api/public/health
```

---

## 💡 Tips Tối Ưu

### 1. Performance
- Sử dụng connection pooling
- Cache static assets
- Optimize database queries

### 2. Cost Management  
- Monitor usage trong dashboard
- Set up alerts khi gần limit
- Optimize images và assets

### 3. Backup
```bash
# PlanetScale tự động backup
# Export data định kỳ nếu cần:
pscale database dump pci-dss-certificates main
```

---

## 🆘 Troubleshooting

### 1. Database Connection Issues
```bash
# Check environment variables
# Verify PlanetScale credentials
# Test connection locally
```

### 2. Deployment Errors
```bash
# Check build logs in Vercel
# Verify package.json scripts
# Test locally first
```

### 3. Function Timeout
```bash
# Vercel functions timeout after 10s (free tier)
# Optimize slow queries
# Use async/await properly
```

---

## 📞 Support

- **Vercel**: https://vercel.com/support
- **PlanetScale**: https://planetscale.com/docs
- **Community**: Stack Overflow, Discord

---

**🎉 Kết quả**: Hệ thống hoàn chỉnh với $0 chi phí hàng tháng, đủ mạnh cho hàng nghìn truy vấn!