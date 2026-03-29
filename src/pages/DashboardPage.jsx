import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { metricsService, authService } from '../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(24)
  const [activeChart, setActiveChart] = useState('cpu')
  const username = authService.getUsername()

  const loadMetrics = useCallback(async () => {
    try {
      const data = await metricsService.getMyMetrics(hours)
      setMetrics(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [hours])

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [loadMetrics])

  const latest = metrics[0]

  const chartData = [...metrics].reverse().slice(-100).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString('uk', {
      hour: '2-digit', minute: '2-digit'
    }),
    cpu: Number(m.cpuUsagePercent?.toFixed(1)),
    ram: Number(m.memoryUsagePercent?.toFixed(1)),
    disk: Number(m.diskUsagePercent?.toFixed(1))
  }))

  const chartConfig = {
    cpu: { key: 'cpu', color: '#58a6ff', label: 'CPU %' },
    ram: { key: 'ram', color: '#bc8cff', label: 'RAM %' },
    disk: { key: 'disk', color: '#e3b341', label: 'Disk %' }
  }

  const getStatus = (val) => {
    if (val > 90) return '#f85149'
    if (val > 75) return '#e3b341'
    return '#3fb950'
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#8b949e', fontSize: 14 }}>Привіт, {username}</span>
          <button onClick={() => navigate('/profile')} style={{
            background: 'transparent', border: '1px solid #30363d',
            color: '#8b949e', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>👤 Профіль</button>
          <button onClick={() => authService.logout()} style={{
            background: 'transparent', border: '1px solid #30363d',
            color: '#f85149', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>Вийти</button>
        </div>
      </nav>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Мій комп'ютер</h1>
            <p style={{ color: '#8b949e', marginTop: 4 }}>
              {latest ? `Останнє оновлення: ${new Date(latest.timestamp).toLocaleString('uk')}` : 'Завантаження...'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 6, 24, 72, 168].map(h => (
              <button key={h} onClick={() => setHours(h)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                background: hours === h ? '#1f6feb' : '#161b22',
                color: hours === h ? '#fff' : '#8b949e',
                border: '1px solid #30363d', cursor: 'pointer'
              }}>
                {h}г
              </button>
            ))}
            <button onClick={loadMetrics} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13,
              background: '#161b22', color: '#58a6ff',
              border: '1px solid #30363d', cursor: 'pointer'
            }}>↻</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: 80 }}>
            Завантаження даних...
          </div>
        ) : !latest ? (
          <div style={{
            textAlign: 'center', color: '#8b949e', padding: 80,
            background: '#161b22', borderRadius: 16, border: '1px solid #30363d'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⬡</div>
            <p>Немає даних. Запусти SystemMonitor.exe на своєму комп'ютері</p>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16, marginBottom: 24
            }}>
              {[
                { label: 'CPU', value: `${latest.cpuUsagePercent?.toFixed(1)}%`, color: '#58a6ff' },
                { label: 'RAM', value: `${latest.memoryUsagePercent?.toFixed(1)}%`, color: '#bc8cff' },
                { label: 'Диск', value: `${latest.diskUsagePercent?.toFixed(1)}%`, color: '#e3b341' },
                { label: 'Процеси', value: latest.activeProcessCount, color: '#3fb950' },
              ].map(card => (
                <div key={card.label} style={{
                  background: '#161b22', border: '1px solid #30363d',
                  borderRadius: 16, padding: '20px 24px'
                }}>
                  <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>
                    {card.value}
                  </div>
                  {card.label !== 'Процеси' && (
                    <div style={{
                      marginTop: 12, height: 4, background: '#21262d',
                      borderRadius: 2, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${parseFloat(card.value)}%`,
                        background: getStatus(parseFloat(card.value)),
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RAM details */}
            <div style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: 16, padding: '20px 24px', marginBottom: 24,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16
            }}>
              {[
                { label: 'Всього RAM', value: `${(latest.totalMemoryMb / 1024).toFixed(1)} GB` },
                { label: 'Використано', value: `${(latest.usedMemoryMb / 1024).toFixed(1)} GB` },
                { label: 'Вільно', value: `${(latest.freeMemoryMb / 1024).toFixed(1)} GB` },
                { label: 'Диск всього', value: `${latest.diskTotalGb?.toFixed(0)} GB` },
                { label: 'Диск вільно', value: `${latest.diskFreeGb?.toFixed(0)} GB` },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: 16, padding: 24, marginBottom: 24
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Графік</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(chartConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setActiveChart(key)} style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13,
                      background: activeChart === key ? cfg.color + '22' : 'transparent',
                      color: activeChart === key ? cfg.color : '#8b949e',
                      border: `1px solid ${activeChart === key ? cfg.color + '44' : '#30363d'}`,
                      cursor: 'pointer'
                    }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" fontSize={11}
                      tick={{ fill: '#8b949e' }} />
                    <YAxis stroke="#8b949e" fontSize={11}
                      tick={{ fill: '#8b949e' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{
                      background: '#161b22', border: '1px solid #30363d',
                      borderRadius: 8, color: '#f0f6fc'
                    }} />
                    <Line
                      type="monotone"
                      dataKey={chartConfig[activeChart].key}
                      stroke={chartConfig[activeChart].color}
                      strokeWidth={2} dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#8b949e', padding: 40 }}>
                  Недостатньо даних для графіку
                </div>
              )}
            </div>

            {/* Stats */}
            {metrics.length > 0 && (() => {
              const cpuVals = metrics.map(m => m.cpuUsagePercent)
              const ramVals = metrics.map(m => m.memoryUsagePercent)
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16
                }}>
                  {[
                    { label: 'CPU середнє', value: `${(cpuVals.reduce((a, b) => a + b, 0) / cpuVals.length).toFixed(1)}%` },
                    { label: 'CPU максимум', value: `${Math.max(...cpuVals).toFixed(1)}%` },
                    { label: 'RAM середнє', value: `${(ramVals.reduce((a, b) => a + b, 0) / ramVals.length).toFixed(1)}%` },
                    { label: 'RAM максимум', value: `${Math.max(...ramVals).toFixed(1)}%` },
                    { label: 'Записів в БД', value: metrics.length },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: '#161b22', border: '1px solid #30363d',
                      borderRadius: 12, padding: '16px 20px'
                    }}>
                      <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6 }}>{stat.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#58a6ff' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
