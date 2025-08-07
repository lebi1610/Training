import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  People,
  Integration,
  Save,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material'
import { useState } from 'react'

export default function Settings() {
  const [tabValue, setTabValue] = useState(0)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    criticalAlerts: true,
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: event.target.checked
    }))
  }

  const users = [
    { id: 1, name: 'John Admin', email: 'john@company.com', role: 'Administrator', status: 'Active' },
    { id: 2, name: 'Jane Security', email: 'jane@company.com', role: 'Security Manager', status: 'Active' },
    { id: 3, name: 'Bob Auditor', email: 'bob@company.com', role: 'Auditor', status: 'Inactive' },
  ]

  const integrations = [
    { name: 'Splunk SIEM', status: 'Connected', lastSync: '2 minutes ago' },
    { name: 'Nessus Scanner', status: 'Connected', lastSync: '1 hour ago' },
    { name: 'Active Directory', status: 'Disconnected', lastSync: 'Never' },
    { name: 'Jira Service Desk', status: 'Connected', lastSync: '5 minutes ago' },
  ]

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Settings
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Configure system settings, user preferences, and integrations.
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} className="mb-6">
        <Tab icon={<SettingsIcon />} label="General" />
        <Tab icon={<Notifications />} label="Notifications" />
        <Tab icon={<Security />} label="Security" />
        <Tab icon={<People />} label="Users" />
        <Tab icon={<Integration />} label="Integrations" />
      </Tabs>

      {/* General Settings */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Organization Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      defaultValue="Acme Corporation"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      defaultValue="compliance@acme.com"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Time Zone</InputLabel>
                      <Select defaultValue="UTC-8" label="Time Zone">
                        <MenuItem value="UTC-8">Pacific Standard Time (UTC-8)</MenuItem>
                        <MenuItem value="UTC-5">Eastern Standard Time (UTC-5)</MenuItem>
                        <MenuItem value="UTC+0">Greenwich Mean Time (UTC+0)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select defaultValue="MM/DD/YYYY" label="Date Format">
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Organization Description"
                      defaultValue="Leading e-commerce platform processing credit card transactions globally."
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  System Information
                </Typography>
                <Box className="space-y-3">
                  <Box className="flex justify-between">
                    <Typography variant="body2" color="textSecondary">Version</Typography>
                    <Typography variant="body2" className="font-semibold">v2.1.0</Typography>
                  </Box>
                  <Box className="flex justify-between">
                    <Typography variant="body2" color="textSecondary">Last Update</Typography>
                    <Typography variant="body2" className="font-semibold">Jan 15, 2024</Typography>
                  </Box>
                  <Box className="flex justify-between">
                    <Typography variant="body2" color="textSecondary">License</Typography>
                    <Typography variant="body2" className="font-semibold">Enterprise</Typography>
                  </Box>
                  <Box className="flex justify-between">
                    <Typography variant="body2" color="textSecondary">Support</Typography>
                    <Typography variant="body2" className="font-semibold">Premium</Typography>
                  </Box>
                </Box>
                <Button variant="outlined" fullWidth className="mt-4">
                  Check for Updates
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notifications */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Notification Preferences
                </Typography>
                <Box className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailAlerts}
                        onChange={handleNotificationChange('emailAlerts')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" className="font-semibold">Email Alerts</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receive email notifications for compliance issues
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.pushNotifications}
                        onChange={handleNotificationChange('pushNotifications')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" className="font-semibold">Push Notifications</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Real-time browser notifications for critical events
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.weeklyReports}
                        onChange={handleNotificationChange('weeklyReports')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" className="font-semibold">Weekly Reports</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Automated weekly compliance summary reports
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.criticalAlerts}
                        onChange={handleNotificationChange('criticalAlerts')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" className="font-semibold">Critical Alerts</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Immediate notifications for critical security issues
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Email Configuration
                </Typography>
                <Box className="space-y-3">
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    defaultValue="smtp.company.com"
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Port"
                    defaultValue="587"
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Username"
                    defaultValue="noreply@company.com"
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Button variant="outlined" fullWidth className="mt-4">
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Security Settings */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" className="mb-4">
              Security settings affect all users. Changes require administrator approval.
            </Alert>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Authentication Settings
                </Typography>
                <Box className="space-y-4">
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Require Two-Factor Authentication"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Enable Single Sign-On (SSO)"
                  />
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Allow Password Reset via Email"
                  />
                  <Box className="mt-4">
                    <Typography variant="body2" className="font-semibold mb-2">
                      Password Policy
                    </Typography>
                    <TextField
                      fullWidth
                      label="Minimum Password Length"
                      defaultValue="12"
                      type="number"
                      size="small"
                      className="mb-2"
                    />
                    <TextField
                      fullWidth
                      label="Password Expiry (days)"
                      defaultValue="90"
                      type="number"
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card className="card-gradient">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Session Management
                </Typography>
                <Box className="space-y-4">
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    defaultValue="30"
                    type="number"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Maximum Concurrent Sessions"
                    defaultValue="3"
                    type="number"
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Log All User Activities"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Require Re-authentication for Sensitive Actions"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* User Management */}
      {tabValue === 3 && (
        <Card className="card-gradient">
          <CardContent>
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="font-semibold">
                User Management
              </Typography>
              <Button variant="contained" startIcon={<Add />} className="bg-blue-600">
                Add User
              </Button>
            </Box>
            <List>
              {users.map((user) => (
                <ListItem key={user.id} className="border border-gray-200 rounded-lg mb-2">
                  <Avatar className="mr-3 bg-blue-500">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                        <Box className="flex items-center space-x-2 mt-1">
                          <Typography variant="caption" className="bg-gray-100 px-2 py-1 rounded">
                            {user.role}
                          </Typography>
                          <Typography
                            variant="caption"
                            className={`px-2 py-1 rounded ${
                              user.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="primary" className="mr-1">
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" color="error">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          {integrations.map((integration, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="card-gradient h-full">
                <CardContent>
                  <Box className="flex items-center justify-between mb-3">
                    <Typography variant="h6" className="font-semibold">
                      {integration.name}
                    </Typography>
                    <Box
                      className={`w-3 h-3 rounded-full ${
                        integration.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" className="mb-2">
                    Status: {integration.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="mb-4">
                    Last sync: {integration.lastSync}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    color={integration.status === 'Connected' ? 'error' : 'primary'}
                  >
                    {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Save Button */}
      <Box className="mt-6 flex justify-end">
        <Button
          variant="contained"
          startIcon={<Save />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  )
}