export function ScenarioComparisonChart({ previous, current }) {
  if (!current) {
    return (
      <div className="chart-empty-state" role="status" aria-live="polite">
        <div className="chart-empty-icon">↗</div>
        <p>No current calculation available.</p>
      </div>
    )
  }

  if (!previous) {
    return (
      <div className="chart-empty-state" role="status" aria-live="polite">
        <div className="chart-empty-icon">↗</div>
        <p>No previous calculations available for comparison.</p>
      </div>
    )
  }

  const chartData = [
    {
      label: 'Previous',
      principal: Number(previous.principal || 0),
      interest: Number(previous.interest || 0),
      total: Number(previous.totalAmount || 0),
    },
    {
      label: 'Current',
      principal: Number(current.principal || 0),
      interest: Number(current.simpleInterest || 0),
      total: Number(current.totalAmount || 0),
    },
  ]

  const maxValue = Math.max(...chartData.flatMap((item) => [item.principal, item.interest, item.total]), 1)

  return (
    <div className="scenario-chart" aria-label="Historical comparison chart">
      <div className="scenario-chart-legend">
        <span><i className="legend-swatch primary" /> Principal</span>
        <span><i className="legend-swatch secondary" /> Interest</span>
        <span><i className="legend-swatch success" /> Total</span>
      </div>

      <div className="grouped-comparison">
        {['principal', 'interest', 'total'].map((metric) => (
          <div key={metric} className="comparison-group">
            <div className="comparison-label">{metric === 'principal' ? 'Principal' : metric === 'interest' ? 'Interest' : 'Total'}</div>
            <div className="comparison-bars">
              {chartData.map((row) => (
                <div key={`${row.label}-${metric}`} className="comparison-bar-wrap">
                  <span
                    className={`comparison-bar comparison-${metric}`}
                    style={{ height: `${((row[metric] / maxValue) * 100).toFixed(2)}%` }}
                    title={`${row.label}: ₹${Number(row[metric]).toLocaleString('en-IN')}`}
                  />
                  <small>{row.label}</small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
