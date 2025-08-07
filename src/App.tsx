import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import SecurityControls from './pages/SecurityControls'
import VulnerabilityScanning from './pages/VulnerabilityScanning'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/security-controls" element={<SecurityControls />} />
        <Route path="/vulnerability-scanning" element={<VulnerabilityScanning />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App