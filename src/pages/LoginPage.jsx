import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('tab') === 'register') setIsRegister(true)
    if (authService.isAuthenticated()) navigate('/dashboard')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await authService.register(form.username, form.email, form.password)
      } else {
        await authService.login(form.username, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка. Спробуй ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, color: '#58a6ff', marginBottom: 8 }}>⬡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>System Monitor</h1>
          <p style={{ color: '#8b949e', marginTop: 4 }}>
            {isRegister ? 'Створи акаунт' : 'Увійди в акаунт'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 16, padding: 32
        }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#0d1117',
            borderRadius: 10, padding: 4, marginBottom: 28
          }}>
            {['Вхід', 'Реєстрація'].map((tab, i) => (
              <button key={tab} onClick={() => { setIsRegister(i === 1); setError('') }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  background: isRegister === (i === 1) ? '#1f6feb' : 'transparent',
                  color: isRegister === (i === 1) ? '#fff' : '#8b949e',
                  fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
                  cursor: 'pointer', border: 'none'
                }}>
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#8b949e', display: 'block', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text" required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Введіть username"
                style={inputStyle}
              />
            </div>

            {/* Email — тільки для реєстрації */}
            {isRegister && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#8b949e', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Введіть email"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#8b949e', display: 'block', marginBottom: 6 }}>
                Пароль
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Введіть пароль"
                style={inputStyle}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#3d1a1a', border: '1px solid #f8514944',
                borderRadius: 8, padding: '10px 14px',
                color: '#f85149', fontSize: 13, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#1a3a6b' : '#1f6feb',
              color: '#fff', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', border: 'none'
            }}>
              {loading ? 'Завантаження...' : (isRegister ? 'Зареєструватись' : 'Увійти')}
            </button>
          </form>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'transparent', color: '#8b949e',
            fontSize: 14, border: 'none', cursor: 'pointer'
          }}>
            ← Повернутись на головну
          </button>
        </div>

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: '#0d1117', border: '1px solid #30363d',
  borderRadius: 8, color: '#f0f6fc', fontSize: 14,
  transition: 'border-color 0.2s'
}