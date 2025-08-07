# Hướng Dẫn Triển Khai Hệ Thống PCI DSS Certificate Verification

## 🚀 Tổng Quan

Hướng dẫn này sẽ giúp bạn triển khai hệ thống xác thực chứng nhận PCI DSS từ development đến production.

## 📋 Checklist Triển Khai

### Pre-deployment
- [ ] Chuẩn bị server với OS Linux (Ubuntu 20.04+ khuyến nghị)
- [ ] Cài đặt Node.js v16+
- [ ] Cài đặt MySQL 8.0+
- [ ] Cài đặt Nginx
- [ ] Chuẩn bị domain name và SSL certificate
- [ ] Backup dữ liệu hiện tại (nếu có)

### Deployment
- [ ] Clone code và cài đặt dependencies
- [ ] Cấu hình environment variables
- [ ] Khởi tạo database
- [ ] Test ứng dụng local
- [ ] Cấu hình reverse proxy
- [ ] Setup SSL certificate
- [ ] Cấu hình firewall
- [ ] Setup monitoring và logging

### Post-deployment
- [ ] Test tất cả chức năng
- [ ] Setup backup tự động
- [ ] Cấu hình monitoring alerts
- [ ] Document thông tin truy cập
- [ ] Training cho team

## 🛠️ Chi Tiết Triển Khai

### 1. Chuẩn Bị Server

#### Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

#### Cài đặt Node.js
```bash
# Sử dụng NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Cài đặt MySQL
```bash
sudo apt install mysql-server -y

# Secure installation
sudo mysql_secure_installation

# Create database user
sudo mysql -e "CREATE USER 'pciuser'@'localhost' IDENTIFIED BY 'strong_password_here';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'pciuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

#### Cài đặt Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Cài đặt PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2. Deploy Application

#### Clone repository
```bash
cd /var/www
sudo git clone <your-repository-url> pci-dss-system
sudo chown -R $USER:$USER /var/www/pci-dss-system
cd pci-dss-system
```

#### Cài đặt dependencies
```bash
npm install --production
```

#### Cấu hình Environment
```bash
cp .env.example .env
nano .env
```

Cấu hình production `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=pciuser
DB_PASSWORD=strong_password_here
DB_NAME=pci_dss_certificates

# JWT Secret - MUST CHANGE IN PRODUCTION
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long

# Server Configuration
PORT=3000
NODE_ENV=production

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@company.com
SMTP_PASS=your_app_password

# Certificate Authority Info
CA_NAME=Your Company Name
CA_WEBSITE=https://your-domain.com
CA_EMAIL=certificates@your-company.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Base URL
BASE_URL=https://your-domain.com
```

#### Khởi tạo database
```bash
npm run init-db
```

#### Test application
```bash
npm start
```

Mở browser và test: `http://your-server-ip:3000`

### 3. Cấu Hình Nginx Reverse Proxy

#### Tạo file cấu hình Nginx
```bash
sudo nano /etc/nginx/sites-available/pci-dss-system
```

Nội dung file:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=verify:10m rate=5r/s;
    
    # Main proxy configuration
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
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # API Rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Verification endpoint with stricter rate limiting
    location /api/public/verify {
        limit_req zone=verify burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000;
    }
}
```

#### Enable site và restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/pci-dss-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL Certificate

#### Sử dụng Let's Encrypt
```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tạo certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Chạy Application với PM2

#### Tạo PM2 ecosystem file
```bash
nano ecosystem.config.js
```

Nội dung file:
```javascript
module.exports = {
  apps: [{
    name: 'pci-dss-system',
    script: 'server.js',
    cwd: '/var/www/pci-dss-system',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pci-dss/error.log',
    out_file: '/var/log/pci-dss/out.log',
    log_file: '/var/log/pci-dss/combined.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=400'
  }]
}
```

