import { ArrowRight, CircleAlert, CircleCheck, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { loadJoinedAssignments, testAssignments, workflowStatusClass } from '../features/testing/testingWorkflow'

const tabs = ['All', 'Active', 'In review', 'Completed']

export function MyTestsPage() {
  const [tab, setTab] = useState('All')
  const joinedAssignments = loadJoinedAssignments()
  const allAssignments = [...joinedAssignments, ...testAssignments.filter((test) => !joinedAssignments.some((joined) => joined.id === test.id))]
  const visible = allAssignments.filter((test) => {
    if (tab === 'All') return true
    if (tab === 'Completed') return test.status === 'Approved'
    if (tab === 'Active') return ['Access pending', 'In progress', 'Changes requested'].includes(test.status)
    return test.status === tab
  })

  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR CONTRIBUTIONS" title="My tests" description="Track active contracts, submit evidence, speak privately with developers, and follow every credit decision." />
      <div className="summary-strip">
        <div><Clock3 size={18} /><span><strong>{allAssignments.filter((test) => test.status === 'In review').length}</strong> waiting for review</span></div>
        <div><CircleCheck size={18} /><span><strong>{allAssignments.filter((test) => test.status === 'Approved').length}</strong> approved tests</span></div>
        <div><CircleAlert size={18} /><span><strong>{allAssignments.filter((test) => test.status === 'Changes requested').length}</strong> needs attention</span></div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}
      </div>
      <div className="table-card">
        <div className="data-table table-header"><span>App</span><span>Submitted / joined</span><span>Status</span><span>Reward</span><span /></div>
        {visible.map((test) => (
          <div className="data-table" key={test.id}>
            <span className="table-app"><span className="mini-app-icon">{test.appInitials}</span><span><strong>{test.appName}</strong><small>{test.developer}</small></span></span>
            <span data-label={test.submitted ? 'Submitted' : 'Joined'}>{test.submitted ?? test.joined}</span>
            <span data-label="Status"><span className={`status-pill ${workflowStatusClass(test.status)}`}>{test.status}</span></span>
            <strong data-label="Reward" className={test.status === 'Approved' ? 'positive' : ''}>{test.status === 'Approved' ? '+' : ''}{test.credits} cr</strong>
            <Link className="icon-button" to={`/console/my-tests/${test.id}`} aria-label={`Open ${test.appName}`}><ArrowRight size={17} /></Link>
          </div>
        ))}
      </div>
    </div>
  )
}
