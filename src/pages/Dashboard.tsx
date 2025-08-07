import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material'
import {
  TrendingUp,
  Security,
  Warning,
  CheckCircle,
  Error,
  Assessment,
  BugReport,
  Shield,
  Timeline,
  MoreVert,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const complianceData = [
  { name: 'Req 1: Firewall', compliance: 95, status: 'compliant' },
  { name: 'Req 2: Passwords', compliance: 88, status: 'compliant' },
  { name: 'Req 3: Cardholder Data', compliance: 72, status: 'in-progress' },
  { name: 'Req 4: Encryption', compliance: 91, status: 'compliant' },
  { name: 'Req 5: Antivirus', compliance: 85, status: 'compliant' },
  { name: 'Req 6: Secure Systems', compliance: 68, status: 'in-progress' },
]

const pieData = [
  { name: 'Compliant', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#f59e0b' },
  { name: 'Non-Compliant', value: 10, color: '#ef4444' },
]

const trendData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 72 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 85 },
]

const recentActivities = [
  {
    id: 1,
    title: 'Vulnerability scan completed',
    description: '127 vulnerabilities found, 23 critical',
    time: '2 hours ago',
    type: 'warning',
    icon: <BugReport />,
  },
  {
    id: 2,
    title: 'Firewall configuration updated',
    description: 'New rules applied successfully',
    time: '4 hours ago',
    type: 'success',
    icon: <Security />,
  },
  {
    id: 3,
    title: 'SAQ-D assessment started',
    description: 'Self-assessment questionnaire in progress',
    time: '1 day ago',
    type: 'info',
    icon: <Assessment />,
  },
  {
    id: 4,
    title: 'Password policy violation',
    description: '15 users need to update passwords',
    time: '2 days ago',
    type: 'error',
    icon: <Warning />,
  },
]

export default function Dashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success'
      case 'in-progress':
        return 'warning'
      case 'non-compliant':
        return 'error'
      default:
        return 'default'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      case 'info':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  return (
    <Box>
      <Typography variant="h4" className="font-bold text-gray-800 mb-6">
        PCI DSS Compliance Overview
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-green-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Overall Compliance
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    85%
                  </Typography>
                </div>
                <Avatar className="bg-green-100">
                  <CheckCircle className="text-green-600" />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={85}
                className="mt-2"
                sx={{
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#10b981',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-blue-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Security Score
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    92
                  </Typography>
                </div>
                <Avatar className="bg-blue-100">
                  <Shield className="text-blue-600" />
                </Avatar>
              </Box>
              <Box className="flex items-center mt-2">
                <TrendingUp className="text-green-500 text-sm mr-1" />
                <Typography variant="body2" className="text-green-600">
                  +5 from last month
                </Typography>
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
                    Open Issues
                  </Typography>
                  <Typography variant="h4" className="font-bold text-yellow-600">
                    23
                  </Typography>
                </div>
                <Avatar className="bg-yellow-100">
                  <Warning className="text-yellow-600" />
                </Avatar>
              </Box>
              <Typography variant="body2" className="text-gray-600 mt-2">
                15 critical, 8 medium
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-gradient border-l-4 border-l-red-500">
            <CardContent>
              <Box className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Vulnerabilities
                  </Typography>
                  <Typography variant="h4" className="font-bold text-red-600">
                    127
                  </Typography>
                </div>
                <Avatar className="bg-red-100">
                  <BugReport className="text-red-600" />
                </Avatar>
              </Box>
              <Typography variant="body2" className="text-gray-600 mt-2">
                Last scan: 2 hours ago
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Compliance by Requirements */}
        <Grid item xs={12} lg={8}>
          <Card className="card-gradient h-full">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                PCI DSS Requirements Compliance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="compliance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Distribution */}
        <Grid item xs={12} lg={4}>
          <Card className="card-gradient h-full">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Compliance Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box className="mt-4 space-y-2">
                {pieData.map((item, index) => (
                  <Box key={index} className="flex items-center justify-between">
                    <Box className="flex items-center">
                      <Box
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" className="font-semibold">
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Trend */}
        <Grid item xs={12} lg={8}>
          <Card className="card-gradient">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Compliance Score Trend
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={4}>
          <Card className="card-gradient">
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  Recent Activities
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} className="px-0">
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getActivityColor(activity.type),
                          width: 32,
                          height: 32,
                        }}
                      >
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography variant="body2" className="text-gray-600">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {activity.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}