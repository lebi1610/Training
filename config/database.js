require('dotenv').config();
const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pci_dss_certificates',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });
  }

  async getConnection() {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    let connection;
    try {
      connection = await this.getConnection();
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async transaction(callback) {
    let connection;
    try {
      connection = await this.getConnection();
      await connection.beginTransaction();
      
      const result = await callback(connection);
      
      await connection.commit();
      return result;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Transaction error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new Database();