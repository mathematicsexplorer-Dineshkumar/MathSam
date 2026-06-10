'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const testId = params?.id as string
  const attemptId = params?.attemptId as string

  const [result, setResult] = useState<any>(null)
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userRank, setUserRank] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'result'|'solutions'|'leaderboard'>('result')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: testData } = await supabase.from('tests').select('*').eq('id', testId).single()
      setTest(testData)

      const { data: qData } = await supabase.from('questions').select('*').eq('test_id', testId)
      setQuestions(qData || [])

      if (attemptId !== 'new') {
        const { data: attemptData } = await supabase.from('test_attempts').select('*').eq('id', attemptId).single()
        setResult(attemptData)
      } else {
        const score = parseFloat(searchParams.get('score') || '0')
        const total = parseFloat(searchParams.get('total') || '0')
        const correct = parseInt(searchParams.get('correct') || '0')
        const wrong = parseInt(searchParams.get('wrong') || '0')
        const skipped = parseInt(searchParams.get('skipped') || '0')
        setResult({ score, total_marks: total, percentage: total > 0 ? Math.round((score/total)*100) : 0, correct, wrong, skipped })
      }

      // ✅ Get ALL attempts ordered by date (oldest first)
      // Then keep only FIRST attempt per user for leaderboard
      // Then sort by score descending
      const { data: allAttempts } = await supabase
        .from('test_attempts')
        .select('*, profiles(full_name, email, avatar_url)')
        .eq('test_id', testId)
        .order('completed_at', { ascending: true })

      // Keep only first attempt per user
      const seen = new Set()
      const firstAttempts = (allAttempts || []).filter((a: any) => {
        if (seen.has(a.user_id)) return false
        seen.add(a.user_id)
        return true
      })

      // Sort by score descending for leaderboard
      const lbData = firstAttempts.sort((a: any, b: any) => b.score - a.score)
      setLeaderboard(lbData)

      // Find user rank
      if (user && lbData) {
        const rank = lbData.findIndex((a: any) => a.user_id === user.id) + 1
        setUserRank(rank > 0 ? rank : lbData.length + 1)
      }

      setLoading(false)
    }
    init()
  }, [testId, attemptId])

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#27ae60', label: 'Outstanding!' }
    if (pct >= 75) return { grade: 'A', color: '#2ecc71', label: 'Excellent!' }
    if (pct >= 60) return { grade: 'B', color: '#3498db', label: 'Good' }
    if (pct >= 45) return { grade: 'C', color: '#f39c12', label: 'Average' }
    if (pct >= 30) return { grade: 'D', color: '#e67e22', label: 'Below Average' }
    return { grade: 'F', color: '#e74c3c', label: 'Needs Improvement' }
  }

  const formatTime = (s: number) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>⏳</div>
        <p style={{color:'#555'}}>Loading results...</p>
      </div>
    </div>
  )

  const pct = result?.percentage || 0
  const gradeInfo = getGrade(pct)
  const answers = result?.answers || {}

  // ✅ Fixed scoring for MCQ/MSQ/NAT
  const correct = questions.filter(q => {
    const type = q.question_type || 'MCQ'
    const ans = answers[q.id]
    if (!ans) return false
    if (type === 'MCQ') return ans === q.correct_answer
    if (type === 'MSQ') {
      const sel = typeof ans === 'string' ? ans.split(',') : ans
      const correct = q.correct_answers || []
      return sel.length === correct.length && sel.every((o: string) => correct.includes(o))
    }
    if (type === 'NAT') {
      const val = parseFloat(String(ans).trim())
      if (isNaN(val)) return false
      if (q.nat_answer_exact !== null && q.nat_answer_exact !== undefined)
        return Math.abs(val - parseFloat(q.nat_answer_exact)) < 0.001
      if (q.nat_answer_min !== null && q.nat_answer_max !== null)
        return val >= parseFloat(q.nat_answer_min) && val <= parseFloat(q.nat_answer_max)
    }
    return false
  }).length

  const wrong = questions.filter(q => {
    const ans = answers[q.id]
    if (!ans) return false
    const type = q.question_type || 'MCQ'
    if (type === 'MCQ') return ans !== q.correct_answer
    if (type === 'MSQ') {
      const sel = typeof ans === 'string' ? ans.split(',') : ans
      const correctAns = q.correct_answers || []
      return !(sel.length === correctAns.length && sel.every((o: string) => correctAns.includes(o)))
    }
    return false
  }).length

  const skipped = questions.filter(q => !answers[q.id]).length
  const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'Arial,sans-serif',fontSize:'13px'}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        .tab { padding: 10px 24px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; border-bottom: 3px solid transparent; background: transparent; transition: all 0.2s; font-family: Arial, sans-serif; }
        .tab.active { border-bottom-color: #2471a3; color: #2471a3; }
        .tab:not(.active) { color: #888; }
        .stat-box { background: white; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .q-row { background: white; border-radius: 8px; padding: 16px; margin-bottom: 10px; border-left: 4px solid #ddd; }
        .q-row.correct { border-left-color: #27ae60; }
        .q-row.wrong { border-left-color: #e74c3c; }
        .q-row.skipped { border-left-color: #95a5a6; }
        .lb-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; }
        .lb-row.me { background: #ebf5fb; border: 1.5px solid #2471a3; }
        .lb-row:not(.me) { background: white; border: 1px solid #eee; }
      `}</style>

      {/* Header */}
      <div style={{background:'#1a3a6b',color:'white',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{background:'white',color:'#1a3a6b',fontWeight:'800',fontSize:'12px',padding:'3px 8px',borderRadius:'4px'}}>MathSamiksha</div>
          <span style={{fontWeight:'700',fontSize:'15px'}}>{test?.title} — Result</span>
        </div>
        <Link href="/dashboard" style={{color:'rgba(255,255,255,0.8)',textDecoration:'none',fontSize:'13px',border:'1px solid rgba(255,255,255,0.3)',padding:'6px 14px',borderRadius:'6px'}}>
          ← Dashboard
        </Link>
      </div>

      {/* Score Card */}
      <div style={{background:'linear-gradient(135deg,#1a3a6b,#2471a3)',color:'white',padding:'30px 20px',textAlign:'center'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <div style={{fontSize:'12px',opacity:0.7,marginBottom:'8px',letterSpacing:'2px',textTransform:'uppercase'}}>Your Score</div>
          <div style={{fontSize:'64px',fontWeight:'800',lineHeight:1}}>{result?.score?.toFixed(0) || 0}</div>
          <div style={{fontSize:'16px',opacity:0.8,marginBottom:'20px'}}>out of {result?.total_marks || 0}</div>
          <div style={{display:'inline-block',background:'rgba(255,255,255,0.15)',borderRadius:'50%',width:'90px',height:'90px',lineHeight:'90px',fontSize:'36px',fontWeight:'800',border:`4px solid ${gradeInfo.color}`,marginBottom:'12px',color:gradeInfo.color}}>
            {gradeInfo.grade}
          </div>
          <div style={{fontSize:'18px',fontWeight:'700',marginBottom:'4px'}}>{gradeInfo.label}</div>
          <div style={{fontSize:'14px',opacity:0.7}}>{pct}% scored</div>
          {userRank > 0 && (
            <div style={{marginTop:'16px',display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,0.15)',padding:'8px 20px',borderRadius:'50px'}}>
              <span style={{fontSize:'20px'}}>🏆</span>
              <span style={{fontSize:'15px',fontWeight:'700'}}>Rank #{userRank} (based on first attempt)</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{maxWidth:'900px',margin:'20px auto',padding:'0 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'12px',marginBottom:'20px'}}>
          {[
            {label:'Correct',val:correct,color:'#27ae60',icon:'✓'},
            {label:'Wrong',val:wrong,color:'#e74c3c',icon:'✗'},
            {label:'Skipped',val:skipped,color:'#95a5a6',icon:'—'},
            {label:'Accuracy',val:`${accuracy}%`,color:'#3498db',icon:'🎯'},
            {label:'Time Taken',val:formatTime(result?.time_taken),color:'#8e44ad',icon:'⏱'},
            {label:'Total Marks',val:result?.total_marks||0,color:'#f39c12',icon:'📊'},
          ].map(s=>(
            <div key={s.label} className="stat-box">
              <div style={{fontSize:'24px',marginBottom:'4px'}}>{s.icon}</div>
              <div style={{fontSize:'24px',fontWeight:'800',color:s.color}}>{s.val}</div>
              <div style={{fontSize:'11px',color:'#888',marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score Bar */}
        <div style={{background:'white',borderRadius:'10px',padding:'16px 20px',marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',fontSize:'12px',color:'#888'}}>
            <span>Score Distribution</span>
            <span>{pct}%</span>
          </div>
          <div style={{height:'12px',background:'#f0f0f0',borderRadius:'6px',overflow:'hidden',marginBottom:'6px'}}>
            <div style={{height:'100%',width:`${Math.max(0,pct)}%`,background:pct>=60?'#27ae60':pct>=40?'#f39c12':'#e74c3c',borderRadius:'6px',transition:'width 1s ease'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#aaa'}}>
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{background:'white',borderRadius:'10px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <div style={{display:'flex',borderBottom:'1px solid #eee',padding:'0 16px'}}>
            {(['result','solutions','leaderboard'] as const).map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} className={`tab ${activeTab===t?'active':''}`}>
                {t==='result'?'📊 Analysis':t==='solutions'?'📝 Solutions':'🏆 Leaderboard'}
              </button>
            ))}
          </div>

          <div style={{padding:'20px'}}>

            {/* Analysis Tab */}
            {activeTab==='result' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
                  <div style={{padding:'16px',background:'#f8f9fa',borderRadius:'8px'}}>
                    <div style={{fontWeight:'700',marginBottom:'12px',fontSize:'14px'}}>Performance Breakdown</div>
                    {[
                      {label:'Correct Answers',val:correct,total:questions.length,color:'#27ae60'},
                      {label:'Wrong Answers',val:wrong,total:questions.length,color:'#e74c3c'},
                      {label:'Skipped',val:skipped,total:questions.length,color:'#95a5a6'},
                    ].map(s=>(
                      <div key={s.label} style={{marginBottom:'10px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                          <span style={{color:'#555'}}>{s.label}</span>
                          <span style={{fontWeight:'700',color:s.color}}>{s.val}/{s.total}</span>
                        </div>
                        <div style={{height:'8px',background:'#e0e0e0',borderRadius:'4px',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${questions.length>0?(s.val/s.total)*100:0}%`,background:s.color,borderRadius:'4px'}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'16px',background:'#f8f9fa',borderRadius:'8px'}}>
                    <div style={{fontWeight:'700',marginBottom:'12px',fontSize:'14px'}}>Score Summary</div>
                    {[
                      {label:'Marks from Correct',val:`+${(result?.score||0) > 0 ? (result?.score||0) + (wrong*(questions[0]?.negative_marks||1)) : 0}`,color:'#27ae60'},
                      {label:'Marks Deducted',val:`-${wrong * (questions[0]?.negative_marks||1)}`,color:'#e74c3c'},
                      {label:'Final Score',val:result?.score?.toFixed(1)||0,color:'#2471a3'},
                      {label:'Percentile (est.)',val:`${Math.min(99,pct+5).toFixed(1)}%ile`,color:'#8e44ad'},
                    ].map(s=>(
                      <div key={s.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eee',fontSize:'13px'}}>
                        <span style={{color:'#555'}}>{s.label}</span>
                        <span style={{fontWeight:'700',color:s.color}}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
                  <Link href={`/tests/${testId}/attempt`} style={{padding:'12px 28px',background:'#2471a3',color:'white',borderRadius:'8px',textDecoration:'none',fontWeight:'700',fontSize:'14px'}}>
                    🔄 Reattempt Test
                  </Link>
                  <Link href="/tests" style={{padding:'12px 28px',background:'#f0f4f8',color:'#555',borderRadius:'8px',textDecoration:'none',fontWeight:'700',fontSize:'14px',border:'1px solid #ddd'}}>
                    Browse Tests
                  </Link>
                </div>
              </div>
            )}

            {/* Solutions Tab */}
            {activeTab==='solutions' && (
              <div>
                <div style={{marginBottom:'12px',fontSize:'13px',color:'#888'}}>All {questions.length} questions with answers & explanations</div>
                {questions.map((q,i)=>{
                  const type = q.question_type || 'MCQ'
                  const userAns = answers[q.id]
                  let isCorrect = false
                  let isSkipped = !userAns

                  if (type === 'MCQ') isCorrect = userAns === q.correct_answer
                  if (type === 'MSQ') {
                    const sel = userAns ? (typeof userAns === 'string' ? userAns.split(',') : userAns) : []
                    const correctAns = q.correct_answers || []
                    isCorrect = sel.length === correctAns.length && sel.every((o: string) => correctAns.includes(o))
                  }
                  if (type === 'NAT') {
                    const val = parseFloat(String(userAns||'').trim())
                    if (!isNaN(val)) {
                      if (q.nat_answer_exact !== null && q.nat_answer_exact !== undefined)
                        isCorrect = Math.abs(val - parseFloat(q.nat_answer_exact)) < 0.001
                      else if (q.nat_answer_min !== null && q.nat_answer_max !== null)
                        isCorrect = val >= parseFloat(q.nat_answer_min) && val <= parseFloat(q.nat_answer_max)
                    }
                  }

                  return (
                    <div key={q.id} className={`q-row ${isSkipped?'skipped':isCorrect?'correct':'wrong'}`}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',alignItems:'center'}}>
                        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                          <span style={{fontWeight:'700',fontSize:'13px',color:'#333'}}>Q{i+1}.</span>
                          <span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'12px',fontWeight:'700',background:type==='MCQ'?'#fef9e7':type==='MSQ'?'#eaf4fb':'#f0faf4',color:type==='MCQ'?'#7d6608':type==='MSQ'?'#1a5276':'#1e8449'}}>{type}</span>
                        </div>
                        <span style={{fontSize:'12px',padding:'2px 10px',borderRadius:'20px',fontWeight:'700',
                          background:isSkipped?'#f0f0f0':isCorrect?'#e8f8f5':'#fef0f0',
                          color:isSkipped?'#888':isCorrect?'#27ae60':'#e74c3c'}}>
                          {isSkipped ? 'Skipped' : isCorrect ? `+${q.marks||3} Correct` : type==='MSQ'||type==='NAT' ? '0 Wrong' : `-${q.negative_marks||1} Wrong`}
                        </span>
                      </div>
                      <p style={{fontSize:'13px',lineHeight:'1.6',marginBottom:'10px',color:'#222'}}>{q.question_text}</p>

                      {/* MCQ/MSQ Options */}
                      {type !== 'NAT' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'8px'}}>
                          {['A','B','C','D'].map(opt=>{
                            const text = q[`option_${opt.toLowerCase()}`]
                            if (!text) return null
                            const isCorrectOpt = type==='MSQ' ? (q.correct_answers||[]).includes(opt) : opt === q.correct_answer
                            const isUserOpt = type==='MSQ'
                              ? (userAns ? (typeof userAns==='string'?userAns.split(','):userAns).includes(opt) : false)
                              : opt === userAns
                            return (
                              <div key={opt} style={{padding:'6px 10px',borderRadius:'6px',fontSize:'12px',
                                background:isCorrectOpt?'#e8f8f5':isUserOpt&&!isCorrectOpt?'#fef0f0':'#f8f9fa',
                                border:`1px solid ${isCorrectOpt?'#27ae60':isUserOpt&&!isCorrectOpt?'#e74c3c':'#eee'}`,
                                color:isCorrectOpt?'#1e8449':isUserOpt&&!isCorrectOpt?'#c0392b':'#555'}}>
                                <strong>{opt}.</strong> {text}
                                {isCorrectOpt&&' ✓'}{isUserOpt&&!isCorrectOpt&&' ✗'}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* NAT Answer */}
                      {type === 'NAT' && (
                        <div style={{display:'flex',gap:'12px',marginBottom:'8px',flexWrap:'wrap'}}>
                          <div style={{padding:'8px 14px',borderRadius:'8px',background:'#e8f8f5',border:'1px solid #27ae60',fontSize:'13px',color:'#1e8449',fontWeight:'700'}}>
                            ✓ Correct: {q.nat_answer_exact ?? `${q.nat_answer_min} to ${q.nat_answer_max}`}
                          </div>
                          {userAns && (
                            <div style={{padding:'8px 14px',borderRadius:'8px',background:isCorrect?'#e8f8f5':'#fef0f0',border:`1px solid ${isCorrect?'#27ae60':'#e74c3c'}`,fontSize:'13px',color:isCorrect?'#1e8449':'#c0392b',fontWeight:'700'}}>
                              Your answer: {userAns}
                            </div>
                          )}
                        </div>
                      )}

                      {q.explanation && (
                        <div style={{padding:'8px 12px',background:'#fffbea',borderRadius:'6px',borderLeft:'3px solid #f39c12',fontSize:'12px',color:'#7d6608'}}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab==='leaderboard' && (
              <div>
                <div style={{marginBottom:'8px',fontSize:'13px',color:'#888'}}>
                  🏆 {leaderboard.length} students — ranked by <strong>first attempt score</strong>
                </div>
                <div style={{background:'#fffbea',border:'1px solid #f39c12',borderRadius:'8px',padding:'8px 14px',marginBottom:'16px',fontSize:'12px',color:'#7d6608'}}>
                  ℹ️ Only each student's <strong>first attempt</strong> counts for ranking. You can reattempt to practice but rank won't change.
                </div>
                {leaderboard.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px',color:'#888'}}>
                    <div style={{fontSize:'40px',marginBottom:'12px'}}>🏆</div>
                    <p>Be the first to appear on the leaderboard!</p>
                  </div>
                ) : leaderboard.map((entry,i)=>{
                  const isMe = user && entry.user_id === user.id
                  const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null
                  return (
                    <div key={entry.id} className={`lb-row ${isMe?'me':''}`}>
                      <div style={{width:'32px',textAlign:'center',fontWeight:'800',fontSize:'15px',color:i<3?['#f39c12','#95a5a6','#cd7f32'][i]:'#888'}}>
                        {medal||`#${i+1}`}
                      </div>
                      <div style={{width:'36px',height:'36px',borderRadius:'50%',background:isMe?'#2471a3':'#7f8c8d',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'700',fontSize:'14px',flexShrink:0}}>
                        {(entry.profiles?.full_name||entry.profiles?.email||'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'600',fontSize:'13px'}}>
                          {entry.profiles?.full_name||entry.profiles?.email?.split('@')[0]||'Student'}
                          {isMe && <span style={{marginLeft:'6px',fontSize:'11px',background:'#2471a3',color:'white',padding:'1px 8px',borderRadius:'12px'}}>You</span>}
                        </div>
                        <div style={{fontSize:'11px',color:'#888'}}>Time: {formatTime(entry.time_taken)}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:'800',fontSize:'16px',color:'#2471a3'}}>{entry.score?.toFixed(0)}</div>
                        <div style={{fontSize:'11px',color:'#888'}}>{entry.percentage}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}