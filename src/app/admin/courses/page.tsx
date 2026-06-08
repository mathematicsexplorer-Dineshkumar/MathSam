'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'dk9785562756@gmail.com' // 👈 CHANGE THIS

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', price: '', original_price: '',
    exam_type: '', total_lectures: '', total_hours: '', thumbnail_url: '', is_published: false
  })
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      fetchCourses()
    }
    init()
  }, [router])

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('courses').insert([{
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      original_price: parseFloat(form.original_price) || null,
      exam_type: form.exam_type,
      total_lectures: parseInt(form.total_lectures) || 0,
      total_hours: parseFloat(form.total_hours) || 0,
      thumbnail_url: form.thumbnail_url,
      is_published: form.is_published
    }])
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Course added!')
      setShowForm(false)
      setForm({ title:'',description:'',price:'',original_price:'',exam_type:'',total_lectures:'',total_hours:'',thumbnail_url:'',is_published:false })
      fetchCourses()
    }
    setSaving(false)
  }

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', id)
    toast.success(current ? 'Course unpublished' : 'Course published!')
    fetchCourses()
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return
    await supabase.from('courses').delete().eq('id', id)
    toast.success('Course deleted')
    fetchCourses()
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif",display:'flex'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .sidebar{background:#080810;border-right:1px solid rgba(255,255,255,0.06);width:220px;min-height:100vh;position:fixed;top:0;left:0;padding:24px 14px;display:flex;flex-direction:column;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;text-decoration:none;color:rgba(255,255,255,0.45);font-size:13px;font-weight:500;margin-bottom:3px;transition:all 0.2s;}
        .nav-item:hover,.nav-item.active{background:rgba(245,158,11,0.1);color:#f59e0b;}
        .main{margin-left:220px;padding:36px 44px;flex:1;}
        .input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px 16px;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.3s;}
        .input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.08);}
        .input::placeholder{color:rgba(255,255,255,0.2);}
        select.input option{background:#1a1a2e;color:#fff;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.3s;border-radius:10px;}
        .btn-gold:hover{box-shadow:0 6px 20px rgba(245,158,11,0.35);}
        .btn-gold:disabled{opacity:0.6;cursor:not-allowed;}
        .course-row{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 22px;display:flex;align-items:center;gap:16px;margin-bottom:10px;transition:all 0.2s;}
        .course-row:hover{border-color:rgba(245,158,11,0.2);}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal{background:#0f0f1a;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;}
        .label{display:block;color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:0.5px;margin-bottom:7px;}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <Link href="/admin" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'28px',textDecoration:'none'}}>
          <div style={{width:'30px',height:'30px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>📐</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'16px',color:'#fff',fontWeight:'700'}}>MathSam</div>
            <div style={{fontSize:'9px',color:'#f59e0b',letterSpacing:'1px'}}>ADMIN</div>
          </div>
        </Link>
        {[
          {icon:'📊',label:'Dashboard',href:'/admin'},
          {icon:'🎥',label:'Courses',href:'/admin/courses',active:true},
          {icon:'📄',label:'PDF Notes',href:'/admin/pdfs'},
          {icon:'📝',label:'Tests',href:'/admin/tests'},
          {icon:'👥',label:'Students',href:'/admin/students'},
        ].map(i=>(
          <Link key={i.label} href={i.href} className={`nav-item ${i.active?'active':''}`}>
            <span>{i.icon}</span>{i.label}
          </Link>
        ))}
        <div style={{flex:1}}/>
        <Link href="/" className="nav-item" style={{color:'rgba(255,255,255,0.25)'}}>🌐 Live Site</Link>
      </div>

      {/* Main */}
      <div className="main">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
          <div>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',marginBottom:'4px'}}>Admin → Courses</p>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'34px',fontWeight:'700'}}>Manage Courses</h1>
            <p style={{color:'rgba(255,255,255,0.35)',marginTop:'4px',fontSize:'14px'}}>{courses.length} course{courses.length!==1?'s':''} total</p>
          </div>
          <button onClick={()=>setShowForm(true)} className="btn-gold" style={{padding:'12px 24px',fontSize:'14px',display:'flex',alignItems:'center',gap:'8px'}}>
            + Add New Course
          </button>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.3)'}}>Loading...</div>
        ) : courses.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 40px',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'16px'}}>
            <div style={{fontSize:'56px',marginBottom:'16px'}}>🎥</div>
            <h3 style={{fontSize:'20px',fontWeight:'600',marginBottom:'8px'}}>No courses yet</h3>
            <p style={{color:'rgba(255,255,255,0.35)',marginBottom:'24px',fontSize:'14px'}}>Click "Add New Course" to create your first course</p>
            <button onClick={()=>setShowForm(true)} className="btn-gold" style={{padding:'12px 28px',fontSize:'14px'}}>+ Add First Course</button>
          </div>
        ) : (
          <div>
            {courses.map(course=>(
              <div key={course.id} className="course-row">
                <div style={{width:'48px',height:'48px',background:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05))',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>🎥</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'3px'}}>{course.title}</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)'}}>{course.exam_type} • {course.total_lectures} lectures • ₹{course.price}</div>
                </div>
                <span style={{fontSize:'11px',padding:'4px 12px',borderRadius:'20px',fontWeight:'600',background:course.is_published?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.07)',color:course.is_published?'#10b981':'rgba(255,255,255,0.4)',border:`1px solid ${course.is_published?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.1)'}`}}>
                  {course.is_published?'● Live':'○ Draft'}
                </span>
                <button onClick={()=>togglePublish(course.id,course.is_published)} style={{padding:'7px 14px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'12px',fontFamily:"'DM Sans',sans-serif"}}>
                  {course.is_published?'Unpublish':'Publish'}
                </button>
                <button onClick={()=>deleteCourse(course.id)} style={{padding:'7px 14px',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'rgba(239,68,68,0.8)',cursor:'pointer',fontSize:'12px',fontFamily:"'DM Sans',sans-serif"}}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showForm && (
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className="modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'26px',fontWeight:'700'}}>Add New Course</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.06)',border:'none',color:'rgba(255,255,255,0.5)',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'18px'}}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{marginBottom:'16px'}}>
                <label className="label">COURSE TITLE *</label>
                <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Complete JEE Mathematics 2025" required />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label className="label">DESCRIPTION</label>
                <textarea className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Course description..." rows={3} style={{resize:'vertical'}} />
              </div>
              <div className="grid2" style={{marginBottom:'16px'}}>
                <div>
                  <label className="label">PRICE (₹) *</label>
                  <input className="input" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="999" required />
                </div>
                <div>
                  <label className="label">ORIGINAL PRICE (₹)</label>
                  <input className="input" type="number" value={form.original_price} onChange={e=>setForm({...form,original_price:e.target.value})} placeholder="1999" />
                </div>
              </div>
              <div className="grid2" style={{marginBottom:'16px'}}>
                <div>
                  <label className="label">EXAM TYPE</label>
                  <select className="input" value={form.exam_type} onChange={e=>setForm({...form,exam_type:e.target.value})}>
  <option value="">Select exam...</option>
  <option value="IIT JAM">IIT JAM</option>
  <option value="CSIR NET">CSIR NET</option>
  <option value="GATE">GATE</option>
  <option value="TIFR">TIFR</option>
  <option value="NBHM">NBHM</option>
  <option value="CMI">CMI</option>
  <option value="CUET UG">CUET UG</option>
  <option value="CUET PG">CUET PG</option>
  <option value="PhD Entrance">PhD Entrance</option>
  <option value="JEE Main">JEE Main</option>
  <option value="JEE Advanced">JEE Advanced</option>
  <option value="NEET">NEET</option>
  <option value="UPSC">UPSC</option>
  <option value="NDA">NDA</option>
  <option value="SSC CGL">SSC CGL</option>
  <option value="Class 10">Class 10</option>
  <option value="Class 11">Class 11</option>
  <option value="Class 12">Class 12</option>
  <option value="CAT">CAT</option>
</select>
                </div>
                <div>
                  <label className="label">TOTAL LECTURES</label>
                  <input className="input" type="number" value={form.total_lectures} onChange={e=>setForm({...form,total_lectures:e.target.value})} placeholder="50" />
                </div>
              </div>
              <div className="grid2" style={{marginBottom:'16px'}}>
                <div>
                  <label className="label">TOTAL HOURS</label>
                  <input className="input" type="number" step="0.5" value={form.total_hours} onChange={e=>setForm({...form,total_hours:e.target.value})} placeholder="40" />
                </div>
                <div>
                  <label className="label">THUMBNAIL URL</label>
                  <input className="input" value={form.thumbnail_url} onChange={e=>setForm({...form,thumbnail_url:e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px',padding:'14px',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'10px'}}>
                <input type="checkbox" id="publish" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})} style={{width:'16px',height:'16px',accentColor:'#f59e0b'}} />
                <label htmlFor="publish" style={{color:'rgba(255,255,255,0.7)',fontSize:'14px',cursor:'pointer'}}>Publish immediately (visible to students)</label>
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:'13px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-gold" style={{flex:2,padding:'13px',fontSize:'15px'}}>
                  {saving?'⏳ Saving...':'✅ Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}