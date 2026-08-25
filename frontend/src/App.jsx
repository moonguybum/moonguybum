import { useCallback, useEffect, useState } from 'react'
import {
  Settings,
  LayoutGrid,
  Trophy,
  Users,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  Swords,
  Crown,
  ArrowUpDown,
  UserCheck,
  Medal,
  Calendar,
  Star,
} from 'lucide-react'

const API = '/api'

const MODE_OPTIONS = [
  {
    value: 'INDIVIDUAL',
    label: '개인 교대 순환전',
    icon: UserCheck,
    desc: '파트너 교대 · 1+4 vs 2+3 밸런스 · 상위 4경기 득실',
  },
  {
    value: 'THREE_KINGDOMS',
    label: '삼국지 3팀 단체전',
    icon: Swords,
    desc: 'A/B/C 팀 균등 분할 · 팀 대 팀 로테이션',
  },
  {
    value: 'UP_DOWN',
    label: '승급/강등전',
    icon: ArrowUpDown,
    desc: '1·2코트 승급/강등 · 코트별 현황',
  },
  {
    value: 'FIXED_TEAM',
    label: '고정 파트너 리그전',
    icon: Crown,
    desc: '상위+하위 페어링 · 팀 단위 대진/순위',
  },
]

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '요청 실패')
  }
  return res.json()
}

function ModeBadge({ mode }) {
  const opt = MODE_OPTIONS.find((m) => m.value === mode)
  if (!opt) return null
  const Icon = opt.icon
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-court-green/10 text-court-green px-2 py-0.5 rounded-full">
      <Icon size={12} />
      {opt.label}
    </span>
  )
}

function SettingsTab({
  settings,
  players,
  onSettingsChange,
  onPlayersChange,
  onGenerate,
  loading,
}) {
  const [newName, setNewName] = useState('')
  const [newRank, setNewRank] = useState(1)

  const addPlayer = async () => {
    if (!newName.trim()) return
    await api('/players', {
      method: 'POST',
      body: JSON.stringify({ name: newName.trim(), skill_rank: Number(newRank) }),
    })
    setNewName('')
    onPlayersChange()
  }

  const seedPlayers = async () => {
    await api('/players/seed', { method: 'POST' })
    onPlayersChange()
  }

  const deletePlayer = async (id) => {
    await api(`/players/${id}`, { method: 'DELETE' })
    onPlayersChange()
  }

  const handleModeChange = async (mode) => {
    await api('/settings', {
      method: 'PUT',
      body: JSON.stringify({ mode }),
    })
    onSettingsChange()
  }

  const handleCourtsChange = async (courts) => {
    await api('/settings', {
      method: 'PUT',
      body: JSON.stringify({ courts: Number(courts) }),
    })
    onSettingsChange()
  }

  return (
    <div className="space-y-4 pb-4">
      <section className="card">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          경기 방식 선택
        </h2>
        <div className="relative">
          <select
            value={settings.mode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-court-green/30"
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
        </div>
        {MODE_OPTIONS.filter((m) => m.value === settings.mode).map((m) => (
          <p key={m.value} className="mt-2 text-sm text-slate-500">{m.desc}</p>
        ))}

        <div className="mt-4">
          <label className="text-sm font-medium text-slate-600">코트 수</label>
          <select
            value={settings.courts}
            onChange={(e) => handleCourtsChange(e.target.value)}
            className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-court-green/30"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}코트</option>
            ))}
          </select>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Users size={16} /> 참가자 ({players.length})
          </h2>
          <button
            type="button"
            onClick={seedPlayers}
            className="text-xs text-court-green font-medium"
          >
            데모 8명
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-court-green/30"
          />
          <input
            type="number"
            min={1}
            max={99}
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="w-16 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-sm text-center focus:outline-none"
            title="실력 순위 (1=최상위)"
          />
          <button type="button" onClick={addPlayer} className="btn-secondary p-2.5">
            <Plus size={20} />
          </button>
        </div>

        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl"
            >
              <div>
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-slate-400 ml-2">순위 {p.skill_rank}</span>
                {p.team && (
                  <span className="text-xs ml-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    {p.team}팀
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => deletePlayer(p.id)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">참가자를 추가하세요</p>
          )}
        </ul>
      </section>

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || players.length < 4}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        대진 생성 / 재생성
      </button>
      {players.length < 4 && (
        <p className="text-center text-xs text-amber-600">대진 생성에는 최소 4명이 필요합니다</p>
      )}
    </div>
  )
}

function ScoreInput({ match, onSubmit }) {
  const [sa, setSa] = useState(match.score_a ?? '')
  const [sb, setSb] = useState(match.score_b ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api(`/matches/${match.id}/result`, {
        method: 'POST',
        body: JSON.stringify({ score_a: Number(sa), score_b: Number(sb) }),
      })
      onSubmit()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (match.status === 'completed') {
    return (
      <div className="text-center font-bold text-lg text-court-green py-2">
        {match.score_a} : {match.score_b}
      </div>
    )
  }

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl">
      <p className="text-xs text-center text-slate-400 mb-2">스코어 입력</p>
      <div className="flex items-center justify-center gap-3">
        <input
          type="number"
          min={0}
          placeholder="0"
          value={sa}
          onChange={(e) => setSa(e.target.value)}
          className="w-20 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-xl py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-court-green/40"
        />
        <span className="text-slate-400 font-bold text-xl">:</span>
        <input
          type="number"
          min={0}
          placeholder="0"
          value={sb}
          onChange={(e) => setSb(e.target.value)}
          className="w-20 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-xl py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-court-green/40"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={saving || sa === '' || sb === ''}
        className="btn-primary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : null}
        {saving ? '저장 중...' : '결과 저장'}
      </button>
    </div>
  )
}

function IndividualMatchTab({ matches, onRefresh }) {
  return (
    <div className="space-y-3 pb-4">
      <p className="text-sm text-slate-500 px-1">
        1+4 vs 2+3 실력 밸런스 · 5경기 이상 시 최저 1경기 제외 후 상위 4경기 득실 집계
      </p>
      {matches.map((m) => (
        <div key={m.id} className="card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">
              R{m.round_num} · {m.court}코트
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {m.status === 'completed' ? '완료' : '대기'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">TEAM A</p>
              <p className="font-semibold text-sm">{m.team_a_names?.join(' · ')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">TEAM B</p>
              <p className="font-semibold text-sm">{m.team_b_names?.join(' · ')}</p>
            </div>
          </div>
          <ScoreInput match={m} onSubmit={onRefresh} />
        </div>
      ))}
      {matches.length === 0 && (
        <p className="text-center text-slate-400 py-12">설정 탭에서 대진을 생성하세요</p>
      )}
    </div>
  )
}

function ThreeKingdomsMatchTab({ matches, teams, onRefresh }) {
  return (
    <div className="space-y-3 pb-4">
      {teams && Object.keys(teams).length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(teams).map(([name, ids]) => (
            <div key={name} className="card p-3 text-center">
              <p className="text-lg font-bold text-court-green">{name}팀</p>
              <p className="text-xs text-slate-500 mt-1">{ids.length}명</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-slate-500 px-1">A vs B → B vs C → C vs A 로테이션</p>
      {matches.map((m) => (
        <div key={m.id} className="card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">R{m.round_num}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100'
            }`}>
              {m.status === 'completed' ? '완료' : '대기'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-black text-amber-600">{m.team_a_label}팀</p>
              <p className="text-xs text-slate-400 mt-1">{m.team_a_names?.length}명</p>
            </div>
            <span className="text-slate-300 font-bold text-xl">VS</span>
            <div className="text-center">
              <p className="text-2xl font-black text-blue-600">{m.team_b_label}팀</p>
              <p className="text-xs text-slate-400 mt-1">{m.team_b_names?.length}명</p>
            </div>
          </div>
          <ScoreInput match={m} onSubmit={onRefresh} />
        </div>
      ))}
    </div>
  )
}

function UpDownMatchTab({ matches, courtStates, players, onRefresh }) {
  const nameMap = Object.fromEntries(players.map((p) => [p.id, p.name]))

  const enrichedCourts = courtStates?.map((cs) => ({
    ...cs,
    players: cs.players ?? cs.player_ids?.map((id) => nameMap[id] ?? `#${id}`),
  }))

  return (
    <div className="space-y-4 pb-4">
      <p className="text-sm text-slate-500 px-1">
        1코트 승자 잔류·패자 강등 / 2코트 승자 승급
      </p>

      {enrichedCourts?.map((cs) => (
        <div key={cs.court} className="card border-2 border-court-green/20">
          <h3 className="font-bold text-court-green flex items-center gap-2">
            {cs.label || `${cs.court}코트`}
          </h3>
          <ul className="mt-2 space-y-1">
            {cs.player_ids?.map((pid, i) => (
              <li key={pid} className="text-sm py-1.5 px-3 bg-slate-50 rounded-lg">
                {i + 1}. {cs.players?.[i] ?? `#${pid}`}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3 className="text-sm font-bold text-slate-500 uppercase mt-4">현재 경기</h3>
      {matches.filter((m) => m.status === 'pending').map((m) => (
        <div key={m.id} className="card">
          <p className="text-xs text-slate-400 mb-2">{m.court}코트 경기</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-semibold text-sm">{m.team_a_names?.join(' · ')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-semibold text-sm">{m.team_b_names?.join(' · ')}</p>
            </div>
          </div>
          <ScoreInput match={m} onSubmit={onRefresh} />
        </div>
      ))}
      {matches.length === 0 && (
        <p className="text-center text-slate-400 py-8">대진을 생성하세요</p>
      )}
    </div>
  )
}

function FixedTeamMatchTab({ matches, fixedTeams, onRefresh }) {
  return (
    <div className="space-y-3 pb-4">
      {fixedTeams?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {fixedTeams.map((t) => (
            <span key={t.team_id} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
              {t.name}
            </span>
          ))}
        </div>
      )}
      {matches.map((m) => (
        <div key={m.id} className="card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">R{m.round_num} · {m.court}코트</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100'
            }`}>
              {m.status === 'completed' ? '완료' : '대기'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="font-semibold text-sm">{m.team_a_label}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="font-semibold text-sm">{m.team_b_label}</p>
            </div>
          </div>
          <ScoreInput match={m} onSubmit={onRefresh} />
        </div>
      ))}
    </div>
  )
}

function MatchTab({ mode, matches, rankingMeta, players, onRefresh }) {
  switch (mode) {
    case 'THREE_KINGDOMS':
      return (
        <ThreeKingdomsMatchTab
          matches={matches}
          teams={rankingMeta?.teams}
          onRefresh={onRefresh}
        />
      )
    case 'UP_DOWN':
      return (
        <UpDownMatchTab
          matches={matches}
          courtStates={rankingMeta?.court_states}
          players={players}
          onRefresh={onRefresh}
        />
      )
    case 'FIXED_TEAM':
      return (
        <FixedTeamMatchTab
          matches={matches}
          fixedTeams={rankingMeta?.fixed_teams}
          onRefresh={onRefresh}
        />
      )
    default:
      return <IndividualMatchTab matches={matches} onRefresh={onRefresh} />
  }
}

function IndividualRankingTab({ rankings }) {
  return (
    <div className="space-y-2 pb-4">
      <p className="text-sm text-slate-500 px-1">개인 순위 (시상권 1~6위)</p>
      {rankings.map((r) => (
        <div
          key={r.player_id}
          className={`card flex items-center gap-3 ${
            r.rank <= 3 ? 'border-l-4 border-l-amber-400' : ''
          }`}
        >
          <span className={`text-2xl font-black w-10 text-center ${
            r.rank === 1 ? 'text-amber-500' : r.rank <= 3 ? 'text-slate-600' : 'text-slate-300'
          }`}>
            {r.rank}
          </span>
          <div className="flex-1">
            <p className="font-bold">{r.name}</p>
            <p className="text-xs text-slate-400">
              {r.wins}승 {r.losses}패 · {r.matches_count}경기
              {r.matches_count >= 5 && ' (상위 4경기 집계)'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-court-green text-lg">{r.score_diff}</p>
            <p className="text-xs text-slate-400">득실</p>
          </div>
        </div>
      ))}
      {rankings.length === 0 && (
        <p className="text-center text-slate-400 py-12">경기 결과 입력 후 순위가 표시됩니다</p>
      )}
    </div>
  )
}

function ThreeKingdomsRankingTab({ rankings }) {
  return (
    <div className="space-y-3 pb-4">
      <p className="text-sm text-slate-500 px-1">팀 누적 승점 및 득실 (1~3위)</p>
      {rankings.map((r) => (
        <div
          key={r.team}
          className={`card ${
            r.rank === 1 ? 'bg-amber-50 border-amber-200' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-amber-600 w-12 text-center">{r.rank}</span>
            <div className="flex-1">
              <p className="text-xl font-bold">{r.team}팀</p>
              <p className="text-xs text-slate-500 mt-1">{r.members?.join(', ')}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{r.wins}승 {r.losses}패</p>
              <p className="text-sm text-court-green font-semibold">득실 {r.score_diff}</p>
              <p className="text-xs text-slate-400">{r.points_for}:{r.points_against}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function UpDownRankingTab({ courtStates }) {
  return (
    <div className="space-y-4 pb-4">
      <p className="text-sm text-slate-500 px-1">코트별 현재 배치 (승급/강등 상태)</p>
      {courtStates?.map((cs) => (
        <div
          key={cs.court}
          className={`card ${cs.court === 1 ? 'border-t-4 border-t-amber-400' : 'border-t-4 border-t-slate-300'}`}
        >
          <h3 className="font-bold text-lg">{cs.label}</h3>
          <ol className="mt-3 space-y-2">
            {cs.players?.map((name, i) => (
              <li
                key={i}
                className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl"
              >
                <span className="w-6 h-6 rounded-full bg-court-green text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">{name}</span>
                {cs.court === 1 && i === 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">
                    상위
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
      {!courtStates?.length && (
        <p className="text-center text-slate-400 py-12">대진 생성 후 코트 배치가 표시됩니다</p>
      )}
    </div>
  )
}

function FixedTeamRankingTab({ rankings }) {
  return (
    <div className="space-y-2 pb-4">
      <p className="text-sm text-slate-500 px-1">팀 단위 순위</p>
      {rankings.map((r) => (
        <div key={r.team_id} className="card flex items-center gap-3">
          <span className="text-2xl font-black w-10 text-center text-purple-600">{r.rank}</span>
          <div className="flex-1">
            <p className="font-bold">{r.name}</p>
            <p className="text-xs text-slate-400">{r.wins}승 {r.losses}패</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-court-green">{r.score_diff}</p>
            <p className="text-xs text-slate-400">{r.points_for}:{r.points_against}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankingTab({ mode, rankingData }) {
  const effectiveMode = rankingData?.mode || mode
  const rankings = rankingData?.rankings ?? []

  switch (effectiveMode) {
    case 'THREE_KINGDOMS':
      return <ThreeKingdomsRankingTab rankings={rankings} />
    case 'UP_DOWN':
      return <UpDownRankingTab courtStates={rankingData?.court_states} />
    case 'FIXED_TEAM':
      return <FixedTeamRankingTab rankings={rankings} />
    default:
      return <IndividualRankingTab rankings={rankings} />
  }
}

const AWARD_MEDALS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

function AwardsTab({ year, onYearChange, onRefresh }) {
  const [yearData, setYearData] = useState(null)
  const [monthlyRecords, setMonthlyRecords] = useState([])
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const loadAwards = useCallback(async () => {
    setLoading(true)
    try {
      const [awards, records] = await Promise.all([
        api(`/year-awards/${year}`),
        api(`/monthly-records?year=${year}`),
      ])
      setYearData(awards)
      setMonthlyRecords(records.records || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }, [year])

  const loadPreview = useCallback(async () => {
    try {
      const data = await api('/monthly-records/preview/current')
      setPreview(data)
    } catch (e) {
      setPreview(null)
    }
  }, [])

  useEffect(() => {
    loadAwards()
    loadPreview()
  }, [loadAwards, loadPreview])

  const handleArchive = async (overwrite = false) => {
    if (!overwrite && !window.confirm('이번 월례회 성적을 확정하고 연말 시상 집계에 반영할까요?')) {
      return
    }
    setArchiving(true)
    try {
      await api('/monthly-records', {
        method: 'POST',
        body: JSON.stringify({ year, overwrite }),
      })
      await loadAwards()
      await loadPreview()
      if (onRefresh) await onRefresh()
      alert('월례회 성적이 저장되었습니다.')
    } catch (e) {
      if (e.message.includes('이미') && window.confirm(`${e.message}\n덮어쓰시겠습니까?`)) {
        await handleArchive(true)
        return
      }
      alert(e.message)
    } finally {
      setArchiving(false)
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('이 월례회 기록을 삭제할까요?')) return
    await api(`/monthly-records/${id}`, { method: 'DELETE' })
    await loadAwards()
  }

  const ceremonyAwards = yearData?.ceremony_awards ?? []
  const standings = yearData?.standings ?? []
  const rankPoints = yearData?.rank_points ?? {}

  return (
    <div className="space-y-4 pb-4">
      <section className="card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar size={16} /> 연말 시상 집계
          </h2>
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          월례회 확정 시 순위별 포인트가 누적됩니다.
          {' '}
          (1위 {rankPoints[1] ?? 10}점 · 2위 {rankPoints[2] ?? 7}점 · 3위 {rankPoints[3] ?? 5}점)
        </p>
      </section>

      {preview && (
        <section className="card border-court-green/30 bg-court-green/5">
          <h3 className="font-bold text-court-green flex items-center gap-2">
            <Star size={18} /> 이번 월례회 확정
          </h3>
          <p className="text-sm text-slate-600 mt-1">{preview.title}</p>
          <p className="text-xs text-slate-400 mt-1">
            완료 경기 {preview.completed_matches}건 · 상위 {preview.results?.length}명 기록
          </p>
          <ul className="mt-3 space-y-1">
            {preview.results?.slice(0, 6).map((r) => (
              <li key={`${r.player_name}-${r.rank}`} className="flex justify-between text-sm py-1">
                <span>{r.rank}위 {r.player_name}</span>
                <span className="text-court-green font-semibold">+{r.award_points}점</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => handleArchive(false)}
            disabled={archiving}
            className="btn-primary w-full mt-4"
          >
            {archiving ? '저장 중…' : '월례회 성적 확정'}
          </button>
        </section>
      )}

      <section className="card">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-3">
          <Medal size={16} /> {year}년 연말총회 시상 ({yearData?.monthly_count ?? 0}회 집계)
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-court-green" size={28} />
          </div>
        ) : ceremonyAwards.length === 0 ? (
          <p className="text-center text-slate-400 py-8">
            확정된 월례회 기록이 없습니다.<br />
            경기 종료 후 「월례회 성적 확정」을 눌러주세요.
          </p>
        ) : (
          <div className="space-y-3">
            {ceremonyAwards.map((award) => (
              <div
                key={award.player_name}
                className={`rounded-2xl p-4 ${
                  award.ceremony_rank === 1
                    ? 'bg-amber-50 border border-amber-200'
                    : award.ceremony_rank === 2
                      ? 'bg-slate-100 border border-slate-200'
                      : 'bg-orange-50 border border-orange-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{AWARD_MEDALS[award.ceremony_rank]}</span>
                  <div className="flex-1">
                    <p className="text-lg font-bold">{award.player_name}</p>
                    <p className="text-xs text-slate-500">
                      {award.months_played}회 참가 · 1위 {award.first_places}회 · 2위 {award.second_places}회 · 3위 {award.third_places}회
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-court-green">{award.total_points}</p>
                    <p className="text-xs text-slate-400">누적점</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {standings.length > 0 && (
        <section className="card">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            {year}년 전체 순위
          </h3>
          <div className="space-y-2">
            {standings.map((row) => (
              <div key={row.player_name} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                <span className={`w-8 text-center font-black ${
                  row.year_rank <= 3 ? 'text-amber-600' : 'text-slate-300'
                }`}>
                  {row.year_rank}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{row.player_name}</p>
                  <p className="text-xs text-slate-400">{row.months_played}회 참가</p>
                </div>
                <span className="font-bold text-court-green">{row.total_points}점</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          월례회 기록
        </h3>
        {monthlyRecords.length === 0 ? (
          <p className="text-center text-slate-400 py-6">저장된 월례회 기록이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {monthlyRecords.map((record) => (
              <li key={record.id} className="py-3 px-3 bg-slate-50 rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{record.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {record.mode} · {record.results?.length ?? 0}명 기록
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {record.results?.slice(0, 3).map((r) => (
                    <span key={`${record.id}-${r.player_name}`} className="text-xs bg-white px-2 py-0.5 rounded-full">
                      {r.rank}위 {r.player_name} (+{r.award_points})
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('settings')
  const [settings, setSettings] = useState({ mode: 'INDIVIDUAL', courts: 2 })
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [rankingData, setRankingData] = useState(null)
  const [awardYear, setAwardYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)

  const loadSettings = useCallback(async () => {
    const s = await api('/settings')
    setSettings(s)
    return s
  }, [])

  const loadPlayers = useCallback(async () => {
    const p = await api('/players')
    setPlayers(p)
    return p
  }, [])

  const loadMatches = useCallback(async () => {
    const m = await api('/matches')
    setMatches(m)
    return m
  }, [])

  const loadRankings = useCallback(async () => {
    const r = await api('/rankings')
    setRankingData(r)
    return r
  }, [])

  const refreshAll = useCallback(async () => {
    await loadSettings()
    await loadPlayers()
    await loadMatches()
    await loadRankings()
  }, [loadSettings, loadPlayers, loadMatches, loadRankings])

  useEffect(() => {
    refreshAll().finally(() => setBooting(false))
  }, [refreshAll])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await api('/matches/generate', {
        method: 'POST',
        body: JSON.stringify({
          mode: settings.mode,
          courts: settings.courts,
        }),
      })
      await refreshAll()
      setTab('matches')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadMatches()
    await loadRankings()
    await loadPlayers()
  }

  const tabs = [
    { id: 'settings', label: '설정', icon: Settings },
    { id: 'matches', label: '대진표', icon: LayoutGrid },
    { id: 'ranking', label: '순위', icon: Trophy },
    { id: 'awards', label: '시상', icon: Medal },
  ]

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-court-green" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col">
      <header className="bg-court-green text-white px-4 pt-6 pb-4 shadow-md">
        <h1 className="text-xl font-bold tracking-tight">수정회 테니스 월례회</h1>
        <div className="flex items-center gap-2 mt-1">
          <ModeBadge mode={settings.mode} />
          <span className="text-xs text-white/70">{settings.courts}코트</span>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 overflow-y-auto">
        {tab === 'settings' && (
          <SettingsTab
            settings={settings}
            players={players}
            onSettingsChange={loadSettings}
            onPlayersChange={loadPlayers}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}
        {tab === 'matches' && (
          <MatchTab
            mode={settings.mode}
            matches={matches}
            rankingMeta={rankingData}
            players={players}
            onRefresh={handleRefresh}
          />
        )}
        {tab === 'ranking' && (
          <RankingTab mode={settings.mode} rankingData={rankingData} />
        )}
        {tab === 'awards' && (
          <AwardsTab
            year={awardYear}
            onYearChange={setAwardYear}
            onRefresh={refreshAll}
          />
        )}
      </main>

      <nav className="sticky bottom-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-pb">
        <div className="flex justify-around max-w-lg mx-auto">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors ${
                  active
                    ? 'text-court-green bg-court-green/5'
                    : 'text-slate-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
