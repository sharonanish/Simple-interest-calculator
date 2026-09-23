const chartData = [42, 58, 54, 80, 72, 90, 86, 110, 98]

export function ChartPanel() {
  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Portfolio projection</p>
          <h3>Growth overview</h3>
        </div>
        <button type="button" className="ghost-button">
          Compare
        </button>
      </div>

      <div className="chart-wrapper" aria-label="Simple interest growth chart">
        <div className="chart-grid" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="chart-bars">
          {chartData.map((value, index) => (
            <div key={value + index} className="chart-bar-group">
              <div
                className="chart-bar"
                style={{ height: `${value}%` }}
                aria-label={`Month ${index + 1}, value ${value}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <span className="legend-item">
          <i className="legend-swatch primary"></i>
          Principal
        </span>
        <span className="legend-item">
          <i className="legend-swatch secondary"></i>
          Interest
        </span>
      </div>
    </section>
  )
}
