import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../../api/ApiContext'
import type { Assignment, Campaign, Review, Submission, TestingContract } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export type AssignmentWorkspace = {
  assignment: Assignment
  campaign: Campaign
  contract: TestingContract | null
  submissions: Submission[]
  reviews: Review[]
  isOwner: boolean
}

export function useAssignmentWorkspace(assignmentId: string | undefined) {
  const api = useApi()
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<AssignmentWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!assignmentId || !user) return
    setIsLoading(true)
    setError(null)
    try {
      const [assignment, publicCampaigns, ownedCampaigns, submissions] = await Promise.all([
        api.getAssignment(assignmentId),
        api.listPublicCampaigns(),
        api.listOwnedCampaigns(),
        api.listSubmissions(assignmentId),
      ])
      const campaign = [...ownedCampaigns, ...publicCampaigns].find((item) => item.id === assignment.campaign_id)
      if (!campaign) throw new Error('The campaign for this assignment is unavailable.')
      const isOwner = campaign.owner_id === user.id
      const contract = assignment.status === 'applied' && !isOwner
        ? null
        : await (isOwner ? api.getOwnedContract(campaign.id) : api.getAssignmentContract(assignment.id))
      const reviews = (await Promise.all(submissions.map((submission) => api.listReviews(submission.id)))).flat()
      setWorkspace({ assignment, campaign, contract, submissions, reviews, isOwner })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this testing workspace.')
    } finally {
      setIsLoading(false)
    }
  }, [api, assignmentId, user])

  useEffect(() => { void refresh() }, [refresh])
  return { workspace, isLoading, error, refresh }
}
