export function RecentCalculations() {
  const items = [
    { date: '12 Apr 2026', principal: '₹10,000', rate: '5%', duration: '2 Years', interest: '₹1,000', total: '₹11,000' },
    { date: '09 Apr 2026', principal: '₹25,000', rate: '6%', duration: '18 Months', interest: '₹2,250', total: '₹27,250' },
    { date: '05 Apr 2026', principal: '₹8,500', rate: '4.5%', duration: '3 Years', interest: '₹1,147.50', total: '₹9,647.50' },
  ]

  return (
    <section className="panel recent-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">History</p>
          <h3>Recent calculations</h3>
        </div>
        <button type="button" className="ghost-button">
          View All
        </button>
      </div>

      <div className="recent-list">
        {items.map((item) => (
          <article key={item.date} className="recent-item">
            <div className="recent-meta">
              <span>{item.date}</span>
            </div>
            <div className="recent-grid">
              <div><label>Principal</label><strong>{item.principal}</strong></div>
              <div><label>Rate</label><strong>{item.rate}</strong></div>
              <div><label>Duration</label><strong>{item.duration}</strong></div>
              <div><label>Interest</label><strong>{item.interest}</strong></div>
              <div><label>Total</label><strong className="total-value">{item.total}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
