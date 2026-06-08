'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'dk9785562756@gmail.com' // 👈 CHANGE THIS to your email!

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        toast.error('Access denied!')
        router.push('/')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>Loading admin panel...</p>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sidebar{background:#080810;border-right:1px solid rgba(255,255,255,0.06);width:240px;min-height:100vh;position:fixed;top:0;left:0;}
        .main{margin-left:240px;min-height:100vh;}
        .admin-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;transition:all 0.3s;cursor:pointer;text-decoration:none;display:block;color:#fff;}
        .admin-card:hover{transform:translateY(-4px);border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.05);}
        .nav-item{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:10px;cursor:pointer;transition:all 0.2s;text-decoration:none;color:rgba(255,255,255,0.5);font-size:14px;font-weight:500;margin-bottom:4px;}
        .nav-item:hover{background:rgba(245,158,11,0.08);color:#f59e0b;}
        .stat-mini{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;text-align:center;}
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{display:'flex',flexDirection:'column',padding:'24px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'32px',padding:'0 8px'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📐</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'18px',fontWeight:'700',color:'#fff'}}>MathSam</div>
            <div style={{fontSize:'10px',color:'#f59e0b',fontWeight:'600',letterSpacing:'1px'}}>ADMIN PANEL</div>
          </div>
        </div>

        <div style={{padding:'12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',marginBottom:'24px'}}>
          <div style={{fontSize:'11px',color:'rgba(239,68,68,0.8)',fontWeight:'600',letterSpacing:'1px',marginBottom:'4px'}}>ADMIN ACCESS</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,0.6)'}}>{user?.email}</div>
        </div>

        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontWeight:'600',letterSpacing:'2px',marginBottom:'10px',paddingLeft:'8px'}}>MANAGE</div>
        {[
          {icon:'📊',label:'Dashboard',href:'/admin'},
          {icon:'🎥',label:'Courses',href:'/admin/courses'},
          {icon:'📄',label:'PDF Notes',href:'/admin/pdfs'},
          {icon:'📝',label:'Test Series',href:'/admin/tests'},
          {icon:'👥',label:'Students',href:'/admin/students'},
          {icon:'💰',label:'Orders',href:'/admin/orders'},
        ].map(item=>(
          <Link key={item.label} href={item.href} className="nav-item">
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}

        <div style={{flex:1}}/>
        <Link href="/" className="nav-item" style={{color:'rgba(255,255,255,0.3)'}}>
          🌐 View Live Site
        </Link>
      </div>

      {/* Main */}
      <div className="main" style={{padding:'40px 48px',background:'radial-gradient(ellipse at 90% 10%,rgba(245,158,11,0.05) 0%,transparent 50%),#0a0a0f'}}>
        <div style={{marginBottom:'36px'}}>
          <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',marginBottom:'6px'}}>Admin Panel</p>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'38px',fontWeight:'700'}}>
            Control <span className="gold-gradient">Center</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',marginTop:'6px',fontSize:'14px'}}>Manage all content and monitor platform performance</p>
        </div>

        {/* Mini Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'36px'}}>
          {[
            {icon:'👥',label:'Total Students',val:'0'},
            {icon:'🎥',label:'Courses',val:'0'},
            {icon:'📄',label:'PDF Notes',val:'0'},
            {icon:'💰',label:'Revenue',val:'₹0'},
          ].map(s=>(
            <div key={s.label} className="stat-mini">
              <div style={{fontSize:'26px',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'28px',fontWeight:'700',color:'#f59e0b',marginBottom:'4px'}}>{s.val}</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Management Cards */}
        <h2 style={{fontSize:'18px',fontWeight:'600',marginBottom:'16px'}}>Quick Management</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px',marginBottom:'36px'}}>
          {[
            {icon:'🎥',title:'Manage Courses',desc:'Add, edit, publish or delete video courses',href:'/admin/courses',color:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.15)',accent:'#f59e0b',action:'Add New Course'},
            {icon:'📄',title:'Manage PDF Notes',desc:'Upload study material, set prices, manage files',href:'/admin/pdfs',color:'rgba(16,185,129,0.08)',border:'rgba(16,185,129,0.15)',accent:'#10b981',action:'Upload PDF'},
            {icon:'📝',title:'Test Series',desc:'Create tests, add questions, set difficulty',href:'/admin/tests',color:'rgba(139,92,246,0.08)',border:'rgba(139,92,246,0.15)',accent:'#8b5cf6',action:'Create Test'},
            {icon:'👥',title:'Student Management',desc:'View registrations, purchases, activity logs',href:'/admin/students',color:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.15)',accent:'#3b82f6',action:'View Students'},
          ].map(c=>(
            <Link key={c.title} href={c.href} className="admin-card" style={{background:c.color,border:`1px solid ${c.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                <div style={{fontSize:'40px'}}>{c.icon}</div>
                <span style={{fontSize:'12px',background:`rgba(255,255,255,0.08)`,border:'1px solid rgba(255,255,255,0.12)',padding:'4px 12px',borderRadius:'20px',color:'rgba(255,255,255,0.5)'}}>{c.action} →</span>
              </div>
              <h3 style={{fontSize:'18px',fontWeight:'700',marginBottom:'8px'}}>{c.title}</h3>
              <p style={{fontSize:'14px',color:'rgba(255,255,255,0.45)',lineHeight:'1.5'}}>{c.desc}</p>
              <div style={{marginTop:'16px',height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}>
                <div style={{height:'100%',width:'0%',background:`linear-gradient(90deg,${c.accent},transparent)`,borderRadius:'2px'}}/>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 style={{fontSize:'18px',fontWeight:'600',marginBottom:'16px'}}>Recent Activity</h2>
        <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'24px'}}>
          <div style={{textAlign:'center',padding:'30px 0',color:'rgba(255,255,255,0.25)',fontSize:'14px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📊</div>
            No activity yet. Start by adding courses and PDFs!
          </div>
        </div>
      </div>
    </div>
  )
}