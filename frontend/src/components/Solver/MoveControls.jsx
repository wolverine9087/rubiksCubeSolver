export default function MoveControls({ current, total, playing, onPlay, onChange }) {
  return <div className="move-controls">
    <button className="quiet-button" disabled={current===0} onClick={()=>onChange(value=>Math.max(0,value-1))}>← Previous</button>
    <span>{current} / {total}</span>
    <button className="button playback-button" onClick={onPlay}>{playing ? 'Ⅱ Pause' : current===total ? 'Replay' : '▶ Play'}</button>
    <button className="quiet-button" disabled={current>=total} onClick={()=>onChange(value=>Math.min(total,value+1))}>Next →</button>
  </div>
}
