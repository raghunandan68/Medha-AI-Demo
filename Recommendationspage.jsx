import { useState, useEffect } from 'react'
import {
  BarChart2, Loader2, Sparkles, RefreshCw, Trophy,
  TrendingUp, TrendingDown, Target, BookOpen, Zap,
  CheckCircle, AlertCircle, Clock, MessageSquare
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend
} from 'recharts'
import axios from 'axios'
import { useDocuments } from '../context/DocumentContext'
import NoDocument from '../components/NoDocument'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const PRIORITY_COLOR = { High: 'text-danger bg-danger/10 border-danger/30', Medium: 'text-warning bg-warning/10 border-warning/30', Low: 'text-accent bg-accent/10 border-accent/30' }
const MASTERY_COLOR  = { Beginner: '#FF6B6B', Developing: '#FFD166', Proficient: '#6C63FF', Advanced: '#00E5A0' }
const CHART_COLORS   = ['#6C63FF', '#00E5A0', '#FFD166', '#FF6B6B', '#A89CFF', '#00B07A']

// ── Gauge ──────────────────────────────────────────────────────────────────
function ScoreGauge({ score, level }) {
  const color = MASTERY_COLOR[level] || '#6C63FF'
  const r     = 72
  const circ  = 2 * Math.PI * r
  const dash  = (score / 100) * circ * 0.75   // 270° arc

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="180" height="130" viewBox="0 0 180 130">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="90" cy="100" r={r} fill="none" stroke="#2A2A45" strokeWidth="14"
          strokeDasharray={`${circ * 0.75} ${circ}`} strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform="rotate(0 90 100)" />
        {/* Fill */}
        <circle cx="90" cy="100" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.125}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="90" y="94" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">{score}</text>
        <text x="90" y="114" textAnchor="middle" fill="#9CA3AF" fontSize="11">{level}</text>
      </svg>
      <p className="text-xs text-gray-500">Overall Mastery Score</p>
    </div>
  )
}

// ── Engagement pills ────────────────────────────────────────────────────────
function EngagementPill({ icon: Icon, label, value, active }) {
  return (
    <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl border text-sm',
      active ? 'border-accent/40 bg-accent/10 text-accent' : 'border-surface-border text-gray-500')}>
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
      {value !== undefined && <span className="ml-auto text-xs font-semibold">{value}</span>}
    </div>
  )
}

// ── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}{p.name?.includes('score') || p.name === 'score' ? '%' : ''}</p>
      ))}
    </div>
  )
}

export default function RecommendationsPage() {
  const { activeDoc }           = useDocuments()
  const [rec, setRec]           = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [genAt, setGenAt]       = useState(null)

  useEffect(() => {
    if (activeDoc) fetchAll(false)
  }, [activeDoc?.id])

  if (!activeDoc) return <NoDocument />

  const fetchAll = async (refresh = false) => {
    setLoading(true); setError(null)
    try {
      const [recRes, analyticsRes] = await Promise.all([
        axios.get(`/api/documents/${activeDoc.id}/recommendations`, { params: { refresh, user_id: 'demo_user' } }),
        axios.get(`/api/documents/${activeDoc.id}/analytics`,       { params: { user_id: 'demo_user' } }),
      ])
      setRec(recRes.data.recommendations)
      setGenAt(recRes.data.generated_at)
      setAnalytics(analyticsRes.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart2 className="text-primary-light" size={22} /> Recommendations
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeDoc.filename}</p>
        </div>
        <div className="flex items-center gap-3">
          {genAt && <p className="text-xs text-gray-600">Generated {new Date(genAt).toLocaleDateString()}</p>}
          <button onClick={() => fetchAll(true)} disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {rec ? 'Refresh' : 'Generate'}
          </button>
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading && (
        <div className="card p-16 flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Analysing your learning journey…</p>
        </div>
      )}

      <AnimatePresence>
      {rec && analytics && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          {/* ── Row 1: Gauge + Engagement + Radar ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Gauge */}
            <div className="card p-6 flex flex-col items-center justify-center">
              <ScoreGauge score={rec.overall_score ?? 0} level={rec.mastery_level ?? 'Beginner'} />
            </div>

            {/* Engagement */}
            <div className="card p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Engagement</p>
              <EngagementPill icon={BookOpen}      label="Summary"      active={analytics.engagement.has_summary} />
              <EngagementPill icon={CreditCard2}   label="Flashcards"   active={analytics.engagement.has_flashcards} />
              <EngagementPill icon={Brain2}        label="Quiz"         active={analytics.engagement.has_quiz}
                value={analytics.engagement.quiz_attempts ? `${analytics.engagement.quiz_attempts}×` : null} />
              <EngagementPill icon={MessageSquare} label="Chat"
                active={analytics.engagement.chat_messages > 0}
                value={analytics.engagement.chat_messages || null} />
              {analytics.engagement.quiz_attempts > 0 && (
                <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs text-gray-500">
                  <span>Avg quiz score</span>
                  <span className={clsx('font-bold text-sm',
                    analytics.engagement.avg_score >= 80 ? 'text-accent' :
                    analytics.engagement.avg_score >= 60 ? 'text-warning' : 'text-danger')}>
                    {analytics.engagement.avg_score}%
                  </span>
                </div>
              )}
            </div>

            {/* Radar: topic scores */}
            {rec.topic_scores?.length > 0 && (
              <div className="card p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Topic Mastery</p>
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={rec.topic_scores.map(t => ({ subject: t.topic.split(' ').slice(0,2).join(' '), score: t.score }))}>
                    <PolarGrid stroke="#2A2A45" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<ChartTip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Row 2: Score trend + Answer breakdown ── */}
          {analytics.score_trend.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score trend */}
              <div className="card p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">Quiz Score Trend</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analytics.score_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A45" />
                    <XAxis dataKey="attempt" tick={{ fill: '#6B7280', fontSize: 11 }} label={{ value: 'Attempt', position: 'insideBottom', offset: -2, fill: '#6B7280', fontSize: 10 }} />
                    <YAxis domain={[0,100]} tick={{ fill: '#6B7280', fontSize: 11 }} unit="%" />
                    <Tooltip content={<ChartTip />} />
                    <Line dataKey="score" name="score" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Correct vs Wrong */}
              <div className="card p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">Correct vs Wrong per Attempt</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.answer_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A45" />
                    <XAxis dataKey="attempt" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }} />
                    <Bar dataKey="correct" name="Correct" fill="#00E5A0" radius={[4,4,0,0]} />
                    <Bar dataKey="wrong"   name="Wrong"   fill="#FF6B6B" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chat timeline */}
          {analytics.chat_timeline.length > 0 && (
            <div className="card p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">Chat Activity</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={analytics.chat_timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A45" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="messages" name="Messages" fill="#FFD166" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Row 3: Strengths + Weaknesses ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
                <TrendingUp size={13} /> Strengths
              </p>
              {rec.strengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <CheckCircle size={15} className="text-accent shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
            <div className="card p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-warning font-semibold flex items-center gap-1.5">
                <TrendingDown size={13} /> Areas to Improve
              </p>
              {rec.weaknesses?.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* ── Topic score bars ── */}
          {rec.topic_scores?.length > 0 && (
            <div className="card p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">Topic Breakdown</p>
              <div className="space-y-3">
                {rec.topic_scores.map((t, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{t.topic}</span>
                      <span className={clsx('font-semibold',
                        t.score >= 80 ? 'text-accent' : t.score >= 60 ? 'text-warning' : 'text-danger')}>
                        {t.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recommendations list ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3 flex items-center gap-1.5">
              <Target size={13} /> Action Recommendations
            </p>
            <div className="space-y-3">
              {rec.recommendations?.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={clsx('card p-4 border', PRIORITY_COLOR[r.priority])}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('badge border text-[10px]', PRIORITY_COLOR[r.priority])}>{r.priority}</span>
                        <p className="font-semibold text-sm text-white">{r.title}</p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <Zap size={11} className="text-primary-light" />
                        <span className="text-primary-light">{r.action}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── 5-day study plan ── */}
          {rec.study_plan?.length > 0 && (
            <div className="card p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-1.5">
                <Clock size={13} /> 5-Day Study Plan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {rec.study_plan.map((s, i) => (
                  <div key={i} className="bg-surface rounded-xl p-3 border border-surface-border">
                    <p className="text-[10px] font-bold text-primary-light mb-1">{s.day}</p>
                    <p className="text-xs text-gray-300 leading-snug">{s.task}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Engagement narrative ── */}
          {rec.engagement_summary && (
            <div className="card p-5 border-l-4 border-primary">
              <p className="text-xs uppercase tracking-widest text-primary-light font-semibold mb-2">Learning Journey Summary</p>
              <p className="text-sm text-gray-300 leading-relaxed">{rec.engagement_summary}</p>
            </div>
          )}

        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

// mini icon stubs so we don't need extra imports
function CreditCard2(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function Brain2(props)      { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.96-4.22A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.96-4.22A2.5 2.5 0 0 0 14.5 2Z"/></svg> }