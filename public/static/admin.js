// Admin panel JavaScript
class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.user = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.token) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }

        this.bindEvents();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => this.handleLogout(e));
        
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // Modal save buttons
        document.getElementById('saveCertificateBtn').addEventListener('click', () => this.saveCertificate());
        document.getElementById('saveCompanyBtn').addEventListener('click', () => this.saveCompany());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('adminToken', this.token);
                this.showDashboard();
                this.loadDashboardData();
            } else {
                errorDiv.textContent = data.message;
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
            errorDiv.classList.remove('hidden');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        this.token = null;
        this.user = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        
        if (this.user) {
            document.getElementById('userInfo').textContent = `${this.user.full_name} (${this.user.role})`;
        }
    }

    handleMenuClick(e) {
        e.preventDefault();
        const section = e.target.closest('.menu-item').dataset.section;
        
        // Update active menu
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        e.target.closest('.menu-item').classList.add('active');
        
        // Show section
        this.showSection(section);
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
        
        // Show selected section
        document.getElementById(`${section}Section`).classList.remove('hidden');
        
        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'certificates':
                this.loadCertificates();
                break;
            case 'companies':
                this.loadCompanies();
                break;
            case 'logs':
                this.loadLogs();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const response = await this.apiCall('/api/admin/dashboard');
            const data = response.data;

            // Update stats cards
            this.updateStatsCards(data.statistics);
            
            // Update expiring certificates
            this.updateExpiringCertificates(data.expiring_certificates);
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateStatsCards(stats) {
        const statsContainer = document.getElementById('statsCards');
        statsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-1">Tổng Chứng Nhận</h6>
                            <div class="stats-number">${stats.total}</div>
                        </div>
                        <i class="fas fa-certificate fa-2x text-primary"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-1">Đang Hoạt Động</h6>
                            <div class="stats-number text-success">${stats.active}</div>
                        </div>
                        <i class="fas fa-check-circle fa-2x text-success"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-1">Đã Hết Hạn</h6>
                            <div class="stats-number text-danger">${stats.expired}</div>
                        </div>
                        <i class="fas fa-times-circle fa-2x text-danger"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-1">Sắp Hết Hạn</h6>
                            <div class="stats-number text-warning">${stats.expiring}</div>
                        </div>
                        <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                    </div>
                </div>
            </div>
        `;
    }

    updateExpiringCertificates(certificates) {
        const tbody = document.getElementById('expiringCertificates');
        
        if (certificates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có chứng nhận sắp hết hạn</td></tr>';
            return;
        }

        tbody.innerHTML = certificates.map(cert => {
            const expiryDate = new Date(cert.expiry_date);
            const today = new Date();
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            return `
                <tr>
                    <td><code>${cert.certificate_id}</code></td>
                    <td>${cert.company_name}</td>
                    <td>${cert.certificate_type}</td>
                    <td>${this.formatDate(expiryDate)}</td>
                    <td>
                        <span class="badge ${daysLeft <= 7 ? 'bg-danger' : 'bg-warning'}">
                            ${daysLeft} ngày
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async loadCertificates() {
        try {
            const response = await this.apiCall('/api/admin/certificates');
            const certificates = response.data.certificates;
            
            this.updateCertificatesTable(certificates);
            this.loadCompaniesForSelect();
            
        } catch (error) {
            console.error('Error loading certificates:', error);
        }
    }

    updateCertificatesTable(certificates) {
        const tbody = document.getElementById('certificatesTable');
        
        tbody.innerHTML = certificates.map(cert => `
            <tr>
                <td><code>${cert.certificate_id}</code></td>
                <td><code>${cert.reference_number}</code></td>
                <td>${cert.company_name}</td>
                <td>${cert.certificate_type}</td>
                <td>${this.formatDate(new Date(cert.issue_date))}</td>
                <td>${this.formatDate(new Date(cert.expiry_date))}</td>
                <td>
                    <span class="status-badge status-${cert.status}">
                        ${this.getStatusText(cert.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.open('/verify/${cert.reference_number}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="adminPanel.updateCertificateStatus('${cert.certificate_id}', '${cert.status}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadCompanies() {
        try {
            const response = await this.apiCall('/api/admin/companies');
            const companies = response.data;
            
            this.updateCompaniesTable(companies);
            
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }

    updateCompaniesTable(companies) {
        const tbody = document.getElementById('companiesTable');
        
        tbody.innerHTML = companies.map(company => `
            <tr>
                <td><code>${company.company_code}</code></td>
                <td>${company.company_name}</td>
                <td>${company.contact_email}</td>
                <td>${company.contact_phone || '-'}</td>
                <td>
                    <span class="status-badge status-${company.status}">
                        ${company.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadLogs() {
        try {
            const response = await this.apiCall('/api/admin/verification-logs');
            const logs = response.data.logs;
            
            this.updateLogsTable(logs);
            
        } catch (error) {
            console.error('Error loading logs:', error);
        }
    }

    updateLogsTable(logs) {
        const tbody = document.getElementById('logsTable');
        
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${new Date(log.verified_at).toLocaleString('vi-VN')}</td>
                <td><code>${log.certificate_id}</code></td>
                <td><code>${log.reference_number || '-'}</code></td>
                <td>${log.ip_address}</td>
                <td>
                    <span class="badge ${log.verification_result === 'success' ? 'bg-success' : 'bg-danger'}">
                        ${log.verification_result === 'success' ? 'Thành công' : 'Thất bại'}
                    </span>
                </td>
                <td>${log.error_message || '-'}</td>
            </tr>
        `).join('');
    }

    async loadCompaniesForSelect() {
        try {
            const response = await this.apiCall('/api/admin/companies');
            const companies = response.data;
            
            const select = document.getElementById('companySelect');
            select.innerHTML = '<option value="">Chọn công ty...</option>' +
                companies.map(company => 
                    `<option value="${company.id}">${company.company_name}</option>`
                ).join('');
                
        } catch (error) {
            console.error('Error loading companies for select:', error);
        }
    }

    async saveCertificate() {
        const formData = {
            company_id: parseInt(document.getElementById('companySelect').value),
            certificate_type: document.getElementById('certificateType').value,
            issue_date: document.getElementById('issueDate').value,
            expiry_date: document.getElementById('expiryDate').value,
            assessment_level: document.getElementById('assessmentLevel').value,
            qsa_company: document.getElementById('qsaCompany').value,
            compliance_details: {}
        };

        try {
            const response = await this.apiCall('/api/admin/certificates', 'POST', formData);
            
            if (response.success) {
                alert('Chứng nhận đã được tạo thành công!\nMã chứng nhận: ' + response.data.certificate_id + '\nSố tham chiếu: ' + response.data.reference_number);
                bootstrap.Modal.getInstance(document.getElementById('newCertificateModal')).hide();
                this.loadCertificates();
                document.getElementById('newCertificateForm').reset();
            }
        } catch (error) {
            console.error('Error saving certificate:', error);
            alert('Lỗi khi lưu chứng nhận');
        }
    }

    async saveCompany() {
        const formData = {
            company_name: document.getElementById('companyName').value,
            company_code: document.getElementById('companyCode').value,
            contact_email: document.getElementById('contactEmail').value,
            contact_phone: document.getElementById('contactPhone').value,
            address: document.getElementById('companyAddress').value
        };

        try {
            const response = await this.apiCall('/api/admin/companies', 'POST', formData);
            
            if (response.success) {
                alert('Công ty đã được tạo thành công!');
                bootstrap.Modal.getInstance(document.getElementById('newCompanyModal')).hide();
                this.loadCompanies();
                this.loadCompaniesForSelect();
                document.getElementById('newCompanyForm').reset();
            }
        } catch (error) {
            console.error('Error saving company:', error);
            alert('Lỗi khi lưu công ty: ' + (error.message || 'Unknown error'));
        }
    }

    async updateCertificateStatus(certificateId, currentStatus) {
        const newStatus = prompt(`Thay đổi trạng thái chứng nhận ${certificateId}:\n\n1. active - Hoạt động\n2. expired - Hết hạn\n3. revoked - Thu hồi\n4. suspended - Tạm ngừng\n\nTrạng thái hiện tại: ${currentStatus}\nNhập trạng thái mới:`, currentStatus);
        
        if (!newStatus || !['active', 'expired', 'revoked', 'suspended'].includes(newStatus)) {
            return;
        }

        try {
            await this.apiCall(`/api/admin/certificates/${certificateId}/status`, 'PATCH', { status: newStatus });
            alert('Cập nhật trạng thái thành công!');
            this.loadCertificates();
        } catch (error) {
            console.error('Error updating certificate status:', error);
            alert('Lỗi khi cập nhật trạng thái');
        }
    }

    async apiCall(url, method = 'GET', data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }

        return result;
    }

    formatDate(date) {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Hoạt động',
            'expired': 'Hết hạn',
            'revoked': 'Thu hồi',
            'suspended': 'Tạm ngừng'
        };
        return statusMap[status] || status;
    }

    updateTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleString('vi-VN');
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();