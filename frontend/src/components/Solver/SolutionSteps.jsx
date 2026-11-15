import { useEffect, useState } from 'react'
import MoveControls from './MoveControls.jsx'
import MoveDisplay from './MoveDisplay.jsx'

export default function SolutionSteps({ result, current, onChange, onReset }) {
  const [playing, setPlaying] = useState(false)
  const moves = result.solution?.trim() ? result.solution.trim().split(/\s+/) : []
  const nextMove = moves[current]

  useEffect(() => {
    if (!playing) return undefined
    if (current >= moves.length) return undefined
    const timer = window.setTimeout(() => {
      const next = Math.min(current + 1, moves.length)
      onChange(next)
      if (next >= moves.length) setPlaying(false)
    }, 760)
    return () => window.clearTimeout(timer)
  }, [playing, current, moves.length, onChange])

  function togglePlayback() {
    if (current >= moves.length) onChange(0)
    setPlaying(value => !value)
  }

  return <>
    <div className="solution-summary"><span className="summary-icon">✓</span><div><strong>{result.alreadySolved ? 'Already solved!' : 'Solution ready'}</strong><span>{moves.length} {moves.length === 1 ? 'turn' : 'turns'} · watch the cube follow along</span></div></div>
    {moves.length ? <>
      <div className="solution-progress"><span style={{ width: `${Math.round(current / moves.length * 100)}%` }}/></div>
      <div className="move-list">{moves.map((move,index)=><MoveDisplay key={`${move}-${index}`} move={move} index={index} active={index===current} complete={index<current}/>)}</div>
      <div className="current-move"><span className="panel-kicker">{nextMove ? `NEXT TURN · ${current+1} / ${moves.length}` : 'SEQUENCE COMPLETE'}</span><strong>{nextMove || 'Solved'}</strong><p>{nextMove ? `The highlighted face is turning in the 3D view.` : 'All moves are applied. The cube is solved.'}</p>
        <MoveControls current={current} total={moves.length} playing={playing} onPlay={togglePlayback} onChange={onChange}/>
      </div>
    </> : <div className="solved-state"><span>✦</span><strong>You’re already there.</strong><p>This cube is solved. Enter a scrambled cube to see its turns animate here.</p></div>}
    <button className="text-button reset-solution" onClick={()=>{setPlaying(false);onReset()}}>New cube</button>
  </>
}
