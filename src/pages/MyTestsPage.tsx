import { CircleAlert, CircleCheck, Clock3, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { testHistory } from '../data/mockData'

const tabs = ['All', 'In progress', 'In review', 'Completed']

export function MyTestsPage() {
  const [tab, setTab] = useState('All')
  const visible = testHistory.filter((test) => {
    if (tab === 'All') return true
    if (tab === 'Completed') return test.status === 'Approved'
    return test.status === tab
  })

  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR CONTRIBUTIONS" title="My tests" description="Track every app you’ve tested and the credits earned from useful feedback." />
      <div className="summary-strip">
        <div><Clock3 size={18} /><span><strong>1</strong> waiting for review</span></div>
        <div><CircleCheck size={18} /><span><strong>7</strong> approved tests</span></div>
        <div><CircleAlert size={18} /><span><strong>1</strong> needs attention</span></div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}
      </div>
      <div className="table-card">
        <div className="data-table table-header"><span>App</span><span>Submitted</span><span>Status</span><span>Reward</span><span /></div>
        {visible.map((test) => (
          <div className="data-table" key={test.id}>
            <span className="table-app"><span className="mini-app-icon">{test.name.slice(0, 2).toUpperCase()}</span><span><strong>{test.name}</strong><small>{test.developer}</small></span></span>
            <span data-label="Submitted">{test.submitted}</span>
            <span data-label="Status"><span className={`status-pill ${test.status.toLowerCase().replace(' ', '-')}`}>{test.status}</span></span>
            <strong data-label="Reward" className="positive">+{test.credits} cr</strong>
            <button className="icon-button" aria-label={`Open ${test.name}`}><ExternalLink size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
