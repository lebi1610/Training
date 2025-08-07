const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const db = require('../config/database');
const { validateRequest, schemas } = require('../middleware/validation');

// Log verification attempt
const logVerification = async (certificate_id, reference_number, ip_address, user_agent, result, error_message = null) => {
  try {
    await db.query(
      `INSERT INTO verification_logs 
       (certificate_id, reference_number, ip_address, user_agent, verification_result, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [certificate_id, reference_number, ip_address, user_agent, result, error_message]
    );
  } catch (error) {
    console.error('Error logging verification:', error);
  }
};

// Public route: Verify certificate by reference number
router.post('/verify', validateRequest(schemas.verifyReference), async (req, res) => {
  try {
    const { reference_number, certificate_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');

    const result = await Certificate.verify(reference_number, certificate_id);

    if (result.valid) {
      await logVerification(
        result.certificate.certificate_id,
        reference_number,
        ip_address,
        user_agent,
        'success'
      );

      res.json({
        success: true,
        message: result.message,
        certificate: {
          certificate_id: result.certificate.certificate_id,
          company_name: result.certificate.company_name,
          certificate_type: result.certificate.certificate_type,
          issue_date: result.certificate.issue_date,
          expiry_date: result.certificate.expiry_date,
          status: result.certificate.status,
          assessment_level: result.certificate.assessment_level,
          qsa_company: result.certificate.qsa_company,
          compliance_details: result.certificate.compliance_details
        }
      });
    } else {
      await logVerification(
        certificate_id || 'unknown',
        reference_number,
        ip_address,
        user_agent,
        'failed',
        result.message
      );

      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    
    await logVerification(
      req.body.certificate_id || 'unknown',
      req.body.reference_number,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'failed',
      'System error'
    );

    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, vui lòng thử lại sau'
    });
  }
});

// Public route: Get certificate verification page
router.get('/certificate/:reference_number', async (req, res) => {
  try {
    const { reference_number } = req.params;
    const certificate = await Certificate.findByReferenceNumber(reference_number);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Chứng nhận không tồn tại'
      });
    }

    // Check if certificate is expired
    const currentDate = new Date();
    const expiryDate = new Date(certificate.expiry_date);
    
    res.json({
      success: true,
      certificate: {
        certificate_id: certificate.certificate_id,
        company_name: certificate.company_name,
        certificate_type: certificate.certificate_type,
        issue_date: certificate.issue_date,
        expiry_date: certificate.expiry_date,
        status: certificate.status,
        assessment_level: certificate.assessment_level,
        qsa_company: certificate.qsa_company,
        compliance_details: certificate.compliance_details,
        is_expired: expiryDate < currentDate
      }
    });
  } catch (error) {
    console.error('Certificate lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, vui lòng thử lại sau'
    });
  }
});

// Public route: Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PCI DSS Certificate Verification System is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;