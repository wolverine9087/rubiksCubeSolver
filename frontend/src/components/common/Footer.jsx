export default function Footer({ navigate }) {
  return <footer className="site-footer"><a className="brand" href="/" onClick={event => { event.preventDefault(); navigate('/') }}><span className="brand-icon">◇</span><span>cubeflow<span className="brand-dot">.</span></span></a><span>Made for the “I can figure this out” moment.</span><button onClick={() => navigate('/solver')}>Ready for another solve? ↗</button></footer>
}
