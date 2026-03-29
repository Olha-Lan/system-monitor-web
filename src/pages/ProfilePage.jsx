import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import api from '../services/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [usernameMsg, setUsernameMsg] = useState({ text: '', ok: false })
  const [emailMsg, setEmailMsg] = useState({ text: '', ok: false })
  const [passwordMsg, setPasswordMsg] = useState({ text: '', ok: false })

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setUser(r.data)
      setLoading(false)
    }).catch(() => {
      authService.logout()
      navigate('/login')
    })
  }, [navigate])

  const updateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameMsg({ text: '⚠ Мінімум 3 символи', ok: false })
      return
    }
    try {
      await api.put('/auth/profile/username', { newUsername })
      setUser(u => ({ ...u, username: newUsername }))
      setNewUsername('')
      setUsernameMsg({ text: '✓ Ім\'я змінено!', ok: true })
      setTimeout(() => setUsernameMsg({ text: '', ok: false }), 3000)
    } catch (e) {
      setUsernameMsg({ text: '⚠ ' + (e.response?.data?.message || 'Помилка'), ok: false })
    }
  }

  const updateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setEmailMsg({ text: '⚠ Невірний email', ok: false })
      return
    }
    try {
      await api.put('/auth/profile/email', { newEmail })
      setUser(u => ({ ...u, email: newEmail }))
      setNewEmail('')
      setEmailMsg({ text: '✓ Email змінено!', ok: true })
      setTimeout(() => setEmailMsg({ text: '', ok: false }), 3000)
    } catch (e) {
      setEmailMsg({ text: '⚠ ' + (e.response?.data?.message || 'Помилка'), ok: false })
    }
  }

  const updatePassword = async () => {
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: '⚠ Мінімум 6 символів для нового пароля', ok: false })
      return
    }
    try {
      await api.put('/auth/profile/password', { oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setPasswordMsg({ text: '✓ Пароль змінено!', ok: true })
      setTimeout(() => setPasswordMsg({ text: '', ok: false }), 3000)
    } catch (e) {
      setPasswordMsg({ text: '⚠ ' + (e.response?.data?.message || 'Помилка'), ok: false })
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#8b949e' }}>Завантаження...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid #21262d',
        position: 'sticky', top: 0, background: '#0d1117', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, color: '#58a6ff' }}>⬡</span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>System Monitor</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'transparent', border: '1px solid #30363d',
            color: '#8b949e', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>← Дашборд</button>
          <button onClick={() => authService.logout()} style={{
            background: 'transparent', border: '1px solid #30363d',
            color: '#f85149', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>Вийти</button>
        </div>
      </nav>

      <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>

        {/* Avatar + Info */}
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 16, padding: 32, marginBottom: 24, textAlign: 'center'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #58a6ff, #bc8cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, margin: '0 auto 16px'
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{user.username}</div>
          <div style={{ color: '#8b949e', marginBottom: 8 }}>{user.email}</div>
          <div style={{
            display: 'inline-block', background: 'rgba(63,185,80,0.1)',
            border: '1px solid rgba(63,185,80,0.3)',
            color: '#3fb950', padding: '2px 12px', borderRadius: 20, fontSize: 12
          }}>{user.role}</div>
          {user.createdAt && (
            <div style={{ color: '#8b949e', fontSize: 12, marginTop: 8 }}>
              Зареєстрований: {new Date(user.createdAt).toLocaleDateString('uk')}
            </div>
          )}
        </div>

        {/* Username */}
        <Section title="Змінити ім'я користувача">
          <Input placeholder="Нове ім'я" value={newUsername} onChange={setNewUsername} />
          {usernameMsg.text && <Msg text={usernameMsg.text} ok={usernameMsg.ok} />}
          <Btn text="Зберегти ім'я" onClick={updateUsername} />
        </Section>

        {/* Email */}
        <Section title="Змінити електронну пошту">
          <Input placeholder="Новий email" value={newEmail} onChange={setNewEmail} type="email" />
          {emailMsg.text && <Msg text={emailMsg.text} ok={emailMsg.ok} />}
          <Btn text="Зберегти email" onClick={updateEmail} />
        </Section>

        {/* Password */}
        <Section title="Змінити пароль">
          <Input placeholder="Поточний пароль" value={oldPassword} onChange={setOldPassword} type="password" />
          <Input placeholder="Новий пароль (мін. 6 символів)" value={newPassword} onChange={setNewPassword} type="password" />
          {passwordMsg.text && <Msg text={passwordMsg.text} ok={passwordMsg.ok} />}
          <Btn text="Змінити пароль" onClick={updatePassword} />
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d',
      borderRadius: 16, padding: 24, marginBottom: 20
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#8b949e' }}>{title}</h3>
      {children}
    </div>
  )
}

function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        background: '#0d1117', border: '1px solid #30363d',
        color: '#f0f6fc', fontSize: 14, marginBottom: 8,
        boxSizing: 'border-box', outline: 'none'
      }}
    />
  )
}

function Btn({ text, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: '#1f6feb', color: '#fff',
      padding: '10px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 600,
      cursor: 'pointer', border: 'none', width: '100%'
    }}>{text}</button>
  )
}

function Msg({ text, ok }) {
  return (
    <div style={{
      color: ok ? '#3fb950' : '#f85149',
      fontSize: 13, marginBottom: 8
    }}>{text}</div>
  )
}