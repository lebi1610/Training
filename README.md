# Hệ Thống Xác Thực Chứng Nhận PCI DSS

Hệ thống quản lý và xác thực chứng nhận PCI DSS với tính năng bảo mật cao, chỉ cho phép xác thực bằng số tham chiếu được cấp bởi tổ chức.

## 🚀 Tính Năng Chính

### Cho Khách Hàng
- **Xác thực chứng nhận**: Xác thực chứng nhận bằng số tham chiếu
- **Link trực tiếp**: Truy cập chứng nhận qua đường link có số tham chiếu
- **Thông tin chi tiết**: Hiển thị đầy đủ thông tin chứng nhận khi hợp lệ
- **Bảo mật cao**: Chỉ hiển thị thông tin khi có số tham chiếu đúng

### Cho Quản Trị Viên
- **Dashboard tổng quan**: Thống kê chứng nhận và cảnh báo hết hạn
- **Quản lý chứng nhận**: Tạo, cập nhật trạng thái chứng nhận
- **Quản lý công ty**: Thêm và quản lý thông tin công ty
- **Lịch sử xác thực**: Theo dõi các lần xác thực từ người dùng
- **Phân quyền**: Admin và Operator với quyền khác nhau

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Express.js API │    │   MySQL DB      │
│                 │◄──►│                 │◄──►│                 │
│ - Public Pages  │    │ - Public Routes │    │ - Certificates  │
│ - Admin Panel   │    │ - Admin Routes  │    │ - Companies     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v14 trở lên
- **MySQL**: v5.7 trở lên
- **RAM**: Tối thiểu 512MB
- **Disk**: Tối thiểu 1GB

## 🛠️ Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd pci-dss-certificate-system
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Cấu Hình Database
```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa thông tin database trong .env
nano .env
```

### 4. Khởi Tạo Database
```bash
# Chạy script khởi tạo database
npm run init-db
```

### 5. Khởi Chạy Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ⚙️ Cấu Hình

### File .env
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pci_dss_certificates

# JWT Secret (Thay đổi trong production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Server Configuration
PORT=3000
NODE_ENV=development

# Certificate Authority Info
CA_NAME=Your Company Name
CA_WEBSITE=https://your-company.com
CA_EMAIL=certificates@your-company.com

# Base URL for certificate verification
BASE_URL=https://your-domain.com
```

## 📊 Cấu Trúc Database

### Bảng `certificates`
- `certificate_id`: Mã chứng nhận duy nhất
- `reference_number`: Số tham chiếu để xác thực
- `company_id`: ID công ty được cấp chứng nhận
- `certificate_type`: Loại chứng nhận (Level 1-4)
- `issue_date`: Ngày cấp
- `expiry_date`: Ngày hết hạn
- `status`: Trạng thái (active, expired, revoked, suspended)
- `verification_hash`: Hash để bảo mật

### Bảng `companies`
- `company_name`: Tên công ty
- `company_code`: Mã công ty
- `contact_email`: Email liên hệ
- `contact_phone`: Số điện thoại
- `address`: Địa chỉ

### Bảng `verification_logs`
- `certificate_id`: Mã chứng nhận được xác thực
- `reference_number`: Số tham chiếu sử dụng
- `ip_address`: IP của người xác thực
- `verification_result`: Kết quả xác thực
- `verified_at`: Thời gian xác thực

## 🔗 API Endpoints

### Public APIs (Không cần xác thực)

#### POST `/api/public/verify`
Xác thực chứng nhận bằng số tham chiếu
```json
{
  "reference_number": "REF-XXXXXXXX",
  "certificate_id": "PCI-XXXXXXXXX-XXX" // optional
}
```

#### GET `/api/public/certificate/:reference_number`
Lấy thông tin chứng nhận qua số tham chiếu

#### GET `/api/public/health`
Kiểm tra trạng thái hệ thống

### Admin APIs (Cần JWT token)

#### POST `/api/admin/login`
Đăng nhập admin
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### GET `/api/admin/dashboard`
Lấy thống kê dashboard

#### GET `/api/admin/certificates`
Lấy danh sách chứng nhận

#### POST `/api/admin/certificates`
Tạo chứng nhận mới

#### PATCH `/api/admin/certificates/:certificate_id/status`
Cập nhật trạng thái chứng nhận

## 🌐 Sử Dụng

### Cho Khách Hàng

1. **Xác thực trực tiếp**:
   - Truy cập: `https://your-domain.com/verify/REF-XXXXXXXX`
   - Hệ thống tự động xác thực và hiển thị kết quả

2. **Xác thực thủ công**:
   - Truy cập: `https://your-domain.com/verify`
   - Nhập số tham chiếu và nhấn "Xác Thực"

### Cho Admin

1. **Đăng nhập**:
   - Truy cập: `https://your-domain.com/admin`
   - Sử dụng tài khoản: `admin` / `admin123`

2. **Quản lý chứng nhận**:
   - Xem danh sách chứng nhận
   - Tạo chứng nhận mới
   - Cập nhật trạng thái chứng nhận

3. **Quản lý công ty**:
   - Thêm công ty mới
   - Xem danh sách công ty

4. **Theo dõi**:
   - Xem lịch sử xác thực
   - Theo dõi chứng nhận sắp hết hạn

## 🔒 Bảo Mật

### Tính Năng Bảo Mật
- **JWT Authentication**: Xác thực admin bằng JWT token
- **Rate Limiting**: Giới hạn số request để tránh spam
- **Input Validation**: Kiểm tra và làm sạch dữ liệu đầu vào
- **SQL Injection Protection**: Sử dụng prepared statements
- **CORS Protection**: Cấu hình CORS phù hợp
- **Security Headers**: Sử dụng Helmet.js

### Reference Number Security
- Số tham chiếu được tạo ngẫu nhiên, không thể đoán
- Chỉ hiển thị thông tin khi có số tham chiếu chính xác
- Ghi log mọi lần xác thực để audit

## 🚀 Triển Khai Production

### 1. Cấu Hình Môi Trường
```bash
# Cập nhật NODE_ENV
NODE_ENV=production

# Thay đổi JWT_SECRET
JWT_SECRET=your_production_secret_key_here

# Cấu hình domain
BASE_URL=https://your-production-domain.com
```

### 2. Sử Dụng Process Manager
```bash
# Cài đặt PM2
npm install -g pm2

# Chạy ứng dụng với PM2
pm2 start server.js --name pci-dss-system

# Lưu cấu hình PM2
pm2 save
pm2 startup
```

### 3. Reverse Proxy với Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate
```bash
# Sử dụng Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 📝 Logs và Monitoring

### Log Files
- Application logs: Console output
- Access logs: Nginx access logs
- Error logs: Nginx error logs

### Monitoring
- Health check endpoint: `/health`
- Database connection monitoring
- PM2 process monitoring

## 🔧 Troubleshooting

### Lỗi Thường Gặp

1. **Database Connection Error**:
   - Kiểm tra thông tin database trong `.env`
   - Đảm bảo MySQL service đang chạy
   - Kiểm tra firewall và network connectivity

2. **JWT Token Invalid**:
   - Xóa token cũ: `localStorage.removeItem('adminToken')`
   - Đăng nhập lại

3. **Port Already in Use**:
   - Thay đổi PORT trong `.env`
   - Hoặc kill process đang sử dụng port: `lsof -ti:3000 | xargs kill -9`

### Performance Tuning

1. **Database Optimization**:
   - Tạo index cho các trường thường query
   - Optimize MySQL configuration
   - Sử dụng connection pooling

2. **Application Optimization**:
   - Enable gzip compression
   - Sử dụng CDN cho static files
   - Implement caching strategy

## 📞 Hỗ Trợ

- **Email**: certificates@your-company.com
- **Documentation**: Xem file README này
- **Issues**: Tạo issue trên repository

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

**Lưu ý**: Đây là hệ thống demo. Trong môi trường production, cần thêm các tính năng bảo mật và monitoring bổ sung.