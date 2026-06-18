import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, ChevronRight, BookOpen, Brain, MessageSquare, CreditCard } from 'lucide-react'
import { useDocuments } from '../context/DocumentContext'
import UploadZone from '../components/UploadZone'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: BookOpen,     label: 'Summary',    desc: 'AI-generated summaries & key points', to: '/summary',    color: 'text-blue-400 bg-blue-400/10' },
  { icon: CreditCard,   label: 'Flashcards', desc: 'Study with AI-crafted flashcards',    to: '/flashcards', color: 'text-purple-400 bg-purple-400/10' },
  { icon: Brain,        label: 'Quiz',       desc: 'Test yourself with MCQ quizzes',       to: '/quiz',       color: 'text-accent bg-accent/10' },
  { icon: MessageSquare,label: 'Chat',       desc: 'Ask questions about your document',    to: '/chat',       color: 'text-orange-400 bg-orange-400/10' },
]

export default function Dashboard() {
  const { documents, activeDoc, setActiveDoc, loading, fetchDocuments, removeDocument } = useDocuments()
  const navigate = useNavigate()

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold">Learning Dashboard</h1>
        <p className="text-gray-500 mt-1">Upload a document and start learning with AI</p>
      </div>

      <UploadZone />

      {/* Feature tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, label, desc, to, color }) => (
          <motion.button
            key={to}
            whileHover={{ y: -3 }}
            onClick={() => navigate(to)}
            disabled={!activeDoc}
            className="card p-5 text-left hover:border-primary/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Documents list */}
      {documents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card px-5 py-4 flex items-center gap-4 cursor-pointer transition-all ${
                  activeDoc?.id === doc.id ? 'border-primary/60 bg-primary/5' : 'hover:border-surface-border'
                }`}
                onClick={() => setActiveDoc(doc)}
              >
                <div className="w-9 h-9 rounded-lg bg-surface-border flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-500">{doc.total_chunks} chunks · {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                {activeDoc?.id === doc.id && (
                  <span className="badge bg-primary/20 text-primary-light">Active</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeDocument(doc.id) }}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
