'use client'
import { useState, useEffect, useCallback } from 'react'
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
  const [answers, setAnswers] = useState<{[key: string]: string}>({})
  const [marked, setMarked] = useState<{[key: string]: boolean}>({})
  const [visited, setVisited] = useState<{[key: string]: boolean}>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

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

  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, submitted])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const sections = test ? (() => {
    const exam = test.exam_type
    if (exam === 'JEE Main' || exam === 'JEE Advanced') return ['Physics','Chemistry','Mathematics']
    if (exam === 'CSIR NET') return ['Part A','Part B','Part C']
    if (exam === 'NEET') return ['Physics','Chemistry','Biology']
    if (exam === 'IIT JAM') return ['Section A','Section B','Section C']
    return ['Section A','Section B']
  })() : ['Section A']

  const questionsPerSection = questions.length > 0 ? Math.ceil(questions.length / sections.length) : 0
  const sectionQuestions = sections.map((_, i) => questions.slice(i * questionsPerSection, (i+1) * questionsPerSection))
  const currentSectionQs = sectionQuestions[activeSection] || []
  const globalIndex = activeSection * questionsPerSection + currentQ

  const getStatus = (globalIdx: number) => {
    const qId = questions[globalIdx]?.id
    if (!qId) return 'notvisited'
    if (marked[qId] && answers[qId]) return 'markedanswered'
    if (marked[qId]) return 'marked'
    if (answers[qId]) return 'answered'
    if (visited[globalIdx]) return 'notanswered'
    return 'notvisited'
  }

  const goToQuestion = (idx: number) => {
    setCurrentQ(idx)
    setVisited(v => ({...v, [activeSection * questionsPerSection + idx]: true}))
  }

  const selectAnswer = (option: string) => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => ({...a, [qId]: option}))
  }

  const clearResponse = () => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setAnswers(a => { const n = {...a}; delete n[qId]; return n })
  }

  const markForReview = () => {
    const qId = currentSectionQs[currentQ]?.id
    if (!qId) return
    setMarked(m => ({...m, [qId]: !m[qId]}))
    if (currentQ < currentSectionQs.length - 1) goToQuestion(currentQ + 1)
  }

  const saveAndNext = () => {
    if (currentQ < currentSectionQs.length - 1) goToQuestion(currentQ + 1)
    else if (activeSection < sections.length - 1) {
      setActiveSection(s => s + 1)
      setCurrentQ(0)
    }
  }

  const handleSubmit = async (auto = false) => {
    setSubmitted(true)
    setShowConfirm(false)
    let score = 0, correct = 0, wrong = 0, skipped = 0
    questions.forEach(q => {
      if (!answers[q.id]) { skipped++; return }
      if (answers[q.id] === q.correct_answer) { score += (q.marks || 3); correct++ }
      else { score -= (q.negative_marks || 1); wrong++ }
    })
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 3), 0)
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
    const timeTaken = (test.duration_minutes * 60) - timeLeft

    const { data } = await supabase.from('test_attempts').insert([{
      user_id: user.id, test_id: testId,
      answers: answers, score, total_marks: totalMarks,
      percentage, time_taken: timeTaken, completed_at: new Date().toISOString()
    }]).select().single()

    if (data) router.push(`/tests/${testId}/result/${data.id}`)
    else router.push(`/tests/${testId}/result/new?score=${score}&total=${totalMarks}&correct=${correct}&wrong=${wrong}&skipped=${skipped}`)
  }

  const stats = {
    answered: Object.keys(answers).length,
    marked: Object.values(marked).filter(Boolean).length,
    notAnswered: questions.filter(q => visited[questions.indexOf(q)] && !answers[q.id]).length,
    notVisited: questions.length - Object.keys(visited).length
  }

  const statusColor: any = {
    answered: '#27ae60', notanswered: '#e74c3c', marked: '#8e44ad',
    markedanswered: '#8e44ad', notvisited: '#95a5a6'
  }
  const statusShape: any = {
    answered: '50%', notanswered: '50%', marked: '50%',
    markedanswered: '50%', notvisited: '4px'
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>⏳</div>
        <p style={{color:'#555'}}>Loading exam...</p>
      </div>
    </div>
  )

  const q = currentSectionQs[currentQ]

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'Arial,sans-serif',fontSize:'13px'}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        .pal-btn { border: none; cursor: pointer; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; transition: transform 0.1s; }
        .pal-btn:hover { transform: scale(1.1); }
        .opt-row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1.5px solid #ccc; border-radius: 8px; cursor: pointer; background: white; transition: all 0.2s; margin-bottom: 10px; font-size: 15px; color: #111; font-weight: 500; }
        .opt-row:hover { border-color: #2471a3; background: #ebf5fb; }
        .opt-row.selected { border-color: #2471a3; background: #d6eaf8; }
        .opt-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #999; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .opt-row.selected .opt-circle { background: #2471a3; color: white; border-color: #2471a3; }
        .sec-tab { padding: 6px 18px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
        .sec-tab.active { background: white; color: #1a3a6b; }
        .sec-tab:not(.active) { background: transparent; color: rgba(255,255,255,0.75); }
        .action-btn { padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; }
        @media (max-width: 768px) { .exam-grid { grid-template-columns: 1fr !important; } .palette-panel { display: none; } }
      `}</style>

      {/* Top Bar */}
      <div style={{background:'#1a3a6b',color:'white',padding:'8px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{background:'white',color:'#1a3a6b',fontWeight:'800',fontSize:'12px',padding:'4px 10px',borderRadius:'4px'}}>MathSamiksha</div>
          <div>
            <div style={{fontWeight:'700',fontSize:'14px'}}>{test?.title}</div>
            <div style={{fontSize:'11px',opacity:0.7}}>{user?.user_metadata?.full_name || user?.email}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{background: timeLeft < 300 ? '#c0392b' : timeLeft < 600 ? '#e67e22' : '#1a5276', padding:'6px 16px',borderRadius:'6px',fontWeight:'800',fontSize:'15px',letterSpacing:'1px',border:'2px solid rgba(255,255,255,0.3)'}}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={()=>setShowConfirm(true)} style={{background:'#c0392b',color:'white',border:'none',padding:'7px 16px',borderRadius:'6px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{background:'#2471a3',display:'flex',gap:'2px',padding:'6px 16px'}}>
        {sections.map((s,i)=>(
          <button key={i} onClick={()=>{setActiveSection(i);setCurrentQ(0)}} className={`sec-tab ${activeSection===i?'active':''}`} style={{borderRadius:'4px 4px 0 0'}}>
            {s}
            <span style={{marginLeft:'6px',fontSize:'10px',opacity:0.8}}>({sectionQuestions[i]?.length||0})</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="exam-grid" style={{display:'grid',gridTemplateColumns:'1fr 240px',minHeight:'calc(100vh - 100px)'}}>

        {/* Question Area */}
        <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:'12px'}}>

          {/* Question Header */}
          <div style={{background:'white',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
              <span style={{background:'#ebf5fb',color:'#1a5276',padding:'4px 10px',borderRadius:'4px',fontSize:'12px',fontWeight:'600'}}>Q.{globalIndex+1} of {questions.length}</span>
              <span style={{background:'#e8f8f5',color:'#1e8449',padding:'4px 10px',borderRadius:'4px',fontSize:'12px',fontWeight:'600'}}>+{q?.marks||3} / -{q?.negative_marks||1}</span>
              <span style={{background:'#fef9e7',color:'#7d6608',padding:'4px 10px',borderRadius:'4px',fontSize:'12px'}}>MCQ (Single Correct)</span>
            </div>
            <span style={{fontSize:'12px',color:'#888'}}>{sections[activeSection]}</span>
          </div>

          {/* Question Text */}
          <div style={{background:'white',borderRadius:'8px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.08)',minHeight:'120px'}}>
            <p style={{fontSize:'15px',lineHeight:'1.8',color:'#1a1a1a',fontWeight:'500'}}>
              {q ? q.question_text : 'Question not available'}
            </p>
          </div>

          {/* Options */}
          {q && (
            <div style={{background:'white',borderRadius:'8px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
              {['A','B','C','D'].map(opt => {
                const text = q[`option_${opt.toLowerCase()}`]
                if (!text) return null
                return (
                  <div key={opt} onClick={()=>selectAnswer(opt)} className={`opt-row ${answers[q.id]===opt?'selected':''}`}>
                    <div className="opt-circle">{opt}</div>
                    <span style={{fontSize:'14px',lineHeight:'1.5'}}>{text}</span>
                  </div>
                )
              })}
              
            </div>
          )}

          {/* Action Buttons */}
          <div style={{background:'white',borderRadius:'8px',padding:'12px 16px',display:'flex',gap:'8px',flexWrap:'wrap',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
            <button onClick={markForReview} className="action-btn" style={{background:'#8e44ad',color:'white'}}>
              {marked[q?.id] ? '★ Unmark Review' : '☆ Mark for Review & Next'}
            </button>
            <button onClick={clearResponse} className="action-btn" style={{background:'#f0f4f8',color:'#555',border:'1px solid #ddd'}}>
              Clear Response
            </button>
            <div style={{flex:1}}/>
            <button onClick={()=>currentQ>0?goToQuestion(currentQ-1):(activeSection>0&&(setActiveSection(s=>s-1),setCurrentQ(0)))}
              className="action-btn" style={{background:'#2471a3',color:'white'}}>
              ← Previous
            </button>
            <button onClick={saveAndNext} className="action-btn" style={{background:'#27ae60',color:'white'}}>
              Save & Next →
            </button>
          </div>
        </div>

        {/* Palette Panel */}
        <div className="palette-panel" style={{background:'white',borderLeft:'1px solid #e0e0e0',padding:'12px',display:'flex',flexDirection:'column',gap:'10px',overflowY:'auto'}}>

          {/* Legend */}
          <div style={{fontSize:'12px',fontWeight:'700',color:'#333',marginBottom:'4px'}}>Question Palette</div>
          {[
            {color:'#27ae60',shape:'50%',label:`Answered (${stats.answered})`},
            {color:'#e74c3c',shape:'50%',label:`Not Answered (${stats.notAnswered})`},
            {color:'#8e44ad',shape:'50%',label:`Marked for Review (${stats.marked})`},
            {color:'#95a5a6',shape:'4px',label:`Not Visited (${stats.notVisited})`},
          ].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'7px'}}>
              <div style={{width:'16px',height:'16px',background:s.color,borderRadius:s.shape,flexShrink:0}}/>
              <span style={{fontSize:'11px',color:'#555'}}>{s.label}</span>
            </div>
          ))}

          <div style={{borderTop:'1px solid #eee',paddingTop:'10px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#333',marginBottom:'8px'}}>{sections[activeSection]}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'4px'}}>
              {currentSectionQs.map((_,i)=>{
                const gIdx = activeSection * questionsPerSection + i
                const status = getStatus(gIdx)
                const isCurrent = i === currentQ
                return (
                  <button key={i} onClick={()=>goToQuestion(i)} className="pal-btn"
                    style={{borderRadius:statusShape[status]||'50%',background:isCurrent?'#f39c12':statusColor[status]||'#95a5a6',color:status==='notvisited'?'#333':'white',outline:isCurrent?'2px solid #e67e22':'none',outlineOffset:'2px'}}>
                    {activeSection * questionsPerSection + i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {sections.length > 1 && sections.map((sec,si)=>si!==activeSection&&(
            <div key={si} style={{borderTop:'1px solid #eee',paddingTop:'8px'}}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#333',marginBottom:'6px'}}>{sec}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'3px'}}>
                {(sectionQuestions[si]||[]).map((_,i)=>{
                  const gIdx = si * questionsPerSection + i
                  const status = getStatus(gIdx)
                  return (
                    <button key={i} onClick={()=>{setActiveSection(si);setCurrentQ(i);setVisited(v=>({...v,[gIdx]:true}))}} className="pal-btn"
                      style={{borderRadius:statusShape[status]||'50%',background:statusColor[status]||'#95a5a6',color:status==='notvisited'?'#333':'white',width:'28px',height:'28px',fontSize:'10px'}}>
                      {gIdx+1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button onClick={()=>setShowConfirm(true)} style={{marginTop:'auto',width:'100%',background:'#c0392b',color:'white',border:'none',padding:'10px',borderRadius:'6px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'white',borderRadius:'12px',padding:'28px',width:'100%',maxWidth:'460px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{fontSize:'24px',marginBottom:'12px',textAlign:'center'}}>⚠️</div>
            <h2 style={{textAlign:'center',fontSize:'18px',marginBottom:'16px',color:'#1a1a1a'}}>Submit Test?</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'20px'}}>
              {[
                {label:'Answered',val:stats.answered,color:'#27ae60'},
                {label:'Not Answered',val:stats.notAnswered,color:'#e74c3c'},
                {label:'Marked Review',val:stats.marked,color:'#8e44ad'},
                {label:'Not Visited',val:stats.notVisited,color:'#95a5a6'},
              ].map(s=>(
                <div key={s.label} style={{textAlign:'center',padding:'10px',background:'#f8f9fa',borderRadius:'8px',border:`2px solid ${s.color}22`}}>
                  <div style={{fontSize:'22px',fontWeight:'700',color:s.color}}>{s.val}</div>
                  <div style={{fontSize:'11px',color:'#666',marginTop:'2px'}}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{textAlign:'center',fontSize:'13px',color:'#888',marginBottom:'20px'}}>
              You cannot change answers after submission.
            </p>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setShowConfirm(false)} style={{flex:1,padding:'12px',borderRadius:'8px',background:'#f0f4f8',border:'1px solid #ddd',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>
                Continue Exam
              </button>
              <button onClick={()=>handleSubmit()} style={{flex:1,padding:'12px',borderRadius:'8px',background:'#c0392b',color:'white',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'700'}}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}