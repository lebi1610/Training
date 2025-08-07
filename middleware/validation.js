const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  createCertificate: Joi.object({
    company_id: Joi.number().integer().positive().required(),
    certificate_type: Joi.string().valid('PCI DSS Level 1', 'PCI DSS Level 2', 'PCI DSS Level 3', 'PCI DSS Level 4').required(),
    issue_date: Joi.date().required(),
    expiry_date: Joi.date().greater(Joi.ref('issue_date')).required(),
    assessment_level: Joi.string().max(50).optional(),
    qsa_company: Joi.string().max(255).optional(),
    compliance_details: Joi.object().optional()
  }),

  createCompany: Joi.object({
    company_name: Joi.string().max(255).required(),
    company_code: Joi.string().max(50).required(),
    contact_email: Joi.string().email().max(255).required(),
    contact_phone: Joi.string().max(50).optional(),
    address: Joi.string().optional()
  }),

  verifyReference: Joi.object({
    reference_number: Joi.string().required(),
    certificate_id: Joi.string().optional()
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  updateCertificateStatus: Joi.object({
    status: Joi.string().valid('active', 'expired', 'revoked', 'suspended').required()
  })
};

module.exports = {
  validateRequest,
  validateQuery,
  schemas
};