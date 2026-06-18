import { useState } from 'react'
import { Loader2, CreditCard, ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react'
import { getFlashcards } from '../utils/api'
import { useDocuments } from '../context/DocumentContext'
import NoDocument from '../components/NoDocument'
import { motion, AnimatePresence } from 'framer-motion'

function FlipCard({ card, flipped, onFlip }) {
  return (
    <div className="relative w-full h-72 cursor-pointer perspective-1000" onClick={onFlip} style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 card flex flex-col items-center justify-center p-8 text-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="badge bg-primary/20 text-primary-light mb-4">{card.category}</span>
          <p className="text-xl font-medium leading-snug">{card.front}</p>
          <p className="text-xs text-gray-600 mt-6">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 card border-primary/40 bg-primary/5 flex flex-col items-center justify-center p-8 text-center backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-gray-200 leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function FlashcardsPage() {
  const { activeDoc } = useDocuments()
  const [cards, setCards]       = useState([])
  const [index, setIndex]       = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  if (!activeDoc) return <NoDocument />

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await getFlashcards(activeDoc.id)
      setCards(data.flashcards)
      setIndex(0); setFlipped(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const prev = () => { setIndex(i => Math.max(0, i - 1)); setFlipped(false) }
  const next = () => { setIndex(i => Math.min(cards.length - 1, i + 1)); setFlipped(false) }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CreditCard className="text-purple-400" size={22} /> Flashcards
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeDoc.filename}</p>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {cards.length ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading && (
        <div className="card h-72 flex items-center justify-center gap-3 text-gray-400">
          <Loader2 size={22} className="animate-spin text-primary" />
          Creating flashcards…
        </div>
      )}

      {cards.length > 0 && !loading && (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{index + 1} / {cards.length}</span>
            <div className="flex-1 mx-4 h-1.5 bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((index + 1) / cards.length) * 100}%` }}
              />
            </div>
            <button onClick={() => setFlipped(false)} className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
              <RotateCw size={12} /> Reset
            </button>
          </div>

          <FlipCard card={cards[index]} flipped={flipped} onFlip={() => setFlipped(v => !v)} />

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={prev} disabled={index === 0} className="btn-ghost flex items-center gap-1.5 disabled:opacity-30">
              <ChevronLeft size={18} /> Prev
            </button>
            <button onClick={next} disabled={index === cards.length - 1} className="btn-ghost flex items-center gap-1.5 disabled:opacity-30">
              Next <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
