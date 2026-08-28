import { Navigate, Route, Routes } from 'react-router-dom'
import { ConsoleLayout } from './components/ConsoleLayout'
import { PublicLayout } from './components/PublicLayout'
import { RequireAccount } from './account/RequireAccount'
import { RequireAuth } from './auth/RequireAuth'
import { AvailableTestsPage } from './pages/AvailableTestsPage'
import { CampaignWorkspacePage } from './pages/CampaignWorkspacePage'
import { CommunityHomePage } from './pages/CommunityHomePage'
import { CommunityTagsPage } from './pages/CommunityTagsPage'
import { CreditsPage } from './pages/CreditsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MyCampaignsPage } from './pages/MyCampaignsPage'
import { MyTestsPage } from './pages/MyTestsPage'
import { NewCampaignPage } from './pages/NewCampaignPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicTestDetailPage } from './pages/PublicTestDetailPage'
import { PublicTestsPage } from './pages/PublicTestsPage'
import { SubmissionReviewPage } from './pages/SubmissionReviewPage'
import { TestWorkspacePage } from './pages/TestWorkspacePage'

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<CommunityHomePage />} />
        <Route path="tests" element={<PublicTestsPage />} />
        <Route path="tests/:testSlug" element={<PublicTestDetailPage />} />
        <Route path="tags" element={<CommunityTagsPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<RequireAccount />}>
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
