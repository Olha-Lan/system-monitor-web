import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { authService } from '../services/api'

const features = [
  { icon: '⬡', title: 'Реальний моніторинг', desc: 'CPU, RAM, диск та мережа оновлюються кожні 10 секунд' },
  { icon: '◈', title: 'Хмарне зберігання', desc: 'Всі метрики зберігаються на сервері. Дивись історію за тиждень' },
  { icon: '◉', title: 'Доступ з телефону', desc: 'Перевіряй стан комп\'ютера з будь-якого пристрою через браузер' },
  { icon: '◎', title: 'Розумні алерти', desc: 'Сповіщення коли CPU або RAM перевищують критичні значення' }
]

const steps = [
  { num: '01', title: 'Скачай програму', desc: 'Завантаж SystemMonitor.exe і запусти на своєму комп\'ютері' },
  { num: '02', title: 'Зареєструйся', desc: 'Створи акаунт за 30 секунд — ім\'я, email і пароль' },
  { num: '03', title: 'Моніторь', desc: 'Відкрий сайт з будь-якого пристрою і дивись що відбувається' }
]

function AnimatedGrid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let mouse = { x: null, y: null }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      createParticles()
    }

    const createParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 8000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.3
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        if (mouse.x) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            p.x += dx / dist * 1.5
            p.y += dy / dist * 1.5
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(88, 166, 255, ${p.opacity})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(88, 166, 255, ${0.25 * (1 - dist / 140)})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const onMouseLeave = () => { mouse.x = null; mouse.y = null }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', resize)

    resize()
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%', opacity: 0.7
    }} />
  )
}

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

function RevealSection({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', overflowX: 'hidden' }}>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-text { animation: fadeIn 1s ease forwards; }
        .hero-sub { animation: fadeIn 1s ease 0.2s both; }
        .hero-btns { animation: fadeIn 1s ease 0.4s both; }
        .feature-card:hover { border-color: rgba(88,166,255,0.4) !important; transform: translateY(-4px); }
        .feature-card { transition: all 0.3s ease !important; }
        .nav-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid #21262d',
        position: 'sticky', top: 0,
        background: 'rgba(13,17,23,0.9)',
        backdropFilter: 'blur(12px)', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24, color: '#58a6ff' }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>System Monitor</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {authService.isAuthenticated() ? (
            <button className="nav-btn" onClick={() => navigate('/dashboard')} style={btnPrimary}>
              Відкрити дашборд
            </button>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigate('/login')} style={btnSecondary}>Увійти</button>
              <button className="nav-btn" onClick={() => navigate('/login?tab=register')} style={btnPrimary}>Реєстрація</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', textAlign: 'center',
        padding: '140px 24px 100px', overflow: 'hidden',
        minHeight: 700, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <AnimatedGrid />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(88,166,255,0.12) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 820 }}>
          <div className="hero-text" style={{
            display: 'inline-block',
            background: 'rgba(31,111,235,0.15)',
            border: '1px solid rgba(88,166,255,0.3)',
            borderRadius: 20, padding: '6px 16px',
            fontSize: 13, color: '#58a6ff', marginBottom: 32
          }}>
            ✦ Версія 1.0 — Безкоштовно для всіх
          </div>

          <h1 className="hero-text" style={{
            fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800,
            lineHeight: 1.05, marginBottom: 24, color: '#f0f6fc',
            letterSpacing: '-3px'
          }}>
            Моніторинг комп'ютера<br />
            <span style={{
              background: 'linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              з будь-якого місця
            </span>
          </h1>

          <p className="hero-sub" style={{
            fontSize: 20, color: '#8b949e',
            maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7
          }}>
            Легка програма яка збирає метрики твого комп'ютера і відправляє їх у хмару.
            Дивись CPU, RAM і диск з телефону або іншого комп'ютера.
          </p>

          <div className="hero-btns" style={{
            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <button style={{ ...btnPrimary, fontSize: 16, padding: '14px 32px' }}
              onClick={() => navigate('/login?tab=register')}>
              Почати безкоштовно →
            </button>
            <button style={{ ...btnSecondary, fontSize: 16, padding: '14px 32px' }}>
              Скачати .exe ↓
            </button>
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <RevealSection>
        <section style={{ padding: '0 48px 96px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            border: '1px solid #30363d', borderRadius: 16,
            overflow: 'hidden', background: '#161b22',
            boxShadow: '0 0 100px rgba(88,166,255,0.08)'
          }}>
            <div style={{
              background: '#0d1117', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid #30363d'
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: 12, fontSize: 12, color: '#8b949e' }}>
                System Monitor — Головна панель
              </span>
            </div>
            <img src="/screenshots/dashboard.png" alt="Dashboard"
              style={{ width: '100%', display: 'block' }} />
          </div>
        </section>
      </RevealSection>

      {/* Stats */}
      <RevealSection>
        <section style={{
          display: 'flex', justifyContent: 'center', gap: 64,
          padding: '48px 24px',
          borderTop: '1px solid #21262d', borderBottom: '1px solid #21262d',
          flexWrap: 'wrap'
        }}>
          {[
            ['CPU + RAM + Disk', 'Метрики в реальному часі'],
            ['10 сек', 'Інтервал оновлення'],
            ['168 год', 'Історія даних'],
            ['100%', 'Безкоштовно'],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 28, fontWeight: 700,
                background: 'linear-gradient(135deg, #58a6ff, #bc8cff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{val}</div>
              <div style={{ fontSize: 14, color: '#8b949e', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </section>
      </RevealSection>

      {/* Features */}
      <section style={{ padding: '96px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px' }}>
              Все що потрібно для моніторингу
            </h2>
            <p style={{ color: '#8b949e', marginTop: 12, fontSize: 18 }}>
              Простий інструмент з усіма необхідними функціями
            </p>
          </div>
        </RevealSection>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20
        }}>
          {features.map((f, i) => (
            <RevealSection key={f.title} delay={i * 0.1}>
              <div className="feature-card" style={{
                background: '#161b22', border: '1px solid #30363d',
                borderRadius: 16, padding: 28, height: '100%'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(88,166,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 16, color: '#58a6ff'
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Screenshots grid */}
      <RevealSection>
        <section style={{ padding: '0 48px 96px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px' }}>
              Скріншоти програми
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { src: '/screenshots/charts.png', label: 'Графіки та історія' },
              { src: '/screenshots/alerts.png', label: 'Алерти та сповіщення' },
            ].map(s => (
              <div key={s.label} style={{
                border: '1px solid #30363d', borderRadius: 12,
                overflow: 'hidden', background: '#161b22',
                transition: 'border-color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#58a6ff44'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
              >
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid #30363d',
                  fontSize: 12, color: '#8b949e'
                }}>{s.label}</div>
                <img src={s.src} alt={s.label} style={{ width: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* How it works */}
      <section style={{
        padding: '96px 48px', background: '#161b22',
        borderTop: '1px solid #21262d', borderBottom: '1px solid #21262d'
      }}>
        <RevealSection>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px' }}>
                Як це працює
              </h2>
              <p style={{ color: '#8b949e', marginTop: 12, fontSize: 18 }}>
                Три прості кроки щоб почати
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 40
            }}>
              {steps.map((s, i) => (
                <div key={s.num} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 60, fontWeight: 800,
                    background: 'linear-gradient(135deg, rgba(88,166,255,0.3), rgba(188,140,255,0.3))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: 16, letterSpacing: '-3px', lineHeight: 1
                  }}>{s.num}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* CTA */}
      <RevealSection>
        <section style={{
          padding: '120px 24px', textAlign: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700, height: 400, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(88,166,255,0.07) 0%, transparent 70%)',
            pointerEvents: 'none', animation: 'pulse 5s ease-in-out infinite'
          }} />
          <h2 style={{
            fontSize: 52, fontWeight: 800, marginBottom: 20, letterSpacing: '-2px',
            position: 'relative', zIndex: 2
          }}>
            Готовий спробувати?
          </h2>
          <p style={{
            color: '#8b949e', fontSize: 18, marginBottom: 40,
            position: 'relative', zIndex: 2
          }}>
            Безкоштовно. Без кредитної картки. Займає 2 хвилини.
          </p>
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            flexWrap: 'wrap', position: 'relative', zIndex: 2
          }}>
            <button style={{ ...btnPrimary, fontSize: 18, padding: '16px 40px' }}
              onClick={() => navigate('/login?tab=register')}>
              Зареєструватись безкоштовно →
            </button>
            <button style={{ ...btnSecondary, fontSize: 16, padding: '14px 28px' }}>
              Скачати .exe ↓
            </button>
          </div>
        </section>
      </RevealSection>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #21262d', padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', color: '#8b949e', fontSize: 14,
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#58a6ff' }}>⬡</span>
          <span>System Monitor © 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span>Автор: Оля Ланевич</span>
          <span style={{ color: '#30363d' }}>|</span>
          <span>Дипломна робота 2026</span>
        </div>
      </footer>

    </div>
  )
}

const btnPrimary = {
  background: '#1f6feb', color: '#fff',
  padding: '10px 20px', borderRadius: 8,
  fontSize: 14, fontWeight: 600,
  cursor: 'pointer', border: 'none'
}

const btnSecondary = {
  background: 'transparent', color: '#f0f6fc',
  padding: '10px 20px', borderRadius: 8,
  fontSize: 14, fontWeight: 500,
  border: '1px solid #30363d', cursor: 'pointer'
}