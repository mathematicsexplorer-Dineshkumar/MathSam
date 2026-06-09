'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to verify.')
      router.push('/login')
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
        .left-panel{background:radial-gradient(ellipse at 30% 50%,rgba(234,179,8,0.15) 0%,transparent 70%),#0d0d14;border-right:1px solid rgba(255,255,255,0.06);}
        .perk{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
      `}</style>

      {/* Left Panel */}
      <div className="left-panel" style={{flex:'1',padding:'60px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'60px',textDecoration:'none'}}>
          <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'24px',fontWeight:'700',color:'#fff'}}>MathSamiksha</span>
        </Link>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'42px',fontWeight:'900',color:'#fff',lineHeight:'1.1',marginBottom:'16px'}}>
          Start Your <span className="gold-gradient">Free</span><br/>Learning Journey
        </h2>
        <p style={{color:'rgba(255,255,255,0.45)',fontSize:'15px',marginBottom:'40px',lineHeight:'1.7',fontWeight:'300'}}>
          Get instant access to courses, PDFs and test series
        </p>
        {[
          {icon:'✅',t:'Free account — no credit card needed'},
          {icon:'🎥',t:'Access to free preview lectures'},
          {icon:'📝',t:'Free sample test series'},
          {icon:'📧',t:'Weekly exam tips & tricks'},
          {icon:'🏆',t:'Performance tracking dashboard'},
        ].map(p=>(
          <div key={p.t} className="perk">
            <span style={{fontSize:'18px'}}>{p.icon}</span>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:'14px'}}>{p.t}</span>
          </div>
        ))}

        <div style={{marginTop:'40px',padding:'20px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px'}}>
          <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
            <div style={{fontSize:'28px'}}>💬</div>
            <div>
              <p style={{color:'rgba(255,255,255,0.7)',fontSize:'14px',fontStyle:'italic',lineHeight:'1.6',marginBottom:'8px'}}>"MathSamiksha helped me crack JEE with a 97 percentile in Mathematics!"</p>
              <p style={{color:'#f59e0b',fontSize:'13px',fontWeight:'600'}}>— Rahul S., IIT Delhi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{flex:'1',padding:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div style={{marginBottom:'36px'}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:'700',color:'#fff',marginBottom:'8px'}}>Create Account</h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'15px'}}>It's free — takes less than a minute</p>
          </div>

          <form onSubmit={handleRegister}>
            <div style={{marginBottom:'18px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:'13px',fontWeight:'500',marginBottom:'8px',letterSpacing:'0.5px'}}>FULL NAME</label>
              <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="input-field" placeholder="Rahul Sharma" required />
            </div>
            <div style={{marginBottom:'18px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:'13px',fontWeight:'500',marginBottom:'8px',letterSpacing:'0.5px'}}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
            </div>
            <div style={{marginBottom:'28px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:'13px',fontWeight:'500',marginBottom:'8px',letterSpacing:'0.5px'}}>PASSWORD</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" minLength={6} required />
            </div>
            <button type="submit" disabled={loading} className="btn-gold" style={{width:'100%',padding:'15px',borderRadius:'12px'}}>
              {loading ? '⏳ Creating account...' : 'Create Free Account →'}
            </button>
          </form>

          <p style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',textAlign:'center',margin:'16px 0'}}>
            By registering, you agree to our Terms of Service & Privacy Policy
          </p>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>
            Already have an account?{' '}
            <Link href="/login" style={{color:'#f59e0b',fontWeight:'600',textDecoration:'none'}}>Sign in →</Link>
          </p>
          <p style={{textAlign:'center',marginTop:'12px'}}>
            <Link href="/" style={{color:'rgba(255,255,255,0.2)',fontSize:'13px',textDecoration:'none'}}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}