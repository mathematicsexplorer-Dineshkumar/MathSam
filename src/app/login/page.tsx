'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;}
        .input-field{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:14px 18px;border-radius:12px;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.3s;}
        .input-field:focus{border-color:#f59e0b;background:rgba(245,158,11,0.05);box-shadow:0 0 0 3px rgba(245,158,11,0.1);}
        .input-field::placeholder{color:rgba(255,255,255,0.25);}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;border:none;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;font-size:16px;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,158,11,0.4);}
        .btn-gold:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .left-panel{background:radial-gradient(ellipse at 30% 50%,rgba(234,179,8,0.15) 0%,transparent 70%),radial-gradient(ellipse at 80% 80%,rgba(59,130,246,0.1) 0%,transparent 50%),#0d0d14;border-right:1px solid rgba(255,255,255,0.06);}
        .feature-item{display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:12px;transition:all 0.3s;}
        .feature-item:hover{border-color:rgba(245,158,11,0.2);background:rgba(245,158,11,0.05);}
        .divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);}
      `}</style>

      {/* Left Panel */}
      <div className="left-panel" style={{flex:'1',padding:'60px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'60px',textDecoration:'none'}}>
          <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'24px',fontWeight:'700',color:'#fff'}}>MathSam</span>
        </Link>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'42px',fontWeight:'900',color:'#fff',lineHeight:'1.1',marginBottom:'16px'}}>
          Your <span className="gold-gradient">Math Journey</span><br/>Starts Here
        </h2>
        <p style={{color:'rgba(255,255,255,0.45)',fontSize:'15px',marginBottom:'48px',lineHeight:'1.7',fontWeight:'300'}}>
          Join 10,000+ students mastering mathematics for India's toughest exams
        </p>
        {[
          {icon:'🎥',t:'50+ Video Courses',d:'HD lectures by IIT/NIT experts'},
          {icon:'📄',t:'200+ PDF Notes',d:'Concise exam-ready material'},
          {icon:'📝',t:'Smart Test Series',d:'Instant results & analysis'},
        ].map(f=>(
          <div key={f.t} className="feature-item">
            <div style={{fontSize:'24px',width:'44px',height:'44px',background:'rgba(245,158,11,0.1)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{f.icon}</div>
            <div>
              <div style={{color:'#fff',fontWeight:'600',fontSize:'14px'}}>{f.t}</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{flex:'1',padding:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div style={{marginBottom:'40px'}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:'700',color:'#fff',marginBottom:'8px'}}>Welcome Back</h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'15px'}}>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:'13px',fontWeight:'500',marginBottom:'8px',letterSpacing:'0.5px'}}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>
            <div style={{marginBottom:'12px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:'13px',fontWeight:'500',marginBottom:'8px',letterSpacing:'0.5px'}}>PASSWORD</label>
              <div style={{position:'relative'}}>
                <input
                  type={showPass?'text':'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'18px'}}>
                  {showPass?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <div style={{textAlign:'right',marginBottom:'28px'}}>
              <Link href="/forgot-password" style={{color:'#f59e0b',fontSize:'13px',textDecoration:'none'}}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-gold" style={{width:'100%',padding:'15px',borderRadius:'12px'}}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider">
            <span style={{color:'rgba(255,255,255,0.25)',fontSize:'13px'}}>or</span>
          </div>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>
            Don't have an account?{' '}
            <Link href="/register" style={{color:'#f59e0b',fontWeight:'600',textDecoration:'none'}}>Create one free →</Link>
          </p>
          <p style={{textAlign:'center',marginTop:'16px'}}>
            <Link href="/" style={{color:'rgba(255,255,255,0.2)',fontSize:'13px',textDecoration:'none'}}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}