import { Navigate, Route, Routes } from 'react-router-dom'
import { ConsoleLayout } from './components/ConsoleLayout'
import { RequireAuth } from './auth/RequireAuth'
import { AvailableTestsPage } from './pages/AvailableTestsPage'
import { CreditsPage } from './pages/CreditsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MyCampaignsPage } from './pages/MyCampaignsPage'
import { MyTestsPage } from './pages/MyTestsPage'
import { ProfilePage } from './pages/ProfilePage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/console" element={<ConsoleLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="available-tests" element={<AvailableTestsPage />} />
          <Route path="my-tests" element={<MyTestsPage />} />
          <Route path="my-campaigns" element={<MyCampaignsPage />} />
          <Route path="credits" element={<CreditsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/console" replace />} />
    </Routes>
  )
}
