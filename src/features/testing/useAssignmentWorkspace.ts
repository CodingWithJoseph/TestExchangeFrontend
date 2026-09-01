import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../../api/ApiContext'
import type { Assignment, Campaign, Dispute, Review, Submission, TestingContract, TestingSession } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export type AssignmentWorkspace = {
  assignment: Assignment
  campaign: Campaign
  contract: TestingContract | null
  submissions: Submission[]
  reviews: Review[]
  disputes: Dispute[]
  sessions: TestingSession[]
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
      const [assignment, campaign, submissions, disputes, sessions] = await Promise.all([
        api.getAssignment(assignmentId),
        api.getAssignmentCampaign(assignmentId),
        api.listSubmissions(assignmentId),
        api.listDisputes(),
        api.listTestingSessions(assignmentId),
      ])
      const isOwner = campaign.owner_id === user.id
      const contract = assignment.status === 'applied' && !isOwner
        ? null
        : await (isOwner ? api.getOwnedContract(campaign.id) : api.getAssignmentContract(assignment.id))
      const reviews = (await Promise.all(submissions.map((submission) => api.listReviews(submission.id)))).flat()
      setWorkspace({ assignment, campaign, contract, submissions, reviews, disputes: disputes.filter((item) => item.assignment_id === assignment.id), sessions, isOwner })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this testing workspace.')
    } finally {
      setIsLoading(false)
    }
  }, [api, assignmentId, user])

  useEffect(() => { void refresh() }, [refresh])
  return { workspace, isLoading, error, refresh }
}
