'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'dk9785562756@gmail.com'

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'MCQ — Single Correct', desc: 'Only one correct option' },
  { value: 'MSQ', label: 'MSQ — Multiple Select', desc: 'One or more correct options' },
  { value: 'NAT', label: 'NAT — Numerical Answer', desc: 'Student types a number' },
]

const EXAM_MARKING: any = {
  'IIT JAM': { MCQ: { marks: 3, negative: 1 }, MSQ: { marks: 3, negative: 0 }, NAT: { marks: 3, negative: 0 } },
  'CSIR NET': { MCQ: { marks: 2, negative: 0.5 }, MSQ: { marks: 3, negative: 0 }, NAT: { marks: 3, negative: 0 } },
  'GATE': { MCQ: { marks: 1, negative: 0.33 }, MSQ: { marks: 2, negative: 0.67 }, NAT: { marks: 2, negative: 0 } },
  'TIFR': { MCQ: { marks: 3, negative: 1 }, MSQ: { marks: 3, negative: 0 }, NAT: { marks: 3, negative: 0 } },
  'JEE Main': { MCQ: { marks: 4, negative: 1 }, MSQ: { marks: 4, negative: 2 }, NAT: { marks: 4, negative: 0 } },
  'JEE Advanced': { MCQ: { marks: 3, negative: 1 }, MSQ: { marks: 4, negative: 2 }, NAT: { marks: 4, negative: 0 } },
  'NEET': { MCQ: { marks: 4, negative: 1 }, MSQ: { marks: 4, negative: 1 }, NAT: { marks: 4, negative: 0 } },
  'default': { MCQ: { marks: 3, negative: 1 }, MSQ: { marks: 3, negative: 0 }, NAT: { marks: 3, negative: 0 } },
}

const emptyForm = {
  question_type: 'MCQ', question_text: '', question_image_url: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  option_a_image: '', option_b_image: '', option_c_image: '', option_d_image: '',
  correct_answer: 'A', correct_answers: [] as string[],
  nat_answer_min: '', nat_answer_max: '', nat_exact_answer: '',
  explanation: '', marks: '3', negative_marks: '1',
  section_name: '', difficulty: 'Medium', topic: '', has_latex: false
}

export default function AdvancedQuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params?.testId as string
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'add'|'bulk'|'list'>('list')
  const [form, setForm] = useState({...emptyForm})
  const [bulkText, setBulkText] = useState('')
  const [bulkParsed, setBulkParsed] = useState<any[]>([])
  const [uploadingImg, setUploadingImg] = useState(false)
  const [previewLatex, setPreviewLatex] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)
  const [imgTarget, setImgTarget] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      const { data: t } = await supabase.from('tests').select('*').eq('id', testId).single()
      setTest(t)
      if (t?.exam_type && EXAM_MARKING[t.exam_type]) {
        const m = EXAM_MARKING[t.exam_type].MCQ
        setForm(f => ({...f, marks: String(m.marks), negative_marks: String(m.negative)}))
      }
      fetchQuestions()
    }
    init()
    // Load KaTeX
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link')
      link.id = 'katex-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById('katex-js')) {
      const script = document.createElement('script')
      script.id = 'katex-js'
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
      document.head.appendChild(script)
      const autorender = document.createElement('script')
      autorender.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js'
      autorender.onload = () => renderLatex()
      document.head.appendChild(autorender)
    }
  }, [testId])

  const renderLatex = () => {
    if ((window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          {left:'$$',right:'$$',display:true},
          {left:'$',right:'$',display:false},
          {left:'\\(',right:'\\)',display:false},
          {left:'\\[',right:'\\]',display:true}
        ]
      })
    }
  }

  useEffect(() => { if (previewLatex) setTimeout(renderLatex, 100) }, [previewLatex, form.question_text])

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').eq('test_id', testId).order('id')
    setQuestions(data || [])
    setLoading(false)
    setTimeout(renderLatex, 200)
  }

  const updateFormMarking = (type: string) => {
    const exam = test?.exam_type || 'default'
    const scheme = EXAM_MARKING[exam] || EXAM_MARKING.default
    const m = scheme[type] || scheme.MCQ
    setForm(f => ({...f, question_type: type, marks: String(m.marks), negative_marks: String(m.negative)}))
  }

  const uploadImage = async (file: File, target: string) => {
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `questions/${testId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('thumbnails').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); setUploadingImg(false); return }
    const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
    setForm(f => ({...f, [target]: urlData.publicUrl}))
    setUploadingImg(false)
    toast.success('Image uploaded!')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      test_id: testId,
      question_type: form.question_type,
      question_text: form.question_text,
      question_image_url: form.question_image_url || null,
      option_a: form.option_a || null,
      option_b: form.option_b || null,
      option_c: form.option_c || null,
      option_d: form.option_d || null,
      option_a_image: form.option_a_image || null,
      option_b_image: form.option_b_image || null,
      option_c_image: form.option_c_image || null,
      option_d_image: form.option_d_image || null,
      explanation: form.explanation || null,
      marks: parseFloat(form.marks),
      negative_marks: parseFloat(form.negative_marks),
      section_name: form.section_name || null,
      difficulty: form.difficulty,
      topic: form.topic || null,
      has_latex: form.has_latex,
    }
    if (form.question_type === 'MCQ') payload.correct_answer = form.correct_answer
    if (form.question_type === 'MSQ') payload.correct_answers = form.correct_answers
    if (form.question_type === 'NAT') {
      payload.nat_exact_answer = form.nat_exact_answer ? parseFloat(form.nat_exact_answer) : null
      payload.nat_answer_min = form.nat_answer_min ? parseFloat(form.nat_answer_min) : null
      payload.nat_answer_max = form.nat_answer_max ? parseFloat(form.nat_answer_max) : null
    }
    const { error } = await supabase.from('questions').insert([payload])
    if (error) { toast.error(error.message) } else {
      toast.success('Question saved!')
      setForm({...emptyForm, marks: form.marks, negative_marks: form.negative_marks, question_type: form.question_type, section_name: form.section_name})
      fetchQuestions()
      await supabase.from('tests').update({ total_questions: questions.length + 1 }).eq('id', testId)
    }
    setSaving(false)
  }

  const parseBulk = () => {
    try {
      const parsed = JSON.parse(bulkText)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      setBulkParsed(arr)
      toast.success(`Parsed ${arr.length} questions!`)
    } catch {
      toast.error('Invalid JSON. Please check the format.')
    }
  }

  const saveBulk = async () => {
    if (bulkParsed.length === 0) return
    setSaving(true)
    const payload = bulkParsed.map(q => ({
      test_id: testId,
      question_type: q.type || 'MCQ',
      question_text: q.question,
      option_a: q.a || null, option_b: q.b || null,
      option_c: q.c || null, option_d: q.d || null,
      correct_answer: q.answer || 'A',
      correct_answers: q.answers || null,
      nat_exact_answer: q.nat || null,
      explanation: q.explanation || null,
      marks: q.marks || parseFloat(form.marks),
      negative_marks: q.negative || parseFloat(form.negative_marks),
      section_name: q.section || null,
      difficulty: q.difficulty || 'Medium',
      topic: q.topic || null,
      has_latex: q.latex || false,
    }))
    const { error } = await supabase.from('questions').insert(payload)
    if (error) { toast.error(error.message) } else {
      toast.success(`${bulkParsed.length} questions saved!`)
      setBulkText(''); setBulkParsed([])
      fetchQuestions()
      await supabase.from('tests').update({ total_questions: questions.length + bulkParsed.length }).eq('id', testId)
      setActiveTab('list')
    }
    setSaving(false)
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return
    await supabase.from('questions').delete().eq('id', id)
    toast.success('Deleted')
    fetchQuestions()
  }

  const typeColor: any = { MCQ: '#2471a3', MSQ: '#8e44ad', NAT: '#27ae60' }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:12px 16px;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.3s;}
        .input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.08);}
        .input::placeholder{color:rgba(255,255,255,0.2);}
        select.input option{background:#1a1a2e;}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;transition:all 0.3s;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;}
        .btn-gold:hover{box-shadow:0 6px 20px rgba(245,158,11,0.35);}
        .btn-purple{background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;}
        .btn-green{background:linear-gradient(135deg,#10b981,#059669);color:#fff;}
        .btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.6);}
        .tab{padding:10px 20px;border:none;cursor:pointer;font-size:14px;font-weight:600;border-bottom:3px solid transparent;background:transparent;color:rgba(255,255,255,0.4);transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .tab.active{color:#f59e0b;border-bottom-color:#f59e0b;}
        .label{display:block;color:rgba(255,255,255,0.55);font-size:11px;font-weight:600;letter-spacing:0.8px;margin-bottom:7px;text-transform:uppercase;}
        .q-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px;margin-bottom:10px;transition:all 0.2s;}
        .q-card:hover{border-color:rgba(245,158,11,0.2);}
        .type-btn{padding:10px 16px;border-radius:10px;cursor:pointer;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.5);transition:all 0.2s;text-align:left;}
        .type-btn.active{border-color:#f59e0b;background:rgba(245,158,11,0.1);color:#f59e0b;}
        .check-opt{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);transition:all 0.2s;}
        .check-opt.selected{border-color:#8b5cf6;background:rgba(139,92,246,0.1);}
        .img-upload{border:1.5px dashed rgba(255,255,255,0.15);border-radius:10px;padding:14px;text-align:center;cursor:pointer;transition:all 0.2s;}
        .img-upload:hover{border-color:#f59e0b;background:rgba(245,158,11,0.04);}
        .latex-preview{background:rgba(255,255,255,0.97);color:#000;border-radius:10px;padding:16px;margin-top:8px;font-size:15px;line-height:1.8;}
      `}</style>

      {/* Header */}
      <div style={{background:'#080810',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <Link href="/admin/tests" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:'13px'}}>← Tests</Link>
          <div style={{width:'1px',height:'20px',background:'rgba(255,255,255,0.1)'}}/>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'18px',fontWeight:'700'}}>{test?.title}</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)'}}>{questions.length} questions • {test?.exam_type}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <Link href="/" style={{padding:'8px 16px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:'13px'}}>🌐 Live Site</Link>
        </div>
      </div>

      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'28px 24px'}}>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:'28px'}}>
          <button onClick={()=>setActiveTab('list')} className={`tab ${activeTab==='list'?'active':''}`}>📋 All Questions ({questions.length})</button>
          <button onClick={()=>setActiveTab('add')} className={`tab ${activeTab==='add'?'active':''}`}>➕ Add Question</button>
          <button onClick={()=>setActiveTab('bulk')} className={`tab ${activeTab==='bulk'?'active':''}`}>📦 Bulk Upload</button>
        </div>

        {/* ADD QUESTION TAB */}
        {activeTab==='add' && (
          <form onSubmit={handleSave}>
            {/* Question Type */}
            <div style={{marginBottom:'22px'}}>
              <label className="label">Question Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
                {QUESTION_TYPES.map(t=>(
                  <button key={t.value} type="button" onClick={()=>updateFormMarking(t.value)} className={`type-btn ${form.question_type===t.value?'active':''}`}>
                    <div style={{fontWeight:'700',fontSize:'13px',marginBottom:'2px'}}>{t.label}</div>
                    <div style={{fontSize:'11px',opacity:0.6}}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section & Topic & Difficulty */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px',marginBottom:'18px'}}>
              <div>
                <label className="label">Section Name</label>
                <input className="input" value={form.section_name} onChange={e=>setForm({...form,section_name:e.target.value})} placeholder="e.g. Part A, Section B" />
              </div>
              <div>
                <label className="label">Topic</label>
                <input className="input" value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="e.g. Real Analysis" />
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select className="input" value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div style={{marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}>
                <label className="label" style={{margin:0}}>Question Text * (use $...$ for inline LaTeX, $$...$$ for display)</label>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>
                    <input type="checkbox" checked={form.has_latex} onChange={e=>setForm({...form,has_latex:e.target.checked})} style={{accentColor:'#f59e0b'}}/>
                    Has LaTeX
                  </label>
                  {form.has_latex && (
                    <button type="button" onClick={()=>setPreviewLatex(!previewLatex)} className="btn btn-outline" style={{padding:'4px 12px',fontSize:'11px'}}>
                      {previewLatex?'Hide':'Preview'} LaTeX
                    </button>
                  )}
                </div>
              </div>
              <textarea className="input" value={form.question_text} onChange={e=>setForm({...form,question_text:e.target.value})} placeholder="Enter question. Use $x^2 + y^2 = r^2$ for LaTeX. Use $$\int_0^1 f(x)dx$$ for display math." rows={4} style={{resize:'vertical'}} required />
              {previewLatex && form.question_text && (
                <div className="latex-preview" dangerouslySetInnerHTML={{__html:form.question_text}} ref={el=>{if(el&&(window as any).renderMathInElement)(window as any).renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})}}/>
              )}
            </div>

            {/* Question Image */}
            <div style={{marginBottom:'18px'}}>
              <label className="label">Question Figure/Diagram (optional)</label>
              <div className="img-upload" onClick={()=>{setImgTarget('question_image_url');imgRef.current?.click()}}>
                {form.question_image_url ? (
                  <div>
                    <img src={form.question_image_url} alt="question" style={{maxHeight:'120px',borderRadius:'6px',marginBottom:'6px'}}/>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{fontSize:'28px',marginBottom:'6px'}}>🖼️</div>
                    <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)'}}>Click to upload figure/diagram</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',marginTop:'4px'}}>PNG, JPG, SVG supported</div>
                  </div>
                )}
              </div>
            </div>

            {/* MCQ/MSQ Options */}
            {form.question_type !== 'NAT' && (
              <div style={{marginBottom:'18px'}}>
                <label className="label">Options {form.question_type==='MSQ'?'(select all correct below)':''}</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  {['A','B','C','D'].map(opt=>(
                    <div key={opt}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        {form.question_type==='MSQ' ? (
                          <input type="checkbox" checked={form.correct_answers.includes(opt)}
                            onChange={e=>setForm(f=>({...f,correct_answers:e.target.checked?[...f.correct_answers,opt]:f.correct_answers.filter(x=>x!==opt)}))}
                            style={{width:'16px',height:'16px',accentColor:'#8b5cf6'}}/>
                        ) : (
                          <input type="radio" name="correct" value={opt} checked={form.correct_answer===opt}
                            onChange={()=>setForm({...form,correct_answer:opt})}
                            style={{width:'16px',height:'16px',accentColor:'#f59e0b'}}/>
                        )}
                        <label className="label" style={{margin:0,fontSize:'12px'}}>Option {opt} {form.question_type==='MCQ'&&form.correct_answer===opt?'✓ Correct':''}{form.question_type==='MSQ'&&form.correct_answers.includes(opt)?'✓ Correct':''}</label>
                      </div>
                      <input className="input" value={(form as any)[`option_${opt.toLowerCase()}`]}
                        onChange={e=>setForm({...form,[`option_${opt.toLowerCase()}`]:e.target.value})}
                        placeholder={`Option ${opt} text (supports $LaTeX$)`} />
                      <div style={{marginTop:'6px',display:'flex',alignItems:'center',gap:'6px',cursor:'pointer'}} onClick={()=>{setImgTarget(`option_${opt.toLowerCase()}_image`);imgRef.current?.click()}}>
                        {(form as any)[`option_${opt.toLowerCase()}_image`] ? (
                          <img src={(form as any)[`option_${opt.toLowerCase()}_image`]} alt={opt} style={{height:'40px',borderRadius:'4px'}}/>
                        ) : (
                          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',padding:'4px 8px',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'6px'}}>+ Add image for option {opt}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NAT Answer */}
            {form.question_type==='NAT' && (
              <div style={{marginBottom:'18px',padding:'16px',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px'}}>
                <label className="label">Numerical Answer Type</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                  <div>
                    <label className="label">Exact Answer</label>
                    <input className="input" type="number" step="any" value={form.nat_exact_answer} onChange={e=>setForm({...form,nat_exact_answer:e.target.value})} placeholder="e.g. 3.14" />
                  </div>
                  <div>
                    <label className="label">Min Answer (range)</label>
                    <input className="input" type="number" step="any" value={form.nat_answer_min} onChange={e=>setForm({...form,nat_answer_min:e.target.value})} placeholder="e.g. 3.10" />
                  </div>
                  <div>
                    <label className="label">Max Answer (range)</label>
                    <input className="input" type="number" step="any" value={form.nat_answer_max} onChange={e=>setForm({...form,nat_answer_max:e.target.value})} placeholder="e.g. 3.18" />
                  </div>
                </div>
                <p style={{fontSize:'12px',color:'rgba(16,185,129,0.7)',marginTop:'8px'}}>💡 If answer is a range (like ±0.5%), fill min/max. Otherwise fill exact answer only.</p>
              </div>
            )}

            {/* Marks */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'18px'}}>
              <div>
                <label className="label">Marks (+)</label>
                <input className="input" type="number" step="0.5" value={form.marks} onChange={e=>setForm({...form,marks:e.target.value})} />
              </div>
              <div>
                <label className="label">Negative Marks (-)</label>
                <input className="input" type="number" step="0.25" value={form.negative_marks} onChange={e=>setForm({...form,negative_marks:e.target.value})} />
              </div>
            </div>

            {/* Explanation */}
            <div style={{marginBottom:'24px'}}>
              <label className="label">Explanation / Solution (shown after test)</label>
              <textarea className="input" value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})} placeholder="Full solution with steps. Supports $LaTeX$." rows={3} style={{resize:'vertical'}} />
            </div>

            <div style={{display:'flex',gap:'12px'}}>
              <button type="button" onClick={()=>setForm({...emptyForm})} className="btn btn-outline">Reset</button>
              <button type="submit" disabled={saving} className="btn btn-gold" style={{flex:1,fontSize:'15px',padding:'13px'}}>
                {saving?'⏳ Saving...':'✅ Save Question'}
              </button>
              <button type="submit" disabled={saving} onClick={()=>{}} className="btn btn-purple" style={{fontSize:'13px'}}>
                Save & Add Next
              </button>
            </div>
          </form>
        )}

        {/* BULK UPLOAD TAB */}
        {activeTab==='bulk' && (
          <div>
            <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px',padding:'20px',marginBottom:'20px'}}>
              <h3 style={{fontSize:'16px',fontWeight:'700',marginBottom:'12px',color:'#f59e0b'}}>📦 Bulk Upload Format (JSON)</h3>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',marginBottom:'12px'}}>Paste a JSON array of questions. Each question follows this format:</p>
              <pre style={{background:'rgba(0,0,0,0.4)',borderRadius:'8px',padding:'14px',fontSize:'12px',color:'#10b981',overflowX:'auto',lineHeight:'1.6'}}>
{`[
  {
    "type": "MCQ",
    "question": "If $f(x) = x^2$, find $f'(x)$",
    "a": "$2x$",
    "b": "$x^2$",
    "c": "$2$",
    "d": "$x$",
    "answer": "A",
    "explanation": "By power rule, $f'(x) = 2x$",
    "marks": 3,
    "negative": 1,
    "section": "Part A",
    "topic": "Calculus",
    "difficulty": "Easy",
    "latex": true
  },
  {
    "type": "MSQ",
    "question": "Which of the following are prime numbers?",
    "a": "2", "b": "4", "c": "7", "d": "9",
    "answers": ["A", "C"],
    "marks": 3, "negative": 0
  },
  {
    "type": "NAT",
    "question": "Find the value of $\\\\int_0^1 x^2 dx$",
    "nat": 0.333,
    "marks": 3, "negative": 0,
    "latex": true
  }
]`}
              </pre>
            </div>

            <div style={{marginBottom:'16px'}}>
              <label className="label">Paste Your JSON Here</label>
              <textarea className="input" value={bulkText} onChange={e=>setBulkText(e.target.value)}
                placeholder='[{"type":"MCQ","question":"...","a":"...","b":"...","c":"...","d":"...","answer":"A"}]'
                rows={12} style={{resize:'vertical',fontFamily:'monospace',fontSize:'13px'}} />
            </div>

            <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
              <button onClick={parseBulk} className="btn btn-outline" style={{flex:1}}>🔍 Parse & Preview</button>
              {bulkParsed.length > 0 && (
                <button onClick={saveBulk} disabled={saving} className="btn btn-gold" style={{flex:2,fontSize:'15px'}}>
                  {saving ? '⏳ Saving...' : `✅ Save All ${bulkParsed.length} Questions`}
                </button>
              )}
            </div>

            {bulkParsed.length > 0 && (
              <div>
                <div style={{fontSize:'14px',fontWeight:'600',marginBottom:'12px',color:'#10b981'}}>✅ {bulkParsed.length} questions parsed successfully!</div>
                {bulkParsed.slice(0,3).map((q,i)=>(
                  <div key={i} className="q-card">
                    <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                      <span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:typeColor[q.type||'MCQ']+'33',color:typeColor[q.type||'MCQ'],fontWeight:'700'}}>{q.type||'MCQ'}</span>
                      {q.section && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{q.section}</span>}
                    </div>
                    <p style={{fontSize:'13px',color:'rgba(255,255,255,0.8)'}}>{q.question}</p>
                  </div>
                ))}
                {bulkParsed.length > 3 && <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',textAlign:'center'}}>...and {bulkParsed.length-3} more questions</p>}
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS LIST TAB */}
        {activeTab==='list' && (
          <div>
            {loading ? (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.3)'}}>Loading...</div>
            ) : questions.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'16px'}}>
                <div style={{fontSize:'48px',marginBottom:'14px'}}>❓</div>
                <p style={{color:'rgba(255,255,255,0.35)',marginBottom:'20px'}}>No questions yet</p>
                <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
                  <button onClick={()=>setActiveTab('add')} className="btn btn-gold">+ Add Question</button>
                  <button onClick={()=>setActiveTab('bulk')} className="btn btn-purple">📦 Bulk Upload</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
                  <span style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>{questions.length} questions total</span>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>setActiveTab('add')} className="btn btn-gold" style={{padding:'8px 16px',fontSize:'13px'}}>+ Add</button>
                    <button onClick={()=>setActiveTab('bulk')} className="btn btn-purple" style={{padding:'8px 16px',fontSize:'13px'}}>📦 Bulk</button>
                  </div>
                </div>
                {questions.map((q,i)=>(
                  <div key={q.id} className="q-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                      <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                        <span style={{fontSize:'13px',fontWeight:'700',color:'rgba(255,255,255,0.5)'}}>Q{i+1}</span>
                        <span style={{fontSize:'11px',padding:'2px 10px',borderRadius:'20px',background:(typeColor[q.question_type||'MCQ']||'#2471a3')+'33',color:typeColor[q.question_type||'MCQ']||'#2471a3',fontWeight:'700'}}>{q.question_type||'MCQ'}</span>
                        {q.section_name && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',background:'rgba(255,255,255,0.05)',padding:'2px 8px',borderRadius:'20px'}}>{q.section_name}</span>}
                        {q.topic && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>{q.topic}</span>}
                        {q.has_latex && <span style={{fontSize:'10px',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)',padding:'1px 6px',borderRadius:'10px'}}>LaTeX</span>}
                      </div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center',flexShrink:0}}>
                        <span style={{fontSize:'11px',background:'rgba(39,174,96,0.15)',color:'#27ae60',padding:'2px 8px',borderRadius:'20px',fontWeight:'700'}}>+{q.marks}</span>
                        <span style={{fontSize:'11px',background:'rgba(231,76,60,0.15)',color:'#e74c3c',padding:'2px 8px',borderRadius:'20px',fontWeight:'700'}}>-{q.negative_marks}</span>
                        <button onClick={()=>deleteQuestion(q.id)} style={{padding:'4px 12px',borderRadius:'6px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'rgba(239,68,68,0.7)',cursor:'pointer',fontSize:'11px',fontFamily:"'DM Sans',sans-serif"}}>Delete</button>
                      </div>
                    </div>
                    <p style={{fontSize:'14px',lineHeight:'1.7',color:'rgba(255,255,255,0.85)',marginBottom:'10px'}}
                      ref={el=>{if(el&&q.has_latex&&(window as any).renderMathInElement)(window as any).renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})}}>
                      {q.question_text}
                    </p>
                    {q.question_image_url && <img src={q.question_image_url} alt="question" style={{maxHeight:'100px',borderRadius:'6px',marginBottom:'8px'}}/>}
                    {q.question_type !== 'NAT' && (
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                        {['A','B','C','D'].map(opt=>{
                          const text = q[`option_${opt.toLowerCase()}`]
                          if (!text) return null
                          const isCorrect = q.question_type==='MSQ' ? (q.correct_answers||[]).includes(opt) : q.correct_answer===opt
                          return (
                            <div key={opt} style={{padding:'7px 10px',borderRadius:'7px',fontSize:'12px',background:isCorrect?'rgba(39,174,96,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${isCorrect?'rgba(39,174,96,0.3)':'rgba(255,255,255,0.07)'}`,color:isCorrect?'#27ae60':'rgba(255,255,255,0.55)'}}>
                              <strong>{opt}.</strong> {text} {isCorrect&&'✓'}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {q.question_type==='NAT' && (
                      <div style={{padding:'8px 12px',background:'rgba(16,185,129,0.08)',borderRadius:'8px',fontSize:'13px',color:'#10b981'}}>
                        Answer: {q.nat_exact_answer ?? `${q.nat_answer_min} to ${q.nat_answer_max}`}
                      </div>
                    )}
                    {q.explanation && <div style={{marginTop:'8px',padding:'8px 12px',background:'rgba(245,158,11,0.06)',borderRadius:'8px',borderLeft:'3px solid #f59e0b',fontSize:'12px',color:'rgba(245,158,11,0.8)'}}><strong>Solution:</strong> {q.explanation}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden image input */}
      <input ref={imgRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={async e=>{if(e.target.files?.[0])await uploadImage(e.target.files[0],imgTarget)}} />

      {uploadingImg && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#1a1a2e',borderRadius:'12px',padding:'24px',textAlign:'center'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>⏳</div>
            <p style={{color:'rgba(255,255,255,0.7)'}}>Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  )
}