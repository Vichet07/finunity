'use client'

import { useEffect, useState } from 'react'

// ============================================================
// MOCK DATA - Replace with real API calls when backend is ready
// ============================================================

const MOCK_FARMER = {
  name: 'Sok Pisey',
  crop: 'Rice (Jasmine)',
  landSize: '2.5 hectares',
  province: 'Kampong Thom',
}

const MOCK_SENSOR_READINGS = {
  soilMoisture: 42, // percentage
  batteryVoltage: 3.8, // volts
  lastUpdated: '2026-09-19T14:30:00Z',
}

const MOCK_WEATHER = {
  rainfallForecast: '15mm expected in next 48 hours',
  seasonalComparison: 'Above average rainfall for this period (120% of normal)',
}

const MOCK_NDVI = {
  trend: 'Stable',
  currentValue: 0.62,
  history: [
    { date: '2026-09-01', value: 0.58 },
    { date: '2026-09-08', value: 0.60 },
    { date: '2026-09-15', value: 0.62 },
  ],
}

const MOCK_AG_RISK = {
  interpretation: 'Soil moisture levels are adequate for current growth stage. Recent rainfall has been sufficient. No immediate agricultural stress detected.',
  confidenceLevel: 'Medium-High',
}

const MOCK_AI_DEBATE = {
  advocate: 'The farmer demonstrates consistent soil moisture management (42%) and benefits from above-average seasonal rainfall (120% of normal). NDVI trend shows stable crop health (0.62, up from 0.58 three weeks ago). Battery voltage (3.8V) indicates reliable sensor operation. Evidence supports proceeding with standard financing terms.',
  skeptic: 'While current readings appear adequate, the NDVI improvement is modest (0.04 over 3 weeks). Soil moisture at 42% is acceptable but not optimal for peak growth. Dependency on favorable rainfall creates vulnerability if weather patterns shift. Recommend cautious approach with reduced voucher amount.',
  synthesis: `## Balanced Assessment

### What's Strong
- NDVI stable, no canopy decline (0.62, trending up from 0.58)
- Above-average seasonal rainfall (120% of normal) provides natural irrigation buffer
- Reliable sensor operation (battery 3.8V indicates good maintenance)

### What's Concerning
- Soil moisture low for rice (28% relative to optimal 45-55% for this growth stage)
- Modest NDVI improvement (only +0.04 over 3 weeks)
- Weather dependency creates vulnerability if rainfall patterns shift

### Data Gaps / Missing Evidence
- No timestamps on sensor readings (cannot verify freshness)
- Limited historical baseline for this specific plot
- No ground-truth verification of crop health

Recommendation level: Recommend Additional Evidence before deciding

This assessment is a recommendation for human review, not a final decision.`,
}

// ============================================================
// MOCK SCORECARD — matches shape from backend/agents/scorecard.py
// ============================================================

const MOCK_SCORECARD = {
  verdict: 'NEEDS_EVIDENCE',
  verdict_label: 'Recommend Additional Evidence',
  strong_points: [
    'NDVI stable, no canopy decline (0.62, trending up from 0.58)',
    'Above-average seasonal rainfall (120% of normal)',
    'Reliable sensor operation (battery 3.8V)',
  ],
  concerns: [
    'Soil moisture low for rice (28% vs optimal 45-55%)',
    'Modest NDVI improvement (+0.04 over 3 weeks)',
    'Weather dependency vulnerability',
  ],
  missing_evidence: [
    'No timestamps on sensor readings',
    'Limited historical baseline for this plot',
    'No ground-truth verification of crop health',
  ],
}

const MOCK_FINANCING = {
  voucherAmount: '$450 USD equivalent',
  purpose: 'Seeds, fertilizer, and equipment rental for upcoming season',
  disclaimer: 'This is a recommendation for human review, not a final decision.',
}

const MOCK_ANCHOR_STATUS = {
  status: 'Active',
  redemptionProgress: '2 of 3 milestones completed',
  lastRedemption: '2026-09-10',
  nextEligible: '2026-09-25',
}

const MOCK_TIMELINE = [
  { date: '2026-09-19', type: 'sensor_reading', description: 'Soil moisture: 42%, Battery: 3.8V' },
  { date: '2026-09-15', type: 'satellite', description: 'NDVI reading: 0.62' },
  { date: '2026-09-10', type: 'anchor_redemption', description: 'Milestone 2 redeemed - Mid-season check-in' },
  { date: '2026-09-08', type: 'satellite', description: 'NDVI reading: 0.60' },
  { date: '2026-09-05', type: 'weather_event', description: 'Significant rainfall: 22mm' },
  { date: '2026-09-01', type: 'satellite', description: 'NDVI reading: 0.58' },
  { date: '2026-08-28', type: 'anchor_redemption', description: 'Milestone 1 redeemed - Planting confirmed' },
  { date: '2026-08-25', type: 'sensor_reading', description: 'Initial sensor activation' },
]

