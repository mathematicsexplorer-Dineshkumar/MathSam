'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const exams = ['All','IIT JAM','CSIR NET','GATE','TIFR','NBHM','CMI','CUET UG','CUET PG','PhD Entrance','JEE Main','NEET','UPSC','Class 12']
  const diffColor: any = { Easy:'#10b981', Medium:'#f59e0b', Hard:'#ef4444' }

  useEffect(() => {
    const fetchTests = async () => {
      const { data } = await supabase.from('tests').select('*').eq('is_published', true).order('created_at', { ascending: false })
      setTests(data || [])
      setLoading(false)
    }
    fetchTests()
  }, [])

  const filtered = filter === 'All' ? tests : tests.filter(t => t.exam_type === filter)

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .nav-glass{background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;z-index:50;}
        .nav-link{color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;}
        .nav-link:hover{color:#f59e0b;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .filter-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .filter-pill:hover{border-color:rgba(139,92,246,0.4);color:#8b5cf6;}
        .filter-pill.active{background:rgba(139,92,246,0.15);border-color:#8b5cf6;color:#8b5cf6;}
        .test-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;transition:all 0.3s;}
        .test-card:hover{border-color:rgba(139,92,246,0.3);transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,0.3);}
        .btn-attempt{background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;}
        .btn-attempt:hover{box-shadow:0 4px 15px rgba(139,92,246,0.4);}
        .stat-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:10px 14px;text-align:center;}
      `}</style>

      {/* Navbar */}
      <nav className="nav-glass" style={{padding:'0 60px',height:'68px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'20px',fontWeight:'700',color:'#fff'}}>MathSam</span>
        </Link>
        <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
          <Link href="/courses" className="nav-link">Courses</Link>
          <Link href="/pdfs" className="nav-link">PDF Notes</Link>
          <Link href="/tests" className="nav-link" style={{color:'#8b5cf6'}}>Tests</Link>
          <Link href="/login" className="btn-gold" style={{padding:'8px 20px',borderRadius:'8px',fontSize:'14px'}}>Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:'60px 60px 40px',background:'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.08) 0%,transparent 60%)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
          <div style={{color:'#8b5cf6',fontSize:'12px',fontWeight:'600',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'14px'}}>Test Series</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'52px',fontWeight:'900',marginBottom:'16px'}}>
            Practice Smart,<br/><span style={{background:'linear-gradient(135deg,#8b5cf6,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Score Higher</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'16px',fontWeight:'300'}}>{tests.length} tests available • Timed • Instant results & analysis</p>
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

      {/* Tests Grid */}
      <section style={{padding:'40px 60px 80px',maxWidth:'1260px',margin:'0 auto'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'80px',color:'rgba(255,255,255,0.3)'}}>Loading tests...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px'}}>
            <div style={{fontSize:'60px',marginBottom:'16px'}}>📝</div>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'16px'}}>No tests found for "{filter}"</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'20px'}}>
            {filtered.map(test=>(
              <div key={test.id} className="test-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
                  <div style={{width:'50px',height:'50px',background:'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.05))',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>📝</div>
                  <div style={{display:'flex',gap:'6px'}}>
                    <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontWeight:'600',background:`rgba(255,255,255,0.06)`,color:diffColor[test.difficulty]||'#fff',border:`1px solid ${diffColor[test.difficulty]}44`}}>{test.difficulty}</span>
                    <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'20px',background:'rgba(139,92,246,0.15)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,0.3)',fontWeight:'600'}}>{test.exam_type}</span>
                  </div>
                </div>
                <h3 style={{fontSize:'16px',fontWeight:'700',marginBottom:'16px',lineHeight:'1.3'}}>{test.title}</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'16px'}}>
                  <div className="stat-box">
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#8b5cf6'}}>{test.total_questions}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginTop:'2px'}}>Questions</div>
                  </div>
                  <div className="stat-box">
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#f59e0b'}}>{test.duration_minutes}m</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginTop:'2px'}}>Duration</div>
                  </div>
                  <div className="stat-box">
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#10b981'}}>-⅓</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginTop:'2px'}}>Negative</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'14px'}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:'22px',fontWeight:'700',color:'#8b5cf6'}}>
                    {test.price === 0 ? 'FREE' : `₹${test.price}`}
                  </span>
                  <button className="btn-attempt" style={{padding:'9px 20px',borderRadius:'8px',fontSize:'13px'}}>
                    Attempt →
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