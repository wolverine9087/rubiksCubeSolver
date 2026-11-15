import { formatMove } from '../../utils/cubeNotation.js'

export default function MoveDisplay({ move, index, active, complete }) {
  return <div className={`move-row ${active?'active-move':''} ${complete?'complete-move':''}`} aria-current={active?'step':undefined}><span className="move-index">{String(index+1).padStart(2,'0')}</span><span className="move-token">{move}</span><span className="move-hint">{formatMove(move)}</span>{complete&&<span className="move-done">✓</span>}</div>
}