// ============================================================
// COMPONENT: Section Card
// ============================================================

function SectionCard({ title, children }) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ============================================================
// COMPONENT: Farmer Profile
// ============================================================

function FarmerProfile({ farmer }) {
  return (
    <SectionCard title="1. Farmer Profile">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium text-gray-900">{farmer.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Crop</p>
          <p className="font-medium text-gray-900">{farmer.crop}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Land Size</p>
          <p className="font-medium text-gray-900">{farmer.landSize}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Province</p>
          <p className="font-medium text-gray-900">{farmer.province}</p>
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Live Sensor Readings
// ============================================================

function LiveSensorReadings({ readings }) {
  const lastUpdated = new Date(readings.lastUpdated).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <SectionCard title="2. Live Sensor Readings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Soil Moisture</p>
          <p className="text-3xl font-bold text-blue-900">{readings.soilMoisture}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Battery Voltage</p>
          <p className="text-3xl font-bold text-green-900">{readings.batteryVoltage}V</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Last Updated</p>
          <p className="text-lg font-medium text-gray-900">{lastUpdated}</p>
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Weather Data
// ============================================================

function WeatherData({ weather }) {
  return (
    <SectionCard title="3. Weather">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Rainfall Forecast</p>
          <p className="text-lg font-medium text-gray-900">{weather.rainfallForecast}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Seasonal Comparison</p>
          <p className="text-lg font-medium text-gray-900">{weather.seasonalComparison}</p>
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Satellite/NDVI Trend
// ============================================================

function SatelliteNDVI({ ndvi }) {
  return (
    <SectionCard title="4. Satellite / NDVI Trend">
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-gray-500">Current Value:</span>
          <span className="text-2xl font-bold text-green-700">{ndvi.currentValue}</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            ndvi.trend === 'Stable' ? 'bg-blue-100 text-blue-700' :
            ndvi.trend === 'Improving' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {ndvi.trend}
          </span>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500 mb-3">Recent History</p>
        <div className="flex gap-4 overflow-x-auto">
          {ndvi.history.map((reading, idx) => (
            <div key={idx} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 min-w-[120px]">
              <p className="text-xs text-gray-500">{reading.date}</p>
              <p className="text-xl font-semibold text-gray-900">{reading.value}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Agricultural Risk Interpretation
// ============================================================

function AgRiskInterpretation({ risk }) {
  return (
    <SectionCard title="5. Agricultural Risk Interpretation">
      <div className="mb-3">
        <p className="text-sm text-gray-500 mb-2">Assessment</p>
        <p className="text-base text-gray-900 leading-relaxed">{risk.interpretation}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Confidence Level</p>
        <p className="font-medium text-gray-900">{risk.confidenceLevel}</p>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: AI Debate Summary (with Scorecard + Expandable Full Reasoning)
// ============================================================

function AIDebateSummary({ debate, scorecard }) {
  const [showFullReasoning, setShowFullReasoning] = useState(false)

  // Determine badge color based on verdict
  const getVerdictBadgeStyle = (verdict) => {
    switch (verdict) {
      case 'APPROVE':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'APPROVE_REDUCED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'NEEDS_EVIDENCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'DECLINE':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <SectionCard title="6. AI Debate Summary">
      {/* Scorecard Block - Always Visible at Top */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-4 py-2 rounded-lg border font-semibold text-lg ${getVerdictBadgeStyle(scorecard?.verdict || 'UNKNOWN')}`}>
            {scorecard?.verdict_label || 'Unable to Determine Recommendation'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strong Points */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-green-800">Strong Points</h3>
            </div>
            {scorecard?.strong_points?.length > 0 ? (
              <ul className="space-y-2">
                {scorecard.strong_points.map((point, idx) => (
                  <li key={idx} className="text-sm text-green-900 flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700 italic">No strong points identified</p>
            )}
          </div>

          {/* Concerns */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold text-red-800">Concerns</h3>
            </div>
            {scorecard?.concerns?.length > 0 ? (
              <ul className="space-y-2">
                {scorecard.concerns.map((point, idx) => (
                  <li key={idx} className="text-sm text-red-900 flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-700 italic">No concerns identified</p>
            )}
          </div>

          {/* Missing Evidence */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-gray-800">Missing Evidence</h3>
            </div>
            {scorecard?.missing_evidence?.length > 0 ? (
              <ul className="space-y-2">
                {scorecard.missing_evidence.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-900 flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 italic">No missing evidence identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Full Reasoning Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowFullReasoning(!showFullReasoning)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg 
            className={`w-4 h-4 transform transition-transform ${showFullReasoning ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFullReasoning ? 'Hide full reasoning' : 'Show full reasoning'}
        </button>

        {showFullReasoning && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            {/* Advocate */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-green-800">Advocate Argument (For Approval)</h3>
              </div>
              <p className="text-sm text-green-900 leading-relaxed">{debate.advocate}</p>
            </div>

            {/* Skeptic */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-semibold text-red-800">Skeptic Argument (Against Approval)</h3>
              </div>
              <p className="text-sm text-red-900 leading-relaxed">{debate.skeptic}</p>
            </div>

            {/* Synthesis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="font-semibold text-blue-800">Synthesis Recommendation</h3>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">{debate.synthesis}</p>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Financing Recommendation
// ============================================================

function FinancingRecommendation({ financing }) {
  return (
    <SectionCard title="7. Financing Recommendation">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-4">
        <div className="mb-3">
          <p className="text-sm text-yellow-800 font-medium mb-1">Recommended Voucher Amount</p>
          <p className="text-3xl font-bold text-yellow-900">{financing.voucherAmount}</p>
        </div>
        <div className="mb-3">
          <p className="text-sm text-yellow-800 font-medium mb-1">Purpose</p>
          <p className="text-base text-yellow-900">{financing.purpose}</p>
        </div>
      </div>
      <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded">
        <p className="text-sm text-gray-700 font-medium">{financing.disclaimer}</p>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Anchor Redemption Status
// ============================================================

function AnchorRedemptionStatus({ anchor }) {
  return (
    <SectionCard title="8. Anchor Redemption Status">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <p className="text-lg font-medium text-green-700">{anchor.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Redemption Progress</p>
          <p className="text-lg font-medium text-gray-900">{anchor.redemptionProgress}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Last Redemption</p>
          <p className="text-base text-gray-900">{anchor.lastRedemption}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Next Eligible</p>
          <p className="text-base text-gray-900">{anchor.nextEligible}</p>
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// COMPONENT: Farmer Evidence Timeline
// ============================================================

function FarmerEvidenceTimeline({ timeline }) {
  const getTypeStyles = (type) => {
    switch (type) {
      case 'sensor_reading':
        return { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'text-blue-700' }
      case 'satellite':
        return { bg: 'bg-green-100', dot: 'bg-green-500', text: 'text-green-700' }
      case 'anchor_redemption':
        return { bg: 'bg-purple-100', dot: 'bg-purple-500', text: 'text-purple-700' }
      case 'weather_event':
        return { bg: 'bg-gray-100', dot: 'bg-gray-500', text: 'text-gray-700' }
      default:
        return { bg: 'bg-gray-100', dot: 'bg-gray-500', text: 'text-gray-700' }
    }
  }

  const formatType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <SectionCard title="9. Farmer Evidence Timeline">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-4">
          {timeline.map((event, idx) => {
            const styles = getTypeStyles(event.type)
            return (
              <div key={idx} className="relative flex gap-4 pl-10">
                <div className={`absolute left-0 w-8 h-8 rounded-full ${styles.bg} ${styles.dot} border-2 border-white flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full ${styles.dot}`}></div>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                      {formatType(event.type)}
                    </span>
                    <span className="text-xs text-gray-500">{event.date}</span>
                  </div>
                  <p className="text-sm text-gray-900">{event.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    // TODO: Replace with actual API call to backend
    // Example: fetch('/api/evaluate').then(res => res.json()).then(setData)
    
    // Simulating API delay
    setTimeout(() => {
      setData({
        farmer: MOCK_FARMER,
        sensorReadings: MOCK_SENSOR_READINGS,
        weather: MOCK_WEATHER,
        ndvi: MOCK_NDVI,
        agRisk: MOCK_AG_RISK,
        aiDebate: MOCK_AI_DEBATE,
        scorecard: MOCK_SCORECARD,
        financing: MOCK_FINANCING,
        anchor: MOCK_ANCHOR_STATUS,
        timeline: MOCK_TIMELINE,
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FinUnity</h1>
              <p className="text-sm text-gray-500">Glass Box Dashboard — Decision Support Tool</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Farmer ID</p>
              <p className="font-mono text-sm text-gray-700">KH-KPT-2024-0847</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <FarmerProfile farmer={data.farmer} />
        <LiveSensorReadings readings={data.sensorReadings} />
        <WeatherData weather={data.weather} />
        <SatelliteNDVI ndvi={data.ndvi} />
        <AgRiskInterpretation risk={data.agRisk} />
        <AIDebateSummary debate={data.aiDebate} scorecard={data.scorecard} />
        <FinancingRecommendation financing={data.financing} />
        <AnchorRedemptionStatus anchor={data.anchor} />
        <FarmerEvidenceTimeline timeline={data.timeline} />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500">
            FinUnity Glass Box Dashboard — For loan officer review only. 
            All recommendations require human verification before any financial commitment.
          </p>
        </div>
      </footer>
    </div>
  )
}
