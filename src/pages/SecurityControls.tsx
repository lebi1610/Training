import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Security,
  CheckCircle,
  Warning,
  Error,
  Edit,
  Visibility,
  Add,
  FilterList,
} from '@mui/icons-material'
import { useState } from 'react'

interface SecurityControl {
  id: string
  title: string
  requirement: string
  status: 'compliant' | 'non-compliant' | 'in-progress'
  priority: 'high' | 'medium' | 'low'
  lastReview: string
  owner: string
  description: string
  implementation: number
}

const securityControls: SecurityControl[] = [
  {
    id: 'SC-001',
    title: 'Firewall Configuration Management',
    requirement: 'Requirement 1',
    status: 'compliant',
    priority: 'high',
    lastReview: '2024-01-15',
    owner: 'Network Team',
    description: 'Maintain and review firewall configurations',
    implementation: 95,
  },
  {
    id: 'SC-002',
    title: 'Default Password Management',
    requirement: 'Requirement 2',
    status: 'compliant',
    priority: 'high',
    lastReview: '2024-01-10',
    owner: 'Security Team',
    description: 'Change all vendor default passwords',
    implementation: 100,
  },
  {
    id: 'SC-003',
    title: 'Cardholder Data Encryption',
    requirement: 'Requirement 3',
    status: 'in-progress',
    priority: 'high',
    lastReview: '2024-01-05',
    owner: 'Development Team',
    description: 'Encrypt stored cardholder data',
    implementation: 75,
  },
  {
    id: 'SC-004',
    title: 'Data Transmission Encryption',
    requirement: 'Requirement 4',
    status: 'compliant',
    priority: 'high',
    lastReview: '2024-01-12',
    owner: 'Network Team',
    description: 'Encrypt cardholder data during transmission',
    implementation: 90,
  },
  {
    id: 'SC-005',
    title: 'Anti-virus Software',
    requirement: 'Requirement 5',
    status: 'non-compliant',
    priority: 'medium',
    lastReview: '2024-01-08',
    owner: 'IT Operations',
    description: 'Deploy and maintain anti-virus software',
    implementation: 60,
  },
  {
    id: 'SC-006',
    title: 'Secure System Development',
    requirement: 'Requirement 6',
    status: 'in-progress',
    priority: 'high',
    lastReview: '2024-01-03',
    owner: 'Development Team',
    description: 'Develop and maintain secure systems',
    implementation: 70,
  },
]

export default function SecurityControls() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success'
      case 'non-compliant':
        return 'error'
      case 'in-progress':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444'
      case 'medium':
        return '#f59e0b'
      case 'low':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="text-green-500" />
      case 'non-compliant':
        return <Error className="text-red-500" />
      case 'in-progress':
        return <Warning className="text-yellow-500" />
      default:
        return null
    }
  }

  const compliantCount = securityControls.filter(c => c.status === 'compliant').length
  const nonCompliantCount = securityControls.filter(c => c.status === 'non-compliant').length
  const inProgressCount = securityControls.filter(c => c.status === 'in-progress').length

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Security Controls Management
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Monitor and manage security controls across all PCI DSS requirements.
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
                    Compliant
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    {compliantCount}
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
          <Card className="card-gradient border-l-4 border-l-yellow-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" className="font-bold text-yellow-600">
                    {inProgressCount}
                  </Typography>
                </div>
                <Avatar className="bg-yellow-100">
                  <Warning className="text-yellow-600" />
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
                    Non-Compliant
                  </Typography>
                  <Typography variant="h4" className="font-bold text-red-600">
                    {nonCompliantCount}
                  </Typography>
                </div>
                <Avatar className="bg-red-100">
                  <Error className="text-red-600" />
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
                    Total Controls
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {securityControls.length}
                  </Typography>
                </div>
                <Avatar className="bg-blue-100">
                  <Security className="text-blue-600" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box className="mb-6 flex justify-between items-center">
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Controls" />
          <Tab label="High Priority" />
          <Tab label="Non-Compliant" />
        </Tabs>
        
        <Box className="space-x-2">
          <Button variant="outlined" startIcon={<FilterList />}>
            Filter
          </Button>
          <Button variant="contained" startIcon={<Add />} className="bg-blue-600">
            Add Control
          </Button>
        </Box>
      </Box>

      {/* Controls Table */}
      <Card className="card-gradient">
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Control ID</TableCell>
                  <TableCell className="font-semibold">Title</TableCell>
                  <TableCell className="font-semibold">Requirement</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Priority</TableCell>
                  <TableCell className="font-semibold">Implementation</TableCell>
                  <TableCell className="font-semibold">Owner</TableCell>
                  <TableCell className="font-semibold">Last Review</TableCell>
                  <TableCell className="font-semibold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securityControls.map((control) => (
                  <TableRow key={control.id} hover>
                    <TableCell className="font-mono font-semibold text-blue-600">
                      {control.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="subtitle2" className="font-semibold">
                          {control.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 text-sm">
                          {control.description}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={control.requirement}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center space-x-2">
                        {getStatusIcon(control.status)}
                        <Chip
                          label={control.status.replace('-', ' ')}
                          color={getStatusColor(control.status) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={control.priority}
                        size="small"
                        style={{
                          backgroundColor: getPriorityColor(control.priority),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="w-24">
                        <Box className="flex items-center justify-between mb-1">
                          <Typography variant="body2" className="text-sm">
                            {control.implementation}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={control.implementation}
                          className="h-1 rounded-full"
                          sx={{
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: control.implementation >= 80 ? '#10b981' : 
                                            control.implementation >= 60 ? '#f59e0b' : '#ef4444',
                              borderRadius: '4px',
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {control.owner}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-gray-600">
                        {control.lastReview}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Edit />
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
    </Box>
  )
}