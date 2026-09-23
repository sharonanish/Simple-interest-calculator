import { useState } from 'react'

import { CustomSelect } from '../components/ui/CustomSelect.jsx'
import { getCurrentCalculation } from '../services/calculationService.js'
import { deleteReport, downloadReport, getReports, buildReportFromCalculation } from '../services/reportService.js'
import { getHistory } from '../services/historyService.js'

export function ReportsPage() {
  const [reports, setReports] = useState(() => getReports())
  const [selectedEntry, setSelectedEntry] = useState(() => getHistory()[0] || getCurrentCalculation() || null)

  const handleDelete = (id) => {
    setReports(deleteReport(id))
  }

  const handleDownload = (report) => {
    downloadReport(report)
  }

  const currentCalculation = getCurrentCalculation()
  const validCurrentCalculation = currentCalculation && Number(currentCalculation.principal) > 0 && Number(currentCalculation.time) > 0
  const reportSource = selectedEntry && Number(selectedEntry.principal) > 0 && Number(selectedEntry.time) > 0 ? selectedEntry : (validCurrentCalculation ? currentCalculation : null)

  const handleGenerateReport = () => {
    if (!reportSource) {
      return
    }

    const next = buildReportFromCalculation(reportSource)
    setReports((current) => [next, ...current])
    setSelectedEntry(reportSource)
  }

  return (
    <div className="page-stack">
      <section className="panel section-header-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Reports</p>
            <h2>Generated analysis</h2>
          </div>
          <button type="button" className="primary-button" onClick={handleGenerateReport} disabled={!reportSource}>
            {reportSource ? 'Generate Report' : 'Calculate an amount before generating a report.'}
          </button>
        </div>

        <div className="report-picker">
          {getHistory().length === 0 ? (
            <p className="helper-copy">Create a calculation first to generate a report.</p>
          ) : (
            <CustomSelect
              label="Selected calculation"
              value={selectedEntry ? selectedEntry.id : ''}
              onChange={(value) => {
                const next = getHistory().find((entry) => entry.id === value)
                setSelectedEntry(next || null)
              }}
              options={getHistory().map((entry) => ({
                value: entry.id,
                label: `${new Date(entry.date).toLocaleDateString()} • ₹${Number(entry.principal).toLocaleString('en-IN')}`,
              }))}
              placeholder="Choose a calculation"
            />
          )}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleGenerateReport}
          disabled={!selectedEntry}
        >
          {selectedEntry ? 'Generate Report' : 'Create a calculation first to generate a report.'}
        </button>
      </section>

      <section className="reports-grid">
        {reports.length === 0 ? (
          <div className="empty-state-panel">
            <h3>No reports yet.</h3>
            <p>Generate a report from a calculation to see it here.</p>
          </div>
        ) : reports.map((report) => (
          <article key={report.id} className="report-card panel">
            <div className="report-card__head">
              <div>
                <p className="eyebrow">Report</p>
                <h3>{report.name}</h3>
              </div>
              <span className="status-badge">{report.status}</span>
            </div>

            <div className="report-meta">
              <div><span>Date</span><strong>{new Date(report.date).toLocaleDateString()}</strong></div>
              <div><span>Type</span><strong>{report.type}</strong></div>
              <div><span>Principal</span><strong>₹{Number(report.principal).toLocaleString('en-IN')}</strong></div>
              <div><span>Interest</span><strong>₹{Number(report.interest).toLocaleString('en-IN')}</strong></div>
              <div><span>Total</span><strong>₹{Number(report.totalAmount).toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="report-actions">
              <button type="button" className="secondary-button">View</button>
              <button type="button" className="primary-button" onClick={() => handleDownload(report)}>Download</button>
              <button type="button" className="danger-button" onClick={() => handleDelete(report.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
