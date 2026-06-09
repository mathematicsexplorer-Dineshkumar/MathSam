import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{background:'#0a0a0f', color:'#fff', minHeight:'100vh'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;} body{margin:0;font-family:'DM Sans',sans-serif;background:#0a0a0f;}
        .gold-gradient{background:linear-gradient(135deg,#f59e0b,#fbbf24,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .nav-glass{background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(245,158,11,0.1);}
        .btn-gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,158,11,0.4);}
        .btn-outline{background:transparent;border:1px solid rgba(245,158,11,0.5);color:#f59e0b;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .btn-outline:hover{background:rgba(245,158,11,0.1);border-color:#f59e0b;}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s;}
        .card:hover{background:rgba(255,255,255,0.06);border-color:rgba(245,158,11,0.3);transform:translateY(-4px);}
        .exam-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);transition:all 0.3s;cursor:pointer;}
        .exam-pill:hover{background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.4);color:#f59e0b;}
        .nav-link{color:rgba(255,255,255,0.7);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;letter-spacing:0.5px;}
        .nav-link:hover{color:#f59e0b;}
        .label{color:#f59e0b;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;}
        .float{animation:float 6s ease-in-out infinite;}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        .hero-bg{background:radial-gradient(ellipse at 20% 50%,rgba(234,179,8,0.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(59,130,246,0.1) 0%,transparent 50%),#0a0a0f;}
        .dots{background-image:radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px);background-size:30px 30px;}
      `}</style>

      {/* Navbar */}
      <nav className="nav-glass" style={{position:'fixed',top:0,left:0,right:0,zIndex:50,padding:'0 60px',height:'70px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>📐</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'22px',fontWeight:'700',letterSpacing:'0.5px'}}>MathSamiksha</span>
        </div>
        <div style={{display:'flex',gap:'32px',alignItems:'center'}}>
          <Link href="/courses" className="nav-link">Courses</Link>
          <Link href="/pdfs" className="nav-link">PDF Notes & Ebooks</Link>
          <Link href="/tests" className="nav-link">Test Series</Link>
          <Link href="/login" className="btn-outline" style={{padding:'8px 22px',borderRadius:'8px',fontSize:'14px',fontWeight:'600'}}>Login</Link>
          <Link href="/register" className="btn-gold" style={{padding:'8px 22px',borderRadius:'8px',fontSize:'14px'}}>Start Free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg dots" style={{paddingTop:'130px',paddingBottom:'80px',padding:'130px 60px 80px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center'}}>
          <div>
            <div className="label" style={{marginBottom:'20px'}}> Math Learning Platform</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'68px',fontWeight:'900',lineHeight:'1.05',marginBottom:'20px'}}>
              Explore <br/><span className="gold-gradient">Mathematics</span><br/> -Language Of Universe
            </h1>
            <p style={{fontSize:'17px',color:'rgba(255,255,255,0.55)',lineHeight:'1.7',marginBottom:'12px',fontWeight:'300'}}>
              IIT JAM • CSIR NET • GATE • NBHM • CMI • Other Exams
            </p>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.35)',marginBottom:'36px'}}>
              Expert-crafted courses, concise PDF notes & smart test series
            </p>
            <div style={{display:'flex',gap:'16px',marginBottom:'48px'}}>
              <Link href="/courses" className="btn-gold" style={{padding:'14px 32px',borderRadius:'12px',fontSize:'16px'}}>Explore Courses →</Link>
              <Link href="/register" className="btn-outline" style={{padding:'14px 32px',borderRadius:'12px',fontSize:'16px'}}>Join Free</Link>
            </div>
            <div style={{display:'flex',gap:'40px'}}>
              {[['00+','Students'],['00+','Courses'],['00+','PDFs'],['4.9★','Rating']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'26px',fontWeight:'700',color:'#f59e0b'}}>{n}</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="float" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {[
              {icon:'🎥',title:'Video Courses',desc:'Best lectures by Experienced faculty',tag:'Most Popular'},
              {icon:'📄',title:'PDF Notes',desc:'Concise exam-ready study material',tag:'500+ pages'},
              {icon:'📝',title:'Test Series',desc:'Timed tests with instant analytics',tag:'New'},
            ].map(f=>(
              <div key={f.title} className="card" style={{borderRadius:'16px',padding:'20px 24px',display:'flex',gap:'16px',alignItems:'center'}}>
                <div style={{width:'50px',height:'50px',background:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05))',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>{f.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'15px',fontWeight:'600',marginBottom:'3px'}}>{f.title}</div>
                  <div style={{fontSize:'13px',color:'rgba(255,255,255,0.45)'}}>{f.desc}</div>
                </div>
                <span style={{fontSize:'11px',background:'rgba(245,158,11,0.15)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)',padding:'3px 10px',borderRadius:'20px',whiteSpace:'nowrap'}}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams */}
      <section style={{padding:'70px 60px',background:'rgba(255,255,255,0.01)',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',textAlign:'center'}}>
          <div className="label" style={{marginBottom:'14px'}}>Exams We Cover</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'38px',marginBottom:'36px'}}>Your Dream Exam, Our Expertise</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:'10px',justifyContent:'center'}}>
            {['IIT JAM','CSIR NET','GATE','TIFR GS','NBHM','CMI','Many more Batches Coming Soon'].map(e=>(
              <span key={e} className="exam-pill" style={{padding:'9px 18px',borderRadius:'50px',fontSize:'14px',fontWeight:'500'}}>{e}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'70px 60px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'50px'}}>
          <div className="label" style={{marginBottom:'14px'}}>Why MathSamiksha</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'38px'}}>Everything You Need to Excel</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
          {[
            {icon:'🎯',t:'Exam-Focused',d:'Content curated specifically for  competitive exams'},
            {icon:'👨‍🏫',t:'Expert Faculty',d:'Taught by Best Faculty and  Experienced Teachers'},
            {icon:'📊',t:'Smart Analytics',d:'Track progress, identify weak areas, improve faster'},
            {icon:'📱',t:'Mobile Ready',d:'Study anywhere, anytime on any device'},
            {icon:'🏆',t:'Proven Results',d:'95% of our students improve their scores significantly'},
          ].map(f=>(
            <div key={f.t} className="card" style={{borderRadius:'16px',padding:'28px'}}>
              <div style={{fontSize:'34px',marginBottom:'14px'}}>{f.icon}</div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'8px'}}>{f.t}</h3>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.45)',lineHeight:'1.6'}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 60px',textAlign:'center',background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.02))',borderTop:'1px solid rgba(245,158,11,0.15)',borderBottom:'1px solid rgba(245,158,11,0.15)'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'44px',marginBottom:'14px'}}>Ready to <span className="gold-gradient">Ace Your Exam?</span></h2>
        <p style={{color:'rgba(255,255,255,0.45)',marginBottom:'30px',fontSize:'16px'}}>Join 10,000+ students already learning on MathSamiksha</p>
        <Link href="/register" className="btn-gold" style={{padding:'16px 48px',borderRadius:'12px',fontSize:'17px'}}>Start Learning Free →</Link>
      </section>

      {/* Footer */}
      <footer style={{padding:'50px 60px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'22px',fontWeight:'700',marginBottom:'6px'}}>ॐ MathSamiksha</div>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>India's #1 Online Math Learning Platform</p>
          </div>
          <div style={{display:'flex',gap:'28px'}}>
            {['Courses','PDFs','Tests','Login'].map(l=>(
              <Link key={l} href={`/${l.toLowerCase()}`} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:'14px'}}>{l}</Link>
            ))}
          </div>
          <p style={{color:'rgba(255,255,255,0.2)',fontSize:'12px'}}>© 2026 MathSamiksha. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}