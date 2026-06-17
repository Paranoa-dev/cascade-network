import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import OverviewPage from './pages/OverviewPage'
import DisbursePage from './pages/DisbursePage'
import PluginsPage from './pages/PluginsPage'
import PaymentsPage from './pages/PaymentsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/disburse" element={<DisbursePage />} />
        <Route path="/plugins" element={<PluginsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </Layout>
  )
}
