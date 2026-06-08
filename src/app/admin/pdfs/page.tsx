'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'dk9785562756@gmail.com' // 👈 CHANGE THIS

export default function AdminPDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', exam_type: '', price: '',
    pages: '', file_url: '', preview_url: '', is_published: false
  })
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      fetchPDFs()
    }
    init()
  }, [router])

  const fetchPDFs = async () => {
    const { data } = await supabase.from('pdfs').select('*').order('created_at', { ascending: false })
    setPdfs(data || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('pdfs').insert([{
      title: form.title, description: form.description,
      exam_type: form.exam_type, price: parseFloat(form.price),
      pages: parseInt(form.pages) || null,
      file_url: form.file_url, preview_url: form.preview_url,
      is_published: form.is_published
    }])
    if (error) { toast.error(error.message) } else {
      toast.success('PDF added!')
      setShowForm(false)
      setForm({ title:'',description:'',exam_type:'',price:'',pages:'',file_url:'',preview_url:'',is_published:false })
      fetchPDFs()
    }
    setSaving(false)
  }

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('pdfs').update({ is_published: !current }).eq('id', id)
    toast.success(current ? 'Unpublished' : 'Published!')
    fetchPDFs()
  }

  const deletePDF = async (id: string) => {
    if (!confirm('Delete this PDF?')) return
    await supabase.from('pdfs').delete().eq('id', id)
    toast.success('PDF deleted')
    fetchPDFs()
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif",display:'flex'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .sidebar{background:#080810;border-right:1px solid rgba(255,255,255,0.06);width:220px;min-height:100vh;position:fixed;top:0;left:0;padding:24px 14px;display:flex;flex-direction:column;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;text-decoration:none;color:rgba(255,255,255,0.45);font-size:13px;font-weight:500;margin-bottom:3px;transition:all 0.2s;}
        .nav-item:hover,.nav-item.active{background:rgba(16,185,129,0.1);color:#10b981;}
        .main{margin-left:220px;padding:36px 44px;flex:1;}
        .input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px 16px;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.3s;}
        .input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,0.08);}
        .input::placeholder{color:rgba(255,255,255,0.2);}
        select.input option{background:#1a1a2e;}
        .btn-green{background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.3s;border-radius:10px;}
        .btn-green:hover{box-shadow:0 6px 20px rgba(16,185,129,0.35);}
        .btn-green:disabled{opacity:0.6;cursor:not-allowed;}
        .row{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 22px;display:flex;align-items:center;gap:16px;margin-bottom:10px;transition:all 0.2s;}
        .row:hover{border-color:rgba(16,185,129,0.2);}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal{background:#0f0f1a;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;}
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
          {icon:'🎥',label:'Courses',href:'/admin/courses'},
          {icon:'📄',label:'PDF Notes',href:'/admin/pdfs',active:true},
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
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',marginBottom:'4px'}}>Admin → PDF Notes</p>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'34px',fontWeight:'700'}}>Manage PDF Notes</h1>
            <p style={{color:'rgba(255,255,255,0.35)',marginTop:'4px',fontSize:'14px'}}>{pdfs.length} PDF{pdfs.length!==1?'s':''} total</p>
          </div>
          <button onClick={()=>setShowForm(true)} className="btn-green" style={{padding:'12px 24px',fontSize:'14px'}}>
            + Upload PDF
          </button>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.3)'}}>Loading...</div>
        ) : pdfs.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 40px',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'16px'}}>
            <div style={{fontSize:'56px',marginBottom:'16px'}}>📄</div>
            <h3 style={{fontSize:'20px',fontWeight:'600',marginBottom:'8px'}}>No PDFs yet</h3>
            <p style={{color:'rgba(255,255,255,0.35)',marginBottom:'24px',fontSize:'14px'}}>Upload your first PDF study material</p>
            <button onClick={()=>setShowForm(true)} className="btn-green" style={{padding:'12px 28px',fontSize:'14px'}}>+ Upload First PDF</button>
          </div>
        ) : (
          <div>
            {pdfs.map(pdf=>(
              <div key={pdf.id} className="row">
                <div style={{width:'48px',height:'48px',background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>📄</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'3px'}}>{pdf.title}</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)'}}>{pdf.exam_type} • {pdf.pages} pages • ₹{pdf.price}</div>
                </div>
                <span style={{fontSize:'11px',padding:'4px 12px',borderRadius:'20px',fontWeight:'600',background:pdf.is_published?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.07)',color:pdf.is_published?'#10b981':'rgba(255,255,255,0.4)',border:`1px solid ${pdf.is_published?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.1)'}`}}>
                  {pdf.is_published?'● Live':'○ Draft'}
                </span>
                <button onClick={()=>togglePublish(pdf.id,pdf.is_published)} style={{padding:'7px 14px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'12px',fontFamily:"'DM Sans',sans-serif"}}>
                  {pdf.is_published?'Unpublish':'Publish'}
                </button>
                <button onClick={()=>deletePDF(pdf.id)} style={{padding:'7px 14px',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'rgba(239,68,68,0.8)',cursor:'pointer',fontSize:'12px',fontFamily:"'DM Sans',sans-serif"}}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className="modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'26px',fontWeight:'700'}}>Upload PDF Note</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.06)',border:'none',color:'rgba(255,255,255,0.5)',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'18px'}}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{marginBottom:'16px'}}>
                <label className="label">PDF TITLE *</label>
                <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. JEE Calculus Complete Notes" required />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label className="label">DESCRIPTION</label>
                <textarea className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What topics does this PDF cover?" rows={3} style={{resize:'vertical'}} />
              </div>
              <div className="grid2" style={{marginBottom:'16px'}}>
                <div>
                  <label className="label">PRICE (₹) *</label>
                  <input className="input" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="99" required />
                </div>
                <div>
                  <label className="label">TOTAL PAGES</label>
                  <input className="input" type="number" value={form.pages} onChange={e=>setForm({...form,pages:e.target.value})} placeholder="50" />
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label className="label">EXAM TYPE</label>
                <select className="input" value={form.exam_type} onChange={e=>setForm({...form,exam_type:e.target.value})}>
                  <option value="">Select exam...</option>
                  {['JEE Main','JEE Advanced','NEET','UPSC','NDA','SSC CGL','Class 10','Class 12','CUET','CAT'].map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label className="label">PDF FILE URL (from Supabase Storage)</label>
                <input className="input" value={form.file_url} onChange={e=>setForm({...form,file_url:e.target.value})} placeholder="https://..." />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label className="label">PREVIEW URL (optional)</label>
                <input className="input" value={form.preview_url} onChange={e=>setForm({...form,preview_url:e.target.value})} placeholder="https://..." />
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px',padding:'14px',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:'10px'}}>
                <input type="checkbox" id="pub" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})} style={{width:'16px',height:'16px',accentColor:'#10b981'}} />
                <label htmlFor="pub" style={{color:'rgba(255,255,255,0.7)',fontSize:'14px',cursor:'pointer'}}>Publish immediately</label>
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:'13px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-green" style={{flex:2,padding:'13px',fontSize:'15px'}}>
                  {saving?'⏳ Saving...':'✅ Save PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}