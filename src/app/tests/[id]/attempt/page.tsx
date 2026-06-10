'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ExamAttemptPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params?.id as string

  const [user, setUser] = useState<any>(null)
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({})
  const [marked, setMarked] = useState<{ [key: string]: boolean }>({})
  const [visited, setVisited] = useState<{ [key: string]: boolean }>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [katexReady, setKatexReady] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [showRefreshWarning, setShowRefreshWarning] = useState(false)

  const timeLeftRef = useRef(0)
  const answersRef = useRef<{ [key: string]: string | string[] }>({})
  const userRef = useRef<any>(null)
  const testRef = useRef<any>(null)
  const questionsRef = useRef<any[]>([])
  const submittedRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { userRef.current = user }, [user])
  useEffect(() => { testRef.current = test }, [test])

  // ─── Load KaTeX ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link')
      link.id = 'katex-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
      document.head.appendChild(link)
    }
    const loadKatex = async () => {
      if (!(window as any).katex) {
        await new Promise(resolve => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
        await new Promise(resolve => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
      }
      setKatexReady(true)
    }
    loadKatex()
  }, [])

  const renderLatex = () => {
    if ((window as any).renderMathInElement) {
      const el = document.getElementById('question-area')
      if (el) {
        (window as any).renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        })
      }
    }
  }

  useEffect(() => {
    if (katexReady && !loading) setTimeout(renderLatex, 100)
  }, [katexReady, currentQ, activeSection, loading, questions])

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      

      const { data: testData } = await supabase.from('tests').select('*').eq('id', testId).single()
      if (!testData) { router.push('/tests'); return }
      setTest(testData)
      setTimeLeft(testData.duration_minutes * 60)
      const { data: qData } = await supabase.from('questions').select('*').eq('test_id', testId).order('id')
      setQuestions(qData || [])
      setVisited({ 0: true })
      setLoading(false)
    }
    init()
  }, [testId, router])

  // ─── Refresh Detection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    const stored = sessionStorage.getItem(`exam_refresh_${testId}`)
    const count = stored ? parseInt(stored) : 0
    setRefreshCount(count)
    if (count >= 2) {
      toast.error('⚠️ Too many refreshes! Test auto-submitted.')
      setTimeout(() => autoSubmitFromRef(), 1000)
      return
    }
    if (count > 0) {
      setShowRefreshWarning(true)
      setTimeout(() => setShowRefreshWarning(false), 5000)
    }
    sessionStorage.setItem(`exam_refresh_${testId}`, String(count + 1))
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submittedRef.current) {
        e.preventDefault()
        e.returnValue = 'Are you sure? Your test will be affected!'
        return e.returnValue
      }
    }
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        toast.error('⚠️ Warning: Do not switch tabs during exam!')
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loading, testId])

  // ─── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); autoSubmitFromRef(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, submitted])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const sections = test ? (() => {
    const exam = test.exam_type
    if (exam === 'JEE Main' || exam === 'JEE Advanced') return ['Physics', 'Chemistry', 'Mathematics']
    if (exam === 'CSIR NET') return ['Part A', 'Part B', 'Part C']
    if (exam === 'NEET') return ['Physics', 'Chemistry', 'Biology']
    if (exam === 'IIT JAM') return ['Section A', 'Section B', 'Section C']
    return ['Section A', 'Section B']
  })() : ['Section A']

  const questionsPerSection = questions.length > 0 ? Math.ceil(questions.length / sections.length) : 0
  const sectionQuestions = sections.map((_, i) => questions.slice(i * questionsPerSection, (i + 1) * questionsPerSection))
  const currentSectionQs = sectionQuestions[activeSection] || []
  const globalIndex = activeSection * questionsPerSection + currentQ

  const hasAnswer = (qId: string) => {
    const ans = answers[qId]
    if (ans === undefined || ans === null) return false
    if (Array.isArray(ans)) return ans.length > 0
    return ans.toString().trim() !== ''
  }

  const getStatus = (globalIdx: number) => {
    const qId = questions[globalIdx]?.id
    if (!qId) return 'notvisited'
    const answered = hasAnswer(qId)
    if (marked[qId] && answered) return 'markedanswered'
    if (marked[qId]) return 'marked'
    if (answered) return 'answered'
    if (visited[globalIdx]) return 'notanswered'
    return 'notvisited'
  }

  const goToQuestion = (idx: number) => {
    setCurrentQ(idx)
    setVisited(v => ({ ...v, [activeSection * questionsPerSection + idx]: true }))
  }

  const selectMCQ = (option: string) => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => ({ ...a, [qId]: option }))
  }

  const toggleMSQ = (option: string) => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => {
      const current = (a[qId] as string[]) || []
      const exists = current.includes(option)
      const updated = exists ? current.filter(o => o !== option) : [...current, option].sort()
      return { ...a, [qId]: updated }
    })
  }

  const setNAT = (value: string) => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => ({ ...a, [qId]: value }))
  }

  const clearResponse = () => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => { const n = { ...a }; delete n[qId]; return n })
  }

  const markForReview = () => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setMarked(m => ({ ...m, [qId]: !m[qId] }))
    if (currentQ < currentSectionQs.length - 1) goToQuestion(currentQ + 1)
  }

  const saveAndNext = () => {
    if (currentQ < currentSectionQs.length - 1) goToQuestion(currentQ + 1)
    else if (activeSection < sections.length - 1) {
      setActiveSection(s => s + 1)
      setCurrentQ(0)
    }
  }

  const scoreQuestion = (q: any, ans: string | string[] | undefined): number => {
    if (ans === undefined || ans === null) return 0
    const type = q.question_type || 'MCQ'
    if (type === 'MCQ') {
      if (!ans || (ans as string).trim() === '') return 0
      return (ans as string) === q.correct_answer ? (q.marks || 3) : -(q.negative_marks || 1)
    }
    if (type === 'MSQ') {
      const selected: string[] = Array.isArray(ans) ? ans : []
      if (selected.length === 0) return 0
      const correct: string[] = q.correct_answers || []
      const isFullyCorrect = selected.length === correct.length && selected.every(o => correct.includes(o))
      return isFullyCorrect ? (q.marks || 3) : 0
    }
    if (type === 'NAT') {
      const val = parseFloat((ans as string).trim())
      if (isNaN(val)) return 0
      if (q.nat_answer_exact !== null && q.nat_answer_exact !== undefined) {
        return Math.abs(val - parseFloat(q.nat_answer_exact)) < 0.001 ? (q.marks || 3) : 0
      }
      if (q.nat_answer_min !== null && q.nat_answer_max !== null) {
        return val >= parseFloat(q.nat_answer_min) && val <= parseFloat(q.nat_answer_max) ? (q.marks || 3) : 0
      }
      return 0
    }
    return 0
  }

  // ─── Auto Submit (from refs, safe after refresh) ───────────────────────────
  const autoSubmitFromRef = async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    const qs = questionsRef.current
    const ans = answersRef.current
    const u = userRef.current
    const t = testRef.current
    if (!u || !t || qs.length === 0) return

    let score = 0
    const serializedAnswers: { [key: string]: string } = {}
    qs.forEach(q => {
      const a = ans[q.id]
      if (a) serializedAnswers[q.id] = Array.isArray(a) ? a.join(',') : (a as string)
      if (!a) return
      const type = q.question_type || 'MCQ'
      if (type === 'MCQ') {
        if ((a as string) === q.correct_answer) score += (q.marks || 3)
        else score -= (q.negative_marks || 1)
      } else if (type === 'MSQ') {
        const sel = Array.isArray(a) ? a : []
        const correct = q.correct_answers || []
        if (sel.length === correct.length && sel.every((o: string) => correct.includes(o))) score += (q.marks || 3)
      } else if (type === 'NAT') {
        const val = parseFloat((a as string).trim())
        if (!isNaN(val)) {
          if (q.nat_answer_exact !== null && Math.abs(val - parseFloat(q.nat_answer_exact)) < 0.001) score += (q.marks || 3)
          else if (q.nat_answer_min !== null && val >= parseFloat(q.nat_answer_min) && val <= parseFloat(q.nat_answer_max)) score += (q.marks || 3)
        }
      }
    })
    const totalMarks = qs.reduce((s: number, q: any) => s + (q.marks || 3), 0)
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
    const timeTaken = (t.duration_minutes * 60) - timeLeftRef.current
    sessionStorage.removeItem(`exam_refresh_${testId}`)
    const { data } = await supabase.from('test_attempts').insert([{
      user_id: u.id, test_id: testId,
      answers: serializedAnswers, score, total_marks: totalMarks,
      percentage, time_taken: timeTaken, completed_at: new Date().toISOString()
    }]).select().single()
    if (data) router.push(`/tests/${testId}/result/${data.id}`)
    else router.push(`/tests/${testId}/result/new?score=${score}&total=${totalMarks}`)
  }

  // ─── Normal Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (auto = false) => {
    submittedRef.current = true
    setSubmitted(true)
    setShowConfirm(false)
    sessionStorage.removeItem(`exam_refresh_${testId}`)
    let score = 0, correct = 0, wrong = 0, skipped = 0
    questions.forEach(q => {
      const ans = answers[q.id]
      if (!hasAnswer(q.id)) { skipped++; return }
      const s = scoreQuestion(q, ans)
      score += s
      if (s > 0) correct++
      else if (s < 0) wrong++
      else wrong++
    })
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 3), 0)
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
    const timeTaken = (test.duration_minutes * 60) - timeLeft
    const serializedAnswers: { [key: string]: string } = {}
    Object.entries(answers).forEach(([k, v]) => {
      serializedAnswers[k] = Array.isArray(v) ? v.join(',') : (v as string)
    })
    const { data } = await supabase.from('test_attempts').insert([{
      user_id: user.id, test_id: testId,
      answers: serializedAnswers, score, total_marks: totalMarks,
      percentage, time_taken: timeTaken, completed_at: new Date().toISOString()
    }]).select().single()
    if (data) router.push(`/tests/${testId}/result/${data.id}`)
    else router.push(`/tests/${testId}/result/new?score=${score}&total=${totalMarks}&correct=${correct}&wrong=${wrong}&skipped=${skipped}`)
  }

  const stats = {
    answered: questions.filter(q => hasAnswer(q.id)).length,
    marked: Object.values(marked).filter(Boolean).length,
    notAnswered: questions.filter((q, i) => visited[i] && !hasAnswer(q.id)).length,
    notVisited: questions.length - Object.keys(visited).length
  }

  const statusColor: any = { answered: '#27ae60', notanswered: '#e74c3c', marked: '#8e44ad', markedanswered: '#8e44ad', notvisited: '#95a5a6' }
  const statusShape: any = { answered: '50%', notanswered: '50%', marked: '50%', markedanswered: '50%', notvisited: '4px' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#555' }}>Loading exam...</p>
      </div>
    </div>
  )

  const q = currentSectionQs[currentQ]
  const qType: 'MCQ' | 'MSQ' | 'NAT' = q?.question_type || 'MCQ'
  const msqSelected: string[] = qType === 'MSQ' ? ((answers[q?.id] as string[]) || []) : []
  const natValue: string = qType === 'NAT' ? ((answers[q?.id] as string) || '') : ''
  const qTypeLabel = qType === 'MCQ' ? 'MCQ (Single Correct)' : qType === 'MSQ' ? 'MSQ (Multiple Correct)' : 'NAT (Numerical)'
  const qTypeBg = qType === 'MCQ' ? '#fef9e7' : qType === 'MSQ' ? '#eaf4fb' : '#f0faf4'
  const qTypeColor = qType === 'MCQ' ? '#7d6608' : qType === 'MSQ' ? '#1a5276' : '#1e8449'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Arial,sans-serif', fontSize: '13px' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        .pal-btn { border: none; cursor: pointer; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; transition: transform 0.1s; }
        .pal-btn:hover { transform: scale(1.1); }
        .opt-row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1.5px solid #ccc; border-radius: 8px; cursor: pointer; background: white; transition: all 0.2s; margin-bottom: 10px; font-size: 15px; color: #111; font-weight: 500; }
        .opt-row:hover { border-color: #2471a3; background: #ebf5fb; }
        .opt-row.selected-mcq { border-color: #2471a3; background: #d6eaf8; }
        .opt-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #999; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .opt-row.selected-mcq .opt-circle { background: #2471a3; color: white; border-color: #2471a3; }
        .opt-row-msq { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1.5px solid #ccc; border-radius: 8px; cursor: pointer; background: white; transition: all 0.2s; margin-bottom: 10px; font-size: 15px; color: #111; font-weight: 500; }
        .opt-row-msq:hover { border-color: #1a5276; background: #ebf5fb; }
        .opt-row-msq.selected-msq { border-color: #1a5276; background: #d0e9f7; }
        .opt-checkbox { width: 22px; height: 22px; border-radius: 4px; border: 2px solid #999; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; color: #333; }
        .opt-row-msq.selected-msq .opt-checkbox { background: #1a5276; color: white; border-color: #1a5276; }
        .nat-input { width: 100%; max-width: 320px; padding: 14px 18px; font-size: 22px; font-weight: 700; border: 2px solid #27ae60; border-radius: 10px; outline: none; color: #1a1a1a; letter-spacing: 2px; text-align: center; }
        .nat-input:focus { border-color: #1e8449; box-shadow: 0 0 0 3px rgba(39,174,96,0.15); }
        .sec-tab { padding: 6px 18px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
        .sec-tab.active { background: white; color: #1a3a6b; }
        .sec-tab:not(.active) { background: transparent; color: rgba(255,255,255,0.75); }
        .action-btn { padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; }
        @media (max-width: 768px) { .exam-grid { grid-template-columns: 1fr !important; } .palette-panel { display: none; } }
        @keyframes slideIn { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Refresh Warning Banner */}
      {showRefreshWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, background: refreshCount >= 2 ? '#c0392b' : '#e67e22', color: 'white', padding: '12px 20px', textAlign: 'center', fontWeight: '700', fontSize: '14px', animation: 'slideIn 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          ⚠️ WARNING: Refresh detected! - Do not Refresh Tab  &nbsp;
          {refreshCount >= 2
            ? '🚨 LAST WARNING — test is being auto-submitted!'
            : `You have ${2 - refreshCount} refresh(es) remaining. 3rd refresh = AUTO-SUBMIT!`}
        </div>
      )}

      {/* Top Bar */}
      <div style={{ background: '#1a3a6b', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'white', color: '#1a3a6b', fontWeight: '800', fontSize: '12px', padding: '4px 10px', borderRadius: '4px' }}>MathSamiksha</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>{test?.title}</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>{user?.user_metadata?.full_name || user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {refreshCount > 0 && (
            <div style={{ background: 'rgba(231,76,60,0.3)', border: '1px solid rgba(231,76,60,0.5)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              ⚠️ Refreshes: {refreshCount}/2
            </div>
          )}
          <div style={{ background: timeLeft < 300 ? '#c0392b' : timeLeft < 600 ? '#e67e22' : '#1a5276', padding: '6px 16px', borderRadius: '6px', fontWeight: '800', fontSize: '15px', letterSpacing: '1px', border: '2px solid rgba(255,255,255,0.3)' }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowConfirm(true)} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ background: '#2471a3', display: 'flex', gap: '2px', padding: '6px 16px' }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => { setActiveSection(i); setCurrentQ(0) }} className={`sec-tab ${activeSection === i ? 'active' : ''}`} style={{ borderRadius: '4px 4px 0 0' }}>
            {s}<span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.8 }}>({sectionQuestions[i]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="exam-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', minHeight: 'calc(100vh - 100px)' }}>

        <div id="question-area" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Question Header */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ background: '#ebf5fb', color: '#1a5276', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Q.{globalIndex + 1} of {questions.length}</span>
              <span style={{ background: '#e8f8f5', color: '#1e8449', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>+{q?.marks || 3} / -{qType === 'MSQ' ? 0 : (q?.negative_marks || 1)}</span>
              <span style={{ background: qTypeBg, color: qTypeColor, padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{qTypeLabel}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#888' }}>{sections[activeSection]}</span>
          </div>

          {/* Question Text */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: '120px' }}>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#1a1a1a', fontWeight: '500' }}>
              {q ? q.question_text : 'Question not available'}
            </p>
            {q?.question_image_url && (
              <img src={q.question_image_url} alt="diagram" style={{ maxWidth: '100%', maxHeight: '250px', marginTop: '12px', borderRadius: '6px', border: '1px solid #eee' }} />
            )}
            {qType === 'MSQ' && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#1a5276', background: '#eaf4fb', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                ℹ️ One or more correct answers. Select all that apply.
              </p>
            )}
            {qType === 'NAT' && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#1e8449', background: '#f0faf4', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                ℹ️ Enter the numerical answer. No negative marking.
              </p>
            )}
          </div>

          {/* Options */}
          {q && (
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {qType === 'MCQ' && ['A', 'B', 'C', 'D'].map(opt => {
                const text = q[`option_${opt.toLowerCase()}`]
                if (!text) return null
                return (
                  <div key={opt} onClick={() => selectMCQ(opt)} className={`opt-row ${answers[q.id] === opt ? 'selected-mcq' : ''}`}>
                    <div className="opt-circle">{opt}</div>
                    <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{text}</span>
                  </div>
                )
              })}
              {qType === 'MSQ' && ['A', 'B', 'C', 'D'].map(opt => {
                const text = q[`option_${opt.toLowerCase()}`]
                if (!text) return null
                const isChecked = msqSelected.includes(opt)
                return (
                  <div key={opt} onClick={() => toggleMSQ(opt)} className={`opt-row-msq ${isChecked ? 'selected-msq' : ''}`}>
                    <div className="opt-checkbox">{isChecked ? '✓' : opt}</div>
                    <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{text}</span>
                  </div>
                )
              })}
              {qType === 'NAT' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#555', fontWeight: '600' }}>Enter your answer:</div>
                  <input type="number" className="nat-input" value={natValue} onChange={e => setNAT(e.target.value)} placeholder="0.00" step="any" />
                  {natValue && <div style={{ fontSize: '13px', color: '#27ae60', fontWeight: '600' }}>✓ Answer: <strong>{natValue}</strong></div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,52px)', gap: '6px', marginTop: '8px' }}>
                    {['7','8','9','←','4','5','6','.','1','2','3','-','0','00','C',''].map((k, i) => (
                      k === '' ? <div key={i} /> :
                      <button key={i} onClick={() => {
                        if (k === '←') setNAT(natValue.slice(0, -1))
                        else if (k === 'C') setNAT('')
                        else setNAT(natValue + k)
                      }} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: k === 'C' ? '#fadbd8' : k === '←' ? '#fef9e7' : 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <button onClick={markForReview} className="action-btn" style={{ background: '#8e44ad', color: 'white' }}>
              {marked[q?.id] ? '★ Unmark Review' : '☆ Mark for Review & Next'}
            </button>
            <button onClick={clearResponse} className="action-btn" style={{ background: '#f0f4f8', color: '#555', border: '1px solid #ddd' }}>Clear Response</button>
            <div style={{ flex: 1 }} />
            <button onClick={() => currentQ > 0 ? goToQuestion(currentQ - 1) : (activeSection > 0 && (setActiveSection(s => s - 1), setCurrentQ(0)))} className="action-btn" style={{ background: '#2471a3', color: 'white' }}>← Previous</button>
            <button onClick={saveAndNext} className="action-btn" style={{ background: '#27ae60', color: 'white' }}>Save & Next →</button>
          </div>
        </div>

        {/* Palette Panel */}
        <div className="palette-panel" style={{ background: 'white', borderLeft: '1px solid #e0e0e0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>Question Palette</div>
          {[
            { color: '#27ae60', shape: '50%', label: `Answered (${stats.answered})` },
            { color: '#e74c3c', shape: '50%', label: `Not Answered (${stats.notAnswered})` },
            { color: '#8e44ad', shape: '50%', label: `Marked for Review (${stats.marked})` },
            { color: '#95a5a6', shape: '4px', label: `Not Visited (${stats.notVisited})` },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '16px', height: '16px', background: s.color, borderRadius: s.shape, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#555' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>{sections[activeSection]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px' }}>
              {currentSectionQs.map((_, i) => {
                const gIdx = activeSection * questionsPerSection + i
                const status = getStatus(gIdx)
                const isCurrent = i === currentQ
                return (
                  <button key={i} onClick={() => goToQuestion(i)} className="pal-btn"
                    style={{ borderRadius: statusShape[status] || '50%', background: isCurrent ? '#f39c12' : statusColor[status] || '#95a5a6', color: status === 'notvisited' ? '#333' : 'white', outline: isCurrent ? '2px solid #e67e22' : 'none', outlineOffset: '2px' }}>
                    {activeSection * questionsPerSection + i + 1}
                  </button>
                )
              })}
            </div>
          </div>
          {sections.length > 1 && sections.map((sec, si) => si !== activeSection && (
            <div key={si} style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>{sec}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '3px' }}>
                {(sectionQuestions[si] || []).map((_, i) => {
                  const gIdx = si * questionsPerSection + i
                  const status = getStatus(gIdx)
                  return (
                    <button key={i} onClick={() => { setActiveSection(si); setCurrentQ(i); setVisited(v => ({ ...v, [gIdx]: true })) }} className="pal-btn"
                      style={{ borderRadius: statusShape[status] || '50%', background: statusColor[status] || '#95a5a6', color: status === 'notvisited' ? '#333' : 'white', width: '28px', height: '28px', fontSize: '10px' }}>
                      {gIdx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <button onClick={() => setShowConfirm(true)} style={{ marginTop: 'auto', width: '100%', background: '#c0392b', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
            <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>Submit Test?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Answered', val: stats.answered, color: '#27ae60' },
                { label: 'Not Answered', val: stats.notAnswered, color: '#e74c3c' },
                { label: 'Marked Review', val: stats.marked, color: '#8e44ad' },
                { label: 'Not Visited', val: stats.notVisited, color: '#95a5a6' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px', border: `2px solid ${s.color}22` }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginBottom: '20px' }}>You cannot change answers after submission.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#f0f4f8', border: '1px solid #ddd', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Continue Exam</button>
              <button onClick={() => handleSubmit()} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}