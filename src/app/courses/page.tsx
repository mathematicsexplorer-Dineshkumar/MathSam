'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const exams = ['All','IIT JAM','CSIR NET','GATE','TIFR','NBHM','CMI','CUET UG','CUET PG','PhD Entrance','JEE Main','JEE Advanced','NEET','UPSC','Class 12']

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false })
      setCourses(data || [])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  const filtered = filter === 'All' ? courses : courses.filter(c => c.exam_type === filter)

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .nav-glass{background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(245,158,11,0.1);position:sticky;top:0;z-index:50;}
        .nav-link{color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;}
        .nav-link:hover{color:#f59e0b;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .btn-gold:hover{box-shadow:0 6px 20px rgba(245,158,11,0.4);}
        .filter-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .filter-pill:hover{border-color:rgba(245,158,11,0.3);color:#f59e0b;}
        .filter-pill.active{background:rgba(245,158,11,0.15);border-color:#f59e0b;color:#f59e0b;}
        .course-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;transition:all 0.3s;}
        .course-card:hover{border-color:rgba(245,158,11,0.3);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4);}
        .btn-view{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-block;}
        .btn-view:hover{box-shadow:0 4px 15px rgba(245,158,11,0.4);}
      `}</style>

      {/* Navbar */}
      <nav className="nav-glass" style={{padding:'0 60px',height:'68px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'20px',fontWeight:'700',color:'#fff'}}>MathSamiksha</span>
        </Link>
        <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
          <Link href="/courses" className="nav-link" style={{color:'#f59e0b'}}>Courses</Link>
          <Link href="/pdfs" className="nav-link">PDF Notes</Link>
          <Link href="/tests" className="nav-link">Tests</Link>
          <Link href="/login" className="btn-gold" style={{padding:'8px 20px',borderRadius:'8px',fontSize:'14px'}}>Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:'60px 60px 40px',background:'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.08) 0%,transparent 60%)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
          <div style={{color:'#f59e0b',fontSize:'12px',fontWeight:'600',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'14px'}}>All Courses</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'52px',fontWeight:'900',marginBottom:'16px'}}>
            Learn from <span className="gold-gradient">India's Best</span><br/>Math Educators
          </h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'16px',marginBottom:'0',fontWeight:'300'}}>{courses.length} courses available</p>
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

      {/* Courses Grid */}
      <section style={{padding:'40px 60px 80px',maxWidth:'1260px',margin:'0 auto'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'80px',color:'rgba(255,255,255,0.3)',fontSize:'16px'}}>Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px'}}>
            <div style={{fontSize:'60px',marginBottom:'16px'}}>📚</div>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'16px'}}>No courses found for "{filter}"</p>
            <button onClick={()=>setFilter('All')} style={{marginTop:'16px',padding:'10px 24px',borderRadius:'8px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Show All</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'24px'}}>
            {filtered.map(course=>(
              <div key={course.id} className="course-card">
                {/* Thumbnail */}
                <div style={{height:'180px',background:course.thumbnail_url?`url(${course.thumbnail_url}) center/cover`:'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.05))',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  {!course.thumbnail_url && <span style={{fontSize:'60px'}}>🎥</span>}
                  <div style={{position:'absolute',top:'12px',left:'12px',background:'rgba(245,158,11,0.9)',color:'#000',fontSize:'11px',fontWeight:'700',padding:'4px 10px',borderRadius:'6px'}}>{course.exam_type}</div>
                  {course.original_price > course.price && (
                    <div style={{position:'absolute',top:'12px',right:'12px',background:'rgba(239,68,68,0.9)',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'4px 10px',borderRadius:'6px'}}>
                      {Math.round((1-course.price/course.original_price)*100)}% OFF
                    </div>
                  )}
                </div>
                {/* Content */}
                <div style={{padding:'20px'}}>
                  <h3 style={{fontSize:'17px',fontWeight:'700',marginBottom:'6px',lineHeight:'1.3'}}>{course.title}</h3>
                  <p style={{color:'rgba(255,255,255,0.45)',fontSize:'13px',marginBottom:'14px',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{course.description}</p>
                  <div style={{display:'flex',gap:'14px',marginBottom:'16px'}}>
                    <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:'4px'}}>🎬 {course.total_lectures} lectures</span>
                    <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:'4px'}}>⏱ {course.total_hours}h</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:'22px',fontWeight:'700',color:'#f59e0b'}}>₹{course.price}</span>
                      {course.original_price > course.price && (
                        <span style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',textDecoration:'line-through',marginLeft:'8px'}}>₹{course.original_price}</span>
                      )}
                    </div>
                    <Link href={`/courses/${course.id}`} className="btn-view" style={{padding:'9px 20px',borderRadius:'8px',fontSize:'13px'}}>
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}