require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;
  
  try {
    // Kết nối đến MySQL server (không chỉ định database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Đã kết nối đến MySQL server');

    // Tạo database nếu chưa tồn tại
    const dbName = process.env.DB_NAME || 'pci_dss_certificates';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} đã được tạo hoặc đã tồn tại`);

    // Sử dụng database
    await connection.execute(`USE ${dbName}`);

    // Tạo bảng companies (công ty được cấp chứng nhận)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        company_code VARCHAR(50) UNIQUE NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active'
      )
    `);

    // Tạo bảng certificates (chứng nhận)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certificates (
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
      )
    `);

    // Tạo bảng verification_logs (lịch sử xác thực)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS verification_logs (
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
      )
    `);

    // Tạo bảng admin_users (người dùng quản trị)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
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
      )
    `);

    // Tạo bảng certificate_files (lưu trữ file chứng nhận)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certificate_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_id VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type ENUM('pdf', 'image') NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (certificate_id) REFERENCES certificates(certificate_id) ON DELETE CASCADE
      )
    `);

    console.log('Tất cả bảng đã được tạo thành công!');

    // Tạo user admin mặc định
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(`
      INSERT IGNORE INTO admin_users (username, email, password_hash, full_name, role)
      VALUES ('admin', 'admin@company.com', ?, 'System Administrator', 'admin')
    `, [defaultPassword]);

    console.log('User admin mặc định đã được tạo (username: admin, password: admin123)');

    // Tạo dữ liệu mẫu
    await connection.execute(`
      INSERT IGNORE INTO companies (company_name, company_code, contact_email, contact_phone, address)
      VALUES 
        ('ABC Technology Co., Ltd', 'ABC001', 'contact@abc-tech.com', '+84-123-456-789', '123 Tech Street, Ho Chi Minh City'),
        ('XYZ E-commerce Solutions', 'XYZ002', 'info@xyz-ecom.com', '+84-987-654-321', '456 Commerce Ave, Hanoi')
    `);

    const sampleCertId1 = 'PCI-' + Date.now() + '-001';
    const sampleCertId2 = 'PCI-' + Date.now() + '-002';
    const sampleRef1 = 'REF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const sampleRef2 = 'REF-' + Math.random().toString(36).substr(2, 8).toUpperCase();

    await connection.execute(`
      INSERT IGNORE INTO certificates 
      (certificate_id, reference_number, company_id, certificate_type, issue_date, expiry_date, 
       assessment_level, qsa_company, verification_hash, compliance_details)
      VALUES 
        (?, ?, 1, 'PCI DSS Level 1', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 
         'Level 1 Merchant', 'ABC Security Assessment Company', SHA2(CONCAT(?, ?), 256),
         '{"scope": "Card data processing", "assessment_date": "2024-01-15", "next_assessment": "2025-01-15"}'),
        (?, ?, 2, 'PCI DSS Level 2', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
         'Level 2 Service Provider', 'XYZ QSA Firm', SHA2(CONCAT(?, ?), 256),
         '{"scope": "Payment processing services", "assessment_date": "2024-02-01", "next_assessment": "2025-02-01"}')
    `, [sampleCertId1, sampleRef1, sampleCertId1, sampleRef1, 
        sampleCertId2, sampleRef2, sampleCertId2, sampleRef2]);

    console.log('Dữ liệu mẫu đã được tạo');
    console.log(`Certificate 1 - Reference: ${sampleRef1}`);
    console.log(`Certificate 2 - Reference: ${sampleRef2}`);

  } catch (error) {
    console.error('Lỗi khi khởi tạo database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Đã đóng kết nối database');
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;