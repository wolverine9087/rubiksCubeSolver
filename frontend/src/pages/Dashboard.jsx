export default function Dashboard({ user, navigate }) {
  return <main className="page-wrap"><div className="page-heading"><div><span className="eyebrow">WELCOME BACK</span><h1>Good to see you, {user?.name?.split(' ')[0]||'cuber'}.</h1><p>Ready to work through another scramble?</p></div></div><section className="cta-card"><div><span className="eyebrow">NEXT SESSION</span><h2>Put your hands <span>on the cube.</span></h2><p>Enter the face colors and watch the solve play out in 3D.</p></div><button className="button" onClick={()=>navigate('/solver')}>Open solver ↗</button></section></main>
}
