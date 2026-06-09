'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login') } else { setUser(user) }
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out!')
    router.push('/')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'40px',marginBottom:'16px',animation:'spin 2s linear infinite',display:'inline-block'}}>⚙️</div>
        <p style={{color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>Loading your dashboard...</p>
      </div>
    </div>
  )

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sidebar{background:#0d0d14;border-right:1px solid rgba(255,255,255,0.06);width:240px;min-height:100vh;position:fixed;top:0;left:0;}
        .main-content{margin-left:240px;min-height:100vh;background:radial-gradient(ellipse at 80% 0%,rgba(245,158,11,0.06) 0%,transparent 50%),#0a0a0f;}
        .stat-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;transition:all 0.3s;}
        .stat-card:hover{border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.04);transform:translateY(-3px);}
        .course-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;transition:all 0.3s;}
        .course-card:hover{border-color:rgba(245,158,11,0.2);background:rgba(255,255,255,0.05);}
        .nav-item{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:10px;cursor:pointer;transition:all 0.2s;text-decoration:none;color:rgba(255,255,255,0.5);font-size:14px;font-weight:500;margin-bottom:4px;}
        .nav-item:hover,.nav-item.active{background:rgba(245,158,11,0.1);color:#f59e0b;border-left:2px solid #f59e0b;}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;}
        .btn-gold:hover{box-shadow:0 6px 20px rgba(245,158,11,0.4);}
        .progress-bar{height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:3px;}
        .badge{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{display:'flex',flexDirection:'column',padding:'24px 16px'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'36px',textDecoration:'none',padding:'0 8px'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'20px',fontWeight:'700',color:'#fff'}}>MathSamiksha</span>
        </Link>

        {/* User */}
        <div style={{padding:'16px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'12px',marginBottom:'24px'}}>
          <div style={{width:'42px',height:'42px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',marginBottom:'10px'}}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'2px'}}>{name}</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{user?.email}</div>
          <div style={{marginTop:'8px'}}><span className="badge" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)'}}>⭐ Student</span></div>
        </div>

        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontWeight:'600',letterSpacing:'2px',marginBottom:'10px',paddingLeft:'8px'}}>MENU</div>
        {[
          {icon:'🏠',label:'Overview',tab:'overview'},
          {icon:'🎥',label:'My Courses',tab:'courses',href:'/dashboard/my-courses'},
          {icon:'📄',label:'My PDFs',tab:'pdfs',href:'/dashboard/my-pdfs'},
          {icon:'📝',label:'My Tests',tab:'tests',href:'/dashboard/my-tests'},
        ].map(item=>(
          <Link key={item.tab} href={item.href||'#'} onClick={()=>setActiveTab(item.tab)}
            className={`nav-item ${activeTab===item.tab?'active':''}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}

        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontWeight:'600',letterSpacing:'2px',margin:'20px 0 10px',paddingLeft:'8px'}}>EXPLORE</div>
        {[
          {icon:'🔍',label:'All Courses',href:'/courses'},
          {icon:'📚',label:'Browse PDFs',href:'/pdfs'},
          {icon:'🏆',label:'Test Series',href:'/tests'},
        ].map(item=>(
          <Link key={item.label} href={item.href} className="nav-item">
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}

        <div style={{flex:1}}/>
        <button onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 16px',borderRadius:'10px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'rgba(239,68,68,0.8)',cursor:'pointer',fontSize:'14px',fontWeight:'500',fontFamily:"'DM Sans',sans-serif",width:'100%'}}>
          🚪 Logout
        </button>
      </div>

      {/* Main */}
      <div className="main-content" style={{padding:'40px 48px'}}>
        {/* Header */}
        <div style={{marginBottom:'40px'}}>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginBottom:'6px'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
          </p>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'38px',fontWeight:'700'}}>
            Good {new Date().getHours()<12?'Morning':'Afternoon'}, <span className="gold-gradient">{name.split(' ')[0]}!</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginTop:'6px',fontSize:'15px'}}>Here's your learning overview for today</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'36px'}}>
          {[
            {icon:'🎥',label:'Courses Enrolled',value:'0',change:'Browse courses →',color:'#f59e0b'},
            {icon:'📄',label:'PDFs Purchased',value:'0',change:'Browse PDFs →',color:'#10b981'},
            {icon:'📝',label:'Tests Attempted',value:'0',change:'Take a test →',color:'#8b5cf6'},
            {icon:'🏆',label:'Best Score',value:'—',change:'Start testing →',color:'#f59e0b'},
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div style={{fontSize:'28px',marginBottom:'12px'}}>{s.icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'32px',fontWeight:'700',color:s.color,marginBottom:'4px'}}>{s.value}</div>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',marginBottom:'12px'}}>{s.label}</div>
              <div style={{fontSize:'12px',color:s.color,opacity:0.7}}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{marginBottom:'36px'}}>
          <h2 style={{fontSize:'18px',fontWeight:'600',marginBottom:'16px'}}>Quick Actions</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
            {[
              {icon:'🎥',title:'Browse Courses',desc:'Find your perfect course',href:'/courses',color:'rgba(245,158,11,0.1)',border:'rgba(245,158,11,0.2)'},
              {icon:'📄',title:'Download PDFs',desc:'Get study notes',href:'/pdfs',color:'rgba(16,185,129,0.1)',border:'rgba(16,185,129,0.2)'},
              {icon:'📝',title:'Take a Test',desc:'Practice & improve',href:'/tests',color:'rgba(139,92,246,0.1)',border:'rgba(139,92,246,0.2)'},
            ].map(a=>(
              <Link key={a.title} href={a.href} style={{textDecoration:'none'}}>
                <div className="course-card" style={{background:a.color,border:`1px solid ${a.border}`,display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{fontSize:'32px'}}>{a.icon}</div>
                  <div>
                    <div style={{color:'#fff',fontWeight:'600',fontSize:'15px',marginBottom:'4px'}}>{a.title}</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>{a.desc}</div>
                  </div>
                  <span style={{marginLeft:'auto',color:'rgba(255,255,255,0.3)',fontSize:'20px'}}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div>
          <h2 style={{fontSize:'18px',fontWeight:'600',marginBottom:'16px'}}>Getting Started</h2>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'24px'}}>
            {[
              {step:'1',title:'Complete your profile',done:true},
              {step:'2',title:'Browse and enroll in a course',done:false},
              {step:'3',title:'Download your first PDF note',done:false},
              {step:'4',title:'Attempt your first mock test',done:false},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',padding:'14px 0',borderBottom:i<3?'1px solid rgba(255,255,255,0.05)':'none'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:s.done?'linear-gradient(135deg,#f59e0b,#d97706)':'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:s.done?'#000':'rgba(255,255,255,0.3)',flexShrink:0}}>
                  {s.done?'✓':s.step}
                </div>
                <span style={{color:s.done?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)',fontSize:'14px',textDecoration:s.done?'line-through':'none'}}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}