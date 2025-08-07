const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class Certificate {
  static async create(certificateData) {
    const {
      company_id,
      certificate_type,
      issue_date,
      expiry_date,
      assessment_level,
      qsa_company,
      compliance_details
    } = certificateData;

    // Tạo certificate ID và reference number duy nhất
    const certificate_id = `PCI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const reference_number = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Tạo verification hash
    const verification_hash = crypto
      .createHash('sha256')
      .update(`${certificate_id}${reference_number}${Date.now()}`)
      .digest('hex');

    const sql = `
      INSERT INTO certificates 
      (certificate_id, reference_number, company_id, certificate_type, issue_date, 
       expiry_date, assessment_level, qsa_company, compliance_details, verification_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [
      certificate_id,
      reference_number,
      company_id,
      certificate_type,
      issue_date,
      expiry_date,
      assessment_level,
      qsa_company,
      JSON.stringify(compliance_details),
      verification_hash
    ]);

    return {
      id: result.insertId,
      certificate_id,
      reference_number,
      verification_hash
    };
  }

  static async findByReferenceNumber(reference_number) {
    const sql = `
      SELECT c.*, comp.company_name, comp.contact_email, comp.address
      FROM certificates c
      JOIN companies comp ON c.company_id = comp.id
      WHERE c.reference_number = ? AND c.status = 'active'
    `;

    const results = await db.query(sql, [reference_number]);
    
    if (results.length === 0) {
      return null;
    }

    const certificate = results[0];
    
    // Parse compliance_details JSON
    if (certificate.compliance_details) {
      try {
        certificate.compliance_details = JSON.parse(certificate.compliance_details);
      } catch (e) {
        certificate.compliance_details = {};
      }
    }

    return certificate;
  }

  static async findByCertificateId(certificate_id) {
    const sql = `
      SELECT c.*, comp.company_name, comp.contact_email, comp.address
      FROM certificates c
      JOIN companies comp ON c.company_id = comp.id
      WHERE c.certificate_id = ?
    `;

    const results = await db.query(sql, [certificate_id]);
    
    if (results.length === 0) {
      return null;
    }

    const certificate = results[0];
    
    if (certificate.compliance_details) {
      try {
        certificate.compliance_details = JSON.parse(certificate.compliance_details);
      } catch (e) {
        certificate.compliance_details = {};
      }
    }

    return certificate;
  }

  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT c.*, comp.company_name, comp.contact_email
      FROM certificates c
      JOIN companies comp ON c.company_id = comp.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const results = await db.query(sql, [limit, offset]);
    
    return results.map(cert => {
      if (cert.compliance_details) {
        try {
          cert.compliance_details = JSON.parse(cert.compliance_details);
        } catch (e) {
          cert.compliance_details = {};
        }
      }
      return cert;
    });
  }

  static async updateStatus(certificate_id, status) {
    const sql = `
      UPDATE certificates 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE certificate_id = ?
    `;

    const result = await db.query(sql, [status, certificate_id]);
    return result.affectedRows > 0;
  }

  static async getExpiringCertificates(days = 30) {
    const sql = `
      SELECT c.*, comp.company_name, comp.contact_email
      FROM certificates c
      JOIN companies comp ON c.company_id = comp.id
      WHERE c.status = 'active' 
        AND c.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND c.expiry_date >= CURDATE()
      ORDER BY c.expiry_date ASC
    `;

    return await db.query(sql, [days]);
  }

  static async getStatistics() {
    const totalSql = 'SELECT COUNT(*) as total FROM certificates';
    const activeSql = 'SELECT COUNT(*) as active FROM certificates WHERE status = "active"';
    const expiredSql = 'SELECT COUNT(*) as expired FROM certificates WHERE status = "expired"';
    const expiringSql = `
      SELECT COUNT(*) as expiring 
      FROM certificates 
      WHERE status = 'active' 
        AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND expiry_date >= CURDATE()
    `;

    const [total, active, expired, expiring] = await Promise.all([
      db.query(totalSql),
      db.query(activeSql),
      db.query(expiredSql),
      db.query(expiringSql)
    ]);

    return {
      total: total[0].total,
      active: active[0].active,
      expired: expired[0].expired,
      expiring: expiring[0].expiring
    };
  }

  static async verify(reference_number, certificate_id = null) {
    let sql, params;
    
    if (certificate_id) {
      sql = `
        SELECT c.*, comp.company_name, comp.contact_email, comp.address
        FROM certificates c
        JOIN companies comp ON c.company_id = comp.id
        WHERE c.reference_number = ? AND c.certificate_id = ? AND c.status = 'active'
      `;
      params = [reference_number, certificate_id];
    } else {
      sql = `
        SELECT c.*, comp.company_name, comp.contact_email, comp.address
        FROM certificates c
        JOIN companies comp ON c.company_id = comp.id
        WHERE c.reference_number = ? AND c.status = 'active'
      `;
      params = [reference_number];
    }

    const results = await db.query(sql, params);
    
    if (results.length === 0) {
      return { valid: false, message: 'Chứng nhận không tồn tại hoặc đã hết hạn' };
    }

    const certificate = results[0];
    
    // Kiểm tra ngày hết hạn
    const currentDate = new Date();
    const expiryDate = new Date(certificate.expiry_date);
    
    if (expiryDate < currentDate) {
      return { valid: false, message: 'Chứng nhận đã hết hạn' };
    }

    // Parse compliance details
    if (certificate.compliance_details) {
      try {
        certificate.compliance_details = JSON.parse(certificate.compliance_details);
      } catch (e) {
        certificate.compliance_details = {};
      }
    }

    return { 
      valid: true, 
      certificate,
      message: 'Chứng nhận hợp lệ'
    };
  }
}

module.exports = Certificate;