import { jsPDF } from 'jspdf'

function getReportsStorageKey() {
  return 'simpleInterest_reports'
}

function safeParse(value) {
  if (!value) return []

  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

function getModeLabel(mode) {
  const labels = {
    'calculate-interest': 'Calculate Interest',
    'find-principal': 'Find Principal',
    'find-rate': 'Find Interest Rate',
    'find-time': 'Find Time',
  }

  return labels[mode] || 'Calculate Interest'
}

function buildProjectionChartData(entry) {
  const principal = Number(entry.principal || 0)
  const rate = Number(entry.rate || 0)
  const time = Number(entry.time || 0)
  const unit = entry.timeUnit || entry.unit || 'years'
  const totalPeriods = Math.max(1, unit === 'months' ? Math.min(12, Math.ceil(time)) : Math.min(5, Math.ceil(time)))

  const points = []
  for (let index = 0; index <= totalPeriods; index += 1) {
    const elapsed = unit === 'months' ? index / 12 : index
    const amount = principal + (principal * rate * elapsed) / 100
    points.push({
      label: index,
      amount,
      interest: amount - principal,
    })
  }

  return points
}

function drawProjectionChartCanvas(entry) {
  if (typeof document === 'undefined') {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = 460
  canvas.height = 180
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  const data = buildProjectionChartData(entry)
  const padding = 24
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2
  const maxTotal = Math.max(...data.map((point) => point.amount), 1)

  context.fillStyle = '#f8fbff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = '#dfeaf8'
  context.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + (chartHeight / 4) * i
    context.beginPath()
    context.moveTo(padding, y)
    context.lineTo(canvas.width - padding, y)
    context.stroke()
  }

  context.beginPath()
  context.moveTo(padding, canvas.height - padding)
  context.lineTo(canvas.width - padding, canvas.height - padding)
  context.lineTo(canvas.width - padding, padding)
  context.strokeStyle = '#b6c7e0'
  context.stroke()

  context.beginPath()
  data.forEach((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth
    const y = canvas.height - padding - (point.amount / maxTotal) * chartHeight
    if (index === 0) {
      context.moveTo(x, y)
    } else {
      context.lineTo(x, y)
    }
  })
  context.strokeStyle = '#2aa6ff'
  context.lineWidth = 3
  context.stroke()

  data.forEach((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth
    const y = canvas.height - padding - (point.amount / maxTotal) * chartHeight
    context.beginPath()
    context.fillStyle = '#7b5af8'
    context.arc(x, y, 3, 0, Math.PI * 2)
    context.fill()
  })

  return canvas.toDataURL('image/png')
}

export function getReports() {
  const saved = safeParse(localStorage.getItem(getReportsStorageKey()))
  if (saved && Array.isArray(saved)) {
    return saved
  }

  localStorage.setItem(getReportsStorageKey(), JSON.stringify([]))
  return []
}

export function addReport(report) {
  const reports = getReports()
  const nextReport = {
    ...report,
    id: report.id || `report-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: report.date || new Date().toISOString(),
    status: report.status || 'Generated',
  }

  const nextReports = [nextReport, ...reports]
  localStorage.setItem(getReportsStorageKey(), JSON.stringify(nextReports))
  return nextReports
}

export function deleteReport(id) {
  const nextReports = getReports().filter((report) => report.id !== id)
  localStorage.setItem(getReportsStorageKey(), JSON.stringify(nextReports))
  return nextReports
}

export function buildReportFromCalculation(entry) {
  const reportName = `${getModeLabel(entry.mode || 'calculate-interest')} Summary`
  const graphImage = drawProjectionChartCanvas(entry)

  return {
    id: `report-${Date.now()}`,
    name: reportName,
    date: entry.date || new Date().toISOString(),
    type: getModeLabel(entry.mode || 'calculate-interest'),
    principal: Number(entry.principal || 0),
    rate: Number(entry.rate || 0),
    time: Number(entry.time || 0),
    timeUnit: entry.timeUnit || entry.unit || 'years',
    interest: Number(entry.interest || 0),
    totalAmount: Number(entry.totalAmount || 0),
    status: 'Generated',
    graphImage,
  }
}

export function downloadReport(report) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const user = JSON.parse(localStorage.getItem('simpleInterest_user') || 'null')

  doc.setFillColor(8, 15, 27)
  doc.rect(0, 0, 595, 842, 'F')
  doc.setTextColor(238, 247, 255)
  doc.setFontSize(22)
  doc.text('SIMPLE INTEREST CALCULATOR', 42, 58)
  doc.setFontSize(12)
  doc.setTextColor(82, 213, 255)
  doc.text('FINANCIAL CALCULATION REPORT', 42, 82)

  doc.setDrawColor(82, 213, 255)
  doc.setLineWidth(1)
  doc.line(42, 92, 552, 92)

  doc.setTextColor(238, 247, 255)
  doc.setFontSize(11)
  const meta = [
    `User: ${user?.fullName || 'User'}`,
    `Email: ${user?.email || 'N/A'}`,
    `Calculation Date: ${new Date(report.date || Date.now()).toLocaleString()}`,
    `Calculation Mode: ${report.type || 'Calculate Interest'}`,
  ]
  meta.forEach((line, index) => doc.text(line, 42, 120 + index * 18))

  doc.setFillColor(17, 24, 39)
  doc.roundedRect(42, 200, 500, 170, 12, 12, 'F')
  doc.setTextColor(238, 247, 255)
  doc.setFontSize(16)
  doc.text('Calculation Summary', 58, 228)
  doc.setFontSize(11)

  const summaryRows = [
    ['Principal', `₹${Number(report.principal || 0).toLocaleString('en-IN')}`],
    ['Interest Rate', `${Number(report.rate || 0)}%`],
    ['Duration', `${Number(report.time || 0)} ${report.timeUnit || 'years'}`],
    ['Simple Interest', `₹${Number(report.interest || 0).toLocaleString('en-IN')}`],
    ['Total Amount', `₹${Number(report.totalAmount || 0).toLocaleString('en-IN')}`],
  ]

  summaryRows.forEach(([label, value], index) => {
    const y = 252 + index * 22
    doc.setTextColor(166, 190, 214)
    doc.text(label, 58, y)
    doc.setTextColor(238, 247, 255)
    doc.text(value, 260, y)
  })

  doc.setFontSize(12)
  doc.setTextColor(82, 213, 255)
  doc.text('Calculation Breakdown', 42, 420)
  doc.setTextColor(238, 247, 255)
  doc.text('Formula: SI = (P × R × T) / 100', 42, 442)
  doc.text(`Result: ₹${Number(report.totalAmount || 0).toLocaleString('en-IN')}`, 42, 462)

  if (report.graphImage) {
    try {
      doc.addImage(report.graphImage, 'PNG', 42, 486, 500, 170)
    } catch {
      // no-op fallback when image data is unavailable
    }
  }

  const safeName = (report.name || 'simple-interest-report').replace(/\s+/g, '-').toLowerCase()
  doc.save(`${safeName}.pdf`)
  return report
}