#### Tạo thư mục log
```bash
sudo mkdir -p /var/log/pci-dss
sudo chown $USER:$USER /var/log/pci-dss
```

#### Start application với PM2
```bash
cd /var/www/pci-dss-system
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Cấu Hình Firewall

```bash
# UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # MySQL (chỉ từ localhost)
sudo ufw --force enable

# Hoặc iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3306 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### 7. Setup Backup

#### Database backup script
```bash
sudo nano /usr/local/bin/backup-pci-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DB_NAME="pci_dss_certificates"
DB_USER="pciuser"
DB_PASS="strong_password_here"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/pci_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "pci_db_*.sql" -mtime +7 -delete

echo "Database backup completed: pci_db_$DATE.sql"
```

```bash
sudo chmod +x /usr/local/bin/backup-pci-db.sh
```

#### Crontab cho auto backup
```bash
crontab -e
```

Thêm dòng:
```
0 2 * * * /usr/local/bin/backup-pci-db.sh >> /var/log/backup.log 2>&1
```

### 8. Monitoring và Logging

#### Cài đặt log rotation
```bash
sudo nano /etc/logrotate.d/pci-dss
```

```
/var/log/pci-dss/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Setup monitoring với PM2 Plus (optional)
```bash
pm2 install pm2-server-monit
```

### 9. Testing

#### Test checklist
- [ ] Homepage loads: `https://your-domain.com`
- [ ] Admin panel: `https://your-domain.com/admin`
- [ ] Verification page: `https://your-domain.com/verify`
- [ ] API endpoints work
- [ ] SSL certificate valid
- [ ] Database connections work
- [ ] Logs are being written
- [ ] Backup script works

#### Load testing (optional)
```bash
# Install Apache Bench
sudo apt install apache2-utils -y

# Test verification endpoint
ab -n 1000 -c 10 -p verify.json -T application/json https://your-domain.com/api/public/verify
```

verify.json:
```json
{"reference_number":"REF-12345678"}
```

## 🔧 Maintenance

### Daily Tasks
- Check application logs: `pm2 logs`
- Monitor disk space: `df -h`
- Check system resources: `htop`

### Weekly Tasks
- Review access logs
- Check SSL certificate expiry
- Update system packages: `sudo apt update && sudo apt upgrade`

### Monthly Tasks
- Review security logs
- Update Node.js and npm if needed
- Performance review and optimization

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs pci-dss-system
   
   # Check if port is available
   sudo netstat -tlnp | grep :3000
   
   # Restart application
   pm2 restart pci-dss-system
   ```

2. **Database connection errors**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check database connectivity
   mysql -u pciuser -p -e "SELECT 1"
   
   # Check database exists
   mysql -u pciuser -p -e "SHOW DATABASES"
   ```

3. **Nginx errors**
   ```bash
   # Check Nginx status
   sudo systemctl status nginx
   
   # Check configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate expiry
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   
   # Test SSL
   openssl s_client -connect your-domain.com:443
   ```

### Emergency Procedures

#### Rollback Deployment
```bash
# Stop current application
pm2 stop pci-dss-system

# Restore from backup
cd /var/www
sudo mv pci-dss-system pci-dss-system-failed
sudo mv pci-dss-system-backup pci-dss-system

# Restore database
mysql -u pciuser -p pci_dss_certificates < /backup/mysql/pci_db_latest.sql

# Start application
cd pci-dss-system
pm2 start ecosystem.config.js
```

#### Scale Up Resources
```bash
# Increase PM2 instances
pm2 scale pci-dss-system +2

# Monitor performance
pm2 monit
```

## 📞 Support Contacts

- **System Admin**: admin@your-company.com
- **Database Admin**: dba@your-company.com
- **Security Team**: security@your-company.com
- **Emergency**: +84-xxx-xxx-xxxx

---

**Lưu ý**: Tài liệu này cần được cập nhật định kỳ và tùy chỉnh theo môi trường cụ thể của tổ chức.