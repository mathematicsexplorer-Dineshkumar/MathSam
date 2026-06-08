'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const exams = ['All','IIT JAM','CSIR NET','GATE','TIFR','NBHM','CMI','CUET UG','CUET PG','PhD Entrance','JEE Main','NEET','UPSC','Class 12']

  useEffect(() => {
    const fetchPDFs = async () => {
      const { data } = await supabase.from('pdfs').select('*').eq('is_published', true).order('created_at', { ascending: false })
      setPdfs(data || [])
      setLoading(false)
    }
    fetchPDFs()
  }, [])

  const filtered = filter === 'All' ? pdfs : pdfs.filter(p => p.exam_type === filter)

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .nav-glass{background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;z-index:50;}
        .nav-link{color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;}
        .nav-link:hover{color:#f59e0b;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .filter-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .filter-pill:hover{border-color:rgba(16,185,129,0.4);color:#10b981;}
        .filter-pill.active{background:rgba(16,185,129,0.15);border-color:#10b981;color:#10b981;}
        .pdf-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;transition:all 0.3s;display:flex;flex-direction:column;gap:14px;}
        .pdf-card:hover{border-color:rgba(16,185,129,0.3);transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,0.3);}
        .btn-buy{background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-block;}
        .btn-buy:hover{box-shadow:0 4px 15px rgba(16,185,129,0.4);}
      `}</style>

      {/* Navbar */}
      <nav className="nav-glass" style={{padding:'0 60px',height:'68px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'20px',fontWeight:'700',color:'#fff'}}>MathSam</span>
        </Link>
        <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
          <Link href="/courses" className="nav-link">Courses</Link>
          <Link href="/pdfs" className="nav-link" style={{color:'#10b981'}}>PDF Notes</Link>
          <Link href="/tests" className="nav-link">Tests</Link>
          <Link href="/login" className="btn-gold" style={{padding:'8px 20px',borderRadius:'8px',fontSize:'14px'}}>Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:'60px 60px 40px',background:'radial-gradient(ellipse at 50% 0%,rgba(16,185,129,0.08) 0%,transparent 60%)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
          <div style={{color:'#10b981',fontSize:'12px',fontWeight:'600',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'14px'}}>PDF Study Material</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'52px',fontWeight:'900',marginBottom:'16px'}}>
            Concise Notes for <span style={{background:'linear-gradient(135deg,#10b981,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Quick Revision</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'16px',fontWeight:'300'}}>{pdfs.length} PDF notes available • Instant download after purchase</p>
        </div>
      </section>

      {/* Filters */}
      <section style={{padding:'0 60px 32px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px'}}>
          {exams.map(e=>(
            <button key={e} onClick={()=>setFilter(e)} className={`filter-pill ${filter===e?'active':''}`} style={{padding:'8px 18px',borderRadius:'50px',fontSize:'13px',fontWeight:'500'}}>
              {e}
            </button>
          ))}
        </div>
      </section>

      {/* PDFs Grid */}
      <section style={{padding:'40px 60px 80px',maxWidth:'1260px',margin:'0 auto'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'80px',color:'rgba(255,255,255,0.3)'}}>Loading PDFs...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px'}}>
            <div style={{fontSize:'60px',marginBottom:'16px'}}>📄</div>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'16px'}}>No PDFs found for "{filter}"</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
            {filtered.map(pdf=>(
              <div key={pdf.id} className="pdf-card">
                <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                  <div style={{width:'56px',height:'56px',background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px',flexShrink:0}}>📄</div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:'11px',background:'rgba(16,185,129,0.15)',color:'#10b981',border:'1px solid rgba(16,185,129,0.3)',padding:'2px 8px',borderRadius:'4px',fontWeight:'600'}}>{pdf.exam_type}</span>
                    <h3 style={{fontSize:'15px',fontWeight:'700',marginTop:'6px',lineHeight:'1.3'}}>{pdf.title}</h3>
                  </div>
                </div>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',lineHeight:'1.5'}}>{pdf.description}</p>
                <div style={{display:'flex',gap:'16px'}}>
                  {pdf.pages && <span style={{fontSize:'12px',color:'rgba(255,255,255,0.35)'}}>📑 {pdf.pages} pages</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'14px'}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:'22px',fontWeight:'700',color:'#10b981'}}>₹{pdf.price}</span>
                  <button className="btn-buy" style={{padding:'9px 20px',borderRadius:'8px',fontSize:'13px'}}>
                    Buy Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}