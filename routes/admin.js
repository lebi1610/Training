const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Certificate = require('../models/Certificate');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

// Admin login
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const users = await db.query(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Update last login
    await db.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await Certificate.getStatistics();
    const expiringCerts = await Certificate.getExpiringCertificates(30);

    res.json({
      success: true,
      data: {
        statistics: stats,
        expiring_certificates: expiringCerts
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải dữ liệu dashboard'
    });
  }
});

// Get all certificates
router.get('/certificates', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const certificates = await Certificate.findAll(limit, offset);
    
    // Get total count
    const totalResult = await db.query('SELECT COUNT(*) as total FROM certificates');
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách chứng nhận'
    });
  }
});

// Create new certificate
router.post('/certificates', 
  authenticateToken, 
  requireRole(['admin', 'operator']),
  validateRequest(schemas.createCertificate), 
  async (req, res) => {
    try {
      const result = await Certificate.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Chứng nhận đã được tạo thành công',
        data: result
      });
    } catch (error) {
      console.error('Create certificate error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo chứng nhận'
      });
    }
  }
);

// Update certificate status
router.patch('/certificates/:certificate_id/status',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(schemas.updateCertificateStatus),
  async (req, res) => {
    try {
      const { certificate_id } = req.params;
      const { status } = req.body;

      const success = await Certificate.updateStatus(certificate_id, status);

      if (success) {
        res.json({
          success: true,
          message: 'Cập nhật trạng thái chứng nhận thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy chứng nhận'
        });
      }
    } catch (error) {
      console.error('Update certificate status error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái chứng nhận'
      });
    }
  }
);

// Get companies
router.get('/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await db.query(
      'SELECT * FROM companies WHERE status = "active" ORDER BY company_name'
    );

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách công ty'
    });
  }
});

// Create new company
router.post('/companies',
  authenticateToken,
  requireRole(['admin', 'operator']),
  validateRequest(schemas.createCompany),
  async (req, res) => {
    try {
      const { company_name, company_code, contact_email, contact_phone, address } = req.body;

      const result = await db.query(
        `INSERT INTO companies (company_name, company_code, contact_email, contact_phone, address)
         VALUES (?, ?, ?, ?, ?)`,
        [company_name, company_code, contact_email, contact_phone, address]
      );

      res.status(201).json({
        success: true,
        message: 'Công ty đã được tạo thành công',
        data: {
          id: result.insertId,
          company_name,
          company_code,
          contact_email
        }
      });
    } catch (error) {
      console.error('Create company error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({
          success: false,
          message: 'Mã công ty đã tồn tại'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Lỗi khi tạo công ty'
        });
      }
    }
  }
);

// Get verification logs
router.get('/verification-logs', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const logs = await db.query(
      `SELECT * FROM verification_logs 
       ORDER BY verified_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalResult = await db.query('SELECT COUNT(*) as total FROM verification_logs');
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get verification logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải log xác thực'
    });
  }
});

// Get certificate details
router.get('/certificates/:certificate_id', authenticateToken, async (req, res) => {
  try {
    const { certificate_id } = req.params;
    const certificate = await Certificate.findByCertificateId(certificate_id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chứng nhận'
      });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Get certificate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thông tin chứng nhận'
    });
  }
});

module.exports = router;