import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'
import {
  Report,
  Download,
  Share,
  Print,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  DateRange,
} from '@mui/icons-material'
import { useState } from 'react'

interface ComplianceReport {
  id: string
  title: string
  type: 'compliance' | 'assessment' | 'vulnerability' | 'audit'
  status: 'draft' | 'final' | 'approved'
  createdDate: string
  period: string
  author: string
  size: string
  score?: number
}

const reports: ComplianceReport[] = [
  {
    id: 'RPT-001',
    title: 'PCI DSS Compliance Assessment Report Q4 2024',
    type: 'compliance',
    status: 'approved',
    createdDate: '2024-01-15',
    period: 'Q4 2024',
    author: 'Compliance Team',
    size: '2.4 MB',
    score: 85,
  },
  {
    id: 'RPT-002',
    title: 'Self-Assessment Questionnaire (SAQ-D)',
    type: 'assessment',
    status: 'final',
    createdDate: '2024-01-10',
    period: 'January 2024',
    author: 'Security Team',
    size: '1.8 MB',
    score: 78,
  },
  {
    id: 'RPT-003',
    title: 'Vulnerability Assessment Report',
    type: 'vulnerability',
    status: 'final',
    createdDate: '2024-01-08',
    period: 'January 2024',
    author: 'Security Team',
    size: '3.2 MB',
  },
  {
    id: 'RPT-004',
    title: 'Internal Security Audit Report',
    type: 'audit',
    status: 'draft',
    createdDate: '2024-01-05',
    period: 'December 2023',
    author: 'Audit Team',
    size: '1.5 MB',
    score: 72,
  },
  {
    id: 'RPT-005',
    title: 'Penetration Testing Report',
    type: 'vulnerability',
    status: 'approved',
    createdDate: '2024-01-03',
    period: 'December 2023',
    author: 'External Auditor',
    size: '4.1 MB',
  },
]

const scheduledReports = [
  {
    id: 'SCH-001',
    title: 'Monthly Compliance Summary',
    frequency: 'Monthly',
    nextRun: '2024-02-01',
    recipients: 'compliance@company.com',
    status: 'active',
  },
  {
    id: 'SCH-002',
    title: 'Quarterly Assessment Report',
    frequency: 'Quarterly',
    nextRun: '2024-04-01',
    recipients: 'management@company.com',
    status: 'active',
  },
  {
    id: 'SCH-003',
    title: 'Weekly Vulnerability Summary',
    frequency: 'Weekly',
    nextRun: '2024-01-22',
    recipients: 'security@company.com',
    status: 'paused',
  },
]

export default function Reports() {
  const [tabValue, setTabValue] = useState(0)
  const [reportType, setReportType] = useState('all')
  const [dateRange, setDateRange] = useState('last-30-days')

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'final':
        return 'info'
      case 'draft':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'compliance':
        return '#10b981'
      case 'assessment':
        return '#3b82f6'
      case 'vulnerability':
        return '#ef4444'
      case 'audit':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compliance':
        return <CheckCircle />
      case 'assessment':
        return <Report />
      case 'vulnerability':
        return <Warning />
      case 'audit':
        return <Visibility />
      default:
        return <Report />
    }
  }

  const complianceReports = reports.filter(r => r.type === 'compliance').length
  const assessmentReports = reports.filter(r => r.type === 'assessment').length
  const vulnerabilityReports = reports.filter(r => r.type === 'vulnerability').length
  const auditReports = reports.filter(r => r.type === 'audit').length

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Reports & Documentation
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Generate, manage, and export compliance reports and documentation.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-green-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Compliance Reports
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    {complianceReports}
                  </Typography>
                </div>
                <Avatar className="bg-green-100">
                  <CheckCircle className="text-green-600" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-blue-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Assessment Reports
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {assessmentReports}
                  </Typography>
                </div>
                <Avatar className="bg-blue-100">
                  <Report className="text-blue-600" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-red-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Vulnerability Reports
                  </Typography>
                  <Typography variant="h4" className="font-bold text-red-600">
                    {vulnerabilityReports}
                  </Typography>
                </div>
                <Avatar className="bg-red-100">
                  <Warning className="text-red-600" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-purple-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Audit Reports
                  </Typography>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    {auditReports}
                  </Typography>
                </div>
                <Avatar className="bg-purple-100">
                  <Visibility className="text-purple-600" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box className="mb-6">
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Reports" />
          <Tab label="Scheduled Reports" />
          <Tab label="Report Templates" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          {/* Filters */}
          <Card className="card-gradient mb-6">
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      label="Report Type"
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="compliance">Compliance</MenuItem>
                      <MenuItem value="assessment">Assessment</MenuItem>
                      <MenuItem value="vulnerability">Vulnerability</MenuItem>
                      <MenuItem value="audit">Audit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={dateRange}
                      label="Date Range"
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <MenuItem value="last-7-days">Last 7 days</MenuItem>
                      <MenuItem value="last-30-days">Last 30 days</MenuItem>
                      <MenuItem value="last-90-days">Last 90 days</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Reports"
                    variant="outlined"
                    placeholder="Search by title or author..."
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    startIcon={<Report />}
                    fullWidth
                    className="bg-blue-600"
                  >
                    Generate New Report
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card className="card-gradient">
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold">Report</TableCell>
                      <TableCell className="font-semibold">Type</TableCell>
                      <TableCell className="font-semibold">Status</TableCell>
                      <TableCell className="font-semibold">Period</TableCell>
                      <TableCell className="font-semibold">Author</TableCell>
                      <TableCell className="font-semibold">Score</TableCell>
                      <TableCell className="font-semibold">Size</TableCell>
                      <TableCell className="font-semibold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <div>
                            <Typography variant="subtitle2" className="font-semibold">
                              {report.title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 text-sm">
                              {report.id} • Created: {report.createdDate}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center space-x-2">
                            <Avatar
                              sx={{
                                bgcolor: getTypeColor(report.type),
                                width: 24,
                                height: 24,
                              }}
                            >
                              {getTypeIcon(report.type)}
                            </Avatar>
                            <Chip
                              label={report.type}
                              size="small"
                              variant="outlined"
                              style={{ color: getTypeColor(report.type), borderColor: getTypeColor(report.type) }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={getStatusColor(report.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.period}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.author}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {report.score && (
                            <Box className="flex items-center space-x-2">
                              <Typography variant="body2" className="font-semibold">
                                {report.score}%
                              </Typography>
                              <Box
                                className={`w-2 h-2 rounded-full ${
                                  report.score >= 80 ? 'bg-green-500' :
                                  report.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="text-gray-600">
                            {report.size}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <Download />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <Share />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <Print />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {tabValue === 1 && (
        <Card className="card-gradient">
          <CardContent>
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="font-semibold">
                Scheduled Reports
              </Typography>
              <Button variant="contained" startIcon={<Schedule />} className="bg-blue-600">
                Schedule New Report
              </Button>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold">Report Name</TableCell>
                    <TableCell className="font-semibold">Frequency</TableCell>
                    <TableCell className="font-semibold">Next Run</TableCell>
                    <TableCell className="font-semibold">Recipients</TableCell>
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell className="font-semibold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledReports.map((scheduled) => (
                    <TableRow key={scheduled.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" className="font-semibold">
                          {scheduled.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 text-sm">
                          {scheduled.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={scheduled.frequency} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center space-x-2">
                          <DateRange className="text-gray-400 text-sm" />
                          <Typography variant="body2">
                            {scheduled.nextRun}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {scheduled.recipients}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scheduled.status}
                          color={scheduled.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box className="flex space-x-1">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                          <Button size="small" variant="outlined">
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {['Compliance Assessment Template', 'Vulnerability Report Template', 'Audit Report Template', 'Executive Summary Template'].map((template, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="card-gradient h-full">
                <CardContent>
                  <Box className="flex items-center justify-between mb-3">
                    <Avatar className="bg-blue-100">
                      <Report className="text-blue-600" />
                    </Avatar>
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" className="font-semibold mb-2">
                    {template}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    Standardized template for generating consistent reports
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}