import { Navigate, Route, Routes } from 'react-router-dom'
import { ConsoleLayout } from './components/ConsoleLayout'
import { RequireAuth } from './auth/RequireAuth'
import { AvailableTestsPage } from './pages/AvailableTestsPage'
import { CampaignWorkspacePage } from './pages/CampaignWorkspacePage'
import { CreditsPage } from './pages/CreditsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MyCampaignsPage } from './pages/MyCampaignsPage'
import { MyTestsPage } from './pages/MyTestsPage'
import { NewCampaignPage } from './pages/NewCampaignPage'
import { ProfilePage } from './pages/ProfilePage'
import { SubmissionReviewPage } from './pages/SubmissionReviewPage'
import { TestWorkspacePage } from './pages/TestWorkspacePage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/console" element={<ConsoleLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="available-tests" element={<AvailableTestsPage />} />
          <Route path="my-tests" element={<MyTestsPage />} />
          <Route path="my-tests/:assignmentId" element={<TestWorkspacePage />} />
          <Route path="my-campaigns" element={<MyCampaignsPage />} />
          <Route path="my-campaigns/new" element={<NewCampaignPage />} />
          <Route path="my-campaigns/:campaignId" element={<CampaignWorkspacePage />} />
          <Route path="my-campaigns/:campaignId/submissions/:submissionId" element={<SubmissionReviewPage />} />
          <Route path="credits" element={<CreditsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/console" replace />} />
    </Routes>
  )
}
