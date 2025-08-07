import { useState, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  Security,
  BugReport,
  Report,
  Settings,
  Notifications,
  AccountCircle,
} from '@mui/icons-material'

const drawerWidth = 280

interface LayoutProps {
  children: ReactNode
}

const navigationItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Self-Assessment', icon: <Assessment />, path: '/assessment' },
  { text: 'Security Controls', icon: <Security />, path: '/security-controls' },
  { text: 'Vulnerability Scanning', icon: <BugReport />, path: '/vulnerability-scanning' },
  { text: 'Reports', icon: <Report />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
]

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const drawer = (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Security className="text-white" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold">
              PCI DSS
            </Typography>
            <Typography variant="caption" className="opacity-90">
              Compliance Center
            </Typography>
          </div>
        </div>
      </div>
      
      <List className="px-3 py-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding className="mb-1">
              <ListItemButton
                component={Link}
                to={item.path}
                className={`rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'hover:bg-white/70 text-gray-700'
                }`}
              >
                <ListItemIcon
                  className={`min-w-0 mr-3 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    className: `font-medium ${
                      isActive ? 'text-white' : 'text-gray-700'
                    }`,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Security className="text-white text-sm" />
            </div>
            <div>
              <Typography variant="body2" className="font-semibold text-green-800">
                Compliance Status
              </Typography>
              <Typography variant="caption" className="text-green-600">
                85% Complete
              </Typography>
            </div>
          </div>
          <div className="mt-2 w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar className="justify-between">
          <div className="flex items-center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className="font-semibold text-gray-800">
              PCI DSS Compliance Dashboard
            </Typography>
          </div>
          
          <div className="flex items-center space-x-2">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications className="text-gray-600" />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                A
              </Avatar>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}