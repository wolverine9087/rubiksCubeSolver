import { useEffect, useMemo, useRef, useState } from 'react';

import Cube3D from '../components/Cube/Cube3D.jsx';
import ColorPicker from '../components/Cube/ColorPicker.jsx';
import CubeGrid from '../components/Cube/CubeGrid.jsx';

import { applyCubeMove, isSolvedCube } from '../utils/applyCubeMove.js';
import {
  FACE_COLORS,
  FACE_NAMES,
  FACE_ORDER,
  SOLVED_CUBE,
} from '../utils/cubeNotation.js';

import {
  countCubeColors,
  validateCubeColors,
} from '../utils/cubeValidation.js';

import { useAuth } from '../context/useAuth.js';

import {
  formatSolveTime,
  submitLeaderboardEntry,
} from '../services/leaderboardService.js';

// Available clockwise and counterclockwise moves
const MOVES = FACE_ORDER.flatMap((face) => [face, `${face}'`]);

// Generate a random scramble containing 20 moves
function createScramble() {
  const moves = [];
  let previousFace = '';

  while (moves.length < 20) {
    const face =
      FACE_ORDER[Math.floor(Math.random() * FACE_ORDER.length)];

    // Prevent consecutive moves on the same face
    if (face === previousFace) continue;

    const suffix = ['', "'", '2'][Math.floor(Math.random() * 3)];

    moves.push(`${face}${suffix}`);
    previousFace = face;
  }

  return moves.reduce(applyCubeMove, SOLVED_CUBE);
}

export default function Practice() {
  const { user } = useAuth();

  // Cube setup state
  const [setupCube, setSetupCube] = useState(SOLVED_CUBE);
  const [selectedColor, setSelectedColor] = useState('U');
  const [startingCube, setStartingCube] = useState(null);
  const [isRandomScramble, setIsRandomScramble] = useState(false);

  // Practice state
  const [cube, setCube] = useState(SOLVED_CUBE);
  const [turns, setTurns] = useState([]);
  const [undoStack, setUndoStack] = useState([]);

  // Validation state
  const [setupError, setSetupError] = useState('');

  // Timer state
  const [elapsedMs, setElapsedMs] = useState(0);
  const [solveTimeMs, setSolveTimeMs] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  // Leaderboard state
  const [playerName, setPlayerName] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreMessage, setScoreMessage] = useState('');
  const [scoreError, setScoreError] = useState('');

  // Store the timer's starting timestamp
  const timerStartRef = useRef(null);

  // Derived values
  const counts = useMemo(
    () => countCubeColors(setupCube),
    [setupCube]
  );

  const inChallenge = startingCube !== null;
  const solved = isSolvedCube(cube);
  const setupIsValid = validateCubeColors(setupCube);

  const effectivePlayerName = playerName || user?.name || '';

  // Update the timer while a challenge is active
  useEffect(() => {
    if (
      !inChallenge ||
      !timerActive ||
      timerStartRef.current === null ||
      solveTimeMs !== null
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setElapsedMs(performance.now() - timerStartRef.current);
    }, 50);

    return () => window.clearInterval(interval);
  }, [inChallenge, timerActive, solveTimeMs]);

  // Start a new practice challenge
  function startChallenge(state, randomScramble = false) {
    timerStartRef.current = null;

    setTimerActive(false);
    setElapsedMs(0);
    setSolveTimeMs(null);

    setScoreMessage('');
    setScoreError('');

    setStartingCube(state);
    setIsRandomScramble(randomScramble);
    setCube(state);

    setTurns([]);
    setUndoStack([]);
    setSetupError('');
  }

  // Apply a move to the cube
  function turn(move) {
    if (solveTimeMs !== null) return;

    // Start the timer on the first move
    if (timerStartRef.current === null) {
      timerStartRef.current = performance.now();
      setTimerActive(true);
    }

    const nextCube = applyCubeMove(cube, move);
    const finishTime = performance.now();

    // Save the previous cube state for undo
    setUndoStack((stack) => [...stack, cube]);

    setCube(nextCube);
    setTurns((current) => [...current, move]);

    const elapsed = finishTime - timerStartRef.current;

    setElapsedMs(elapsed);

    // Stop the timer when the cube is solved
    if (isSolvedCube(nextCube)) {
      setSolveTimeMs(Math.max(1, Math.round(elapsed)));
    }
  }

  // Undo the previous move
  function undo() {
    if (!undoStack.length) return;

    setCube(undoStack[undoStack.length - 1]);

    setUndoStack((stack) => stack.slice(0, -1));
    setTurns((current) => current.slice(0, -1));
  }

  // Reset the current challenge
  function resetChallenge() {
    if (!startingCube) return;

    timerStartRef.current = null;

    setTimerActive(false);
    setElapsedMs(0);
    setSolveTimeMs(null);

    setScoreMessage('');
    setScoreError('');

    setCube(startingCube);

    setUndoStack([]);
    setTurns([]);
  }

  // Submit the solved time to the leaderboard
  async function postScore(event) {
    event.preventDefault();

    setScoreError('');
    setScoreMessage('');
    setSubmittingScore(true);

    try {
      await submitLeaderboardEntry({
        name: effectivePlayerName.trim(),
        timeMs: solveTimeMs,
        moveCount: turns.length,
        scrambleType: 'random',
      });

      setScoreMessage('Your time is on the leaderboard!');
    } catch (err) {
      setScoreError(err.message || 'Could not post your time.');
    } finally {
      setSubmittingScore(false);
    }
  }

  // Change a sticker's color in the cube editor
  function handleColor(index) {
    // Center stickers cannot be changed
    if (index % 9 === 4) return;

    setSetupCube((current) => {
      return (
        current.slice(0, index) +
        selectedColor +
        current.slice(index + 1)
      );
    });

    setSetupError('');
  }

  // Clear all editable stickers
  function clearSetup() {
    const emptyCube = Array.from({ length: 54 }, (_, index) => {
      return index % 9 === 4
        ? FACE_ORDER[Math.floor(index / 9)]
        : 'X';
    }).join('');

    setSetupCube(emptyCube);
    setSetupError('');
  }

  // Start practicing with the manually entered cube
  function beginEnteredCube() {
    if (!setupIsValid) {
      setSetupError(
        'Use exactly 9 stickers of each color before starting.'
      );
      return;
    }

    startChallenge(setupCube);
  }

  return (
    <main className="page-wrap practice-page">
      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR TRAINING ROOM</span>

          <h1>Practice the solve.</h1>

          <p>
            Set up the scramble or generate one, then work through
            the turns yourself.
          </p>
        </div>

        <span className="step-pill">
          <span>01</span> Set up <i>→</i> <span>02</span> Solve it
        </span>
      </div>

      {!inChallenge ? (
        /* Cube setup screen */
        <div className="practice-layout">
          <section className="panel practice-setup-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">START A CHALLENGE</span>
                <h2>Use your real scramble</h2>
              </div>

              <div className="cube-editor-actions">
                <button
                  className="quiet-button"
                  onClick={clearSetup}
                >
                  Clear pads
                </button>

                <span className="panel-badge">PRIVATE PRACTICE</span>
              </div>
            </div>

            <p className="practice-copy">
              Enter the colors of your scrambled cube, or let us make
              a random scramble for you.
            </p>

            <ColorPicker
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />

            <CubeGrid
              cube={setupCube}
              onColor={handleColor}
            />

            <div className="color-counts">
              {FACE_ORDER.map((face) => (
                <span
                  key={face}
                  className={
                    counts[face] === 9
                      ? 'count-ok'
                      : 'count-warn'
                  }
                >
                  <i style={{ background: FACE_COLORS[face] }} />
                  {counts[face]} {FACE_NAMES[face]}
                </span>
              ))}
            </div>

            {setupError && (
              <p className="helper-text" role="alert">
                {setupError}
              </p>
            )}

            <button
              className="button button-full solve-button"
              onClick={beginEnteredCube}
            >
              Practice this cube →
            </button>

            <p className="practice-or">or</p>

            <button
              className="quiet-button practice-scramble-button"
              onClick={() => startChallenge(createScramble(), true)}
            >
              ↻ Generate a random scramble
            </button>
          </section>

          {/* Cube preview */}
          <section className="panel practice-preview-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">LIVE PREVIEW</span>
                <h2>Your practice cube</h2>
              </div>
            </div>

            <Cube3D
              cube={setupCube}
              className="practice-cube"
            />

            <div className="practice-tip">
              <span>✳</span>

              <p>
                Color the stickers to match your cube. Center
                stickers stay fixed and show each face’s color.
              </p>
            </div>
          </section>
        </div>
      ) : (
        /* Active practice screen */
        <div className="practice-layout">
          <section className="panel practice-board-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">YOUR CUBE</span>

                <h2>
                  {solved ? 'Cube solved!' : 'Make your next move'}
                </h2>
              </div>

              <button
                className="quiet-button"
                onClick={() => setStartingCube(null)}
              >
                Change scramble
              </button>
            </div>

            <Cube3D
              cube={cube}
              className="practice-cube"
            />

            {solved ? (
              <div className="practice-success" role="status">
                <span>✓</span>

                <div>
                  <strong>Nice solve.</strong>

                  <p>
                    {formatSolveTime(solveTimeMs ?? 0)} ·{' '}
                    {turns.length}{' '}
                    {turns.length === 1 ? 'turn' : 'turns'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="practice-tip">
                <span>✳</span>

                <p>
                  Use the buttons for the face you turn toward you.
                  A prime (′) turns it the opposite direction.
                </p>
              </div>
            )}

            <div className="practice-turn-header">
              <span>TURN THE CUBE</span>

              <span>
                {turns.length}{' '}
                {turns.length === 1 ? 'move' : 'moves'}
              </span>
            </div>

            <div className="practice-turn-grid">
              {MOVES.map((move) => (
                <button
                  key={move}
                  className="practice-turn-button"
                  onClick={() => turn(move)}
                  disabled={solved}
                  aria-label={`Turn ${FACE_NAMES[move[0]]} ${
                    move.endsWith("'")
                      ? 'counterclockwise'
                      : 'clockwise'
                  }`}
                >
                  <strong>{move.replace("'", '′')}</strong>
                  <small>{FACE_NAMES[move[0]]}</small>
                </button>
              ))}
            </div>

            <div className="practice-actions">
              <button
                className="quiet-button"
                onClick={undo}
                disabled={!undoStack.length || solved}
              >
                ← Undo turn
              </button>

              <button
                className="quiet-button"
                onClick={resetChallenge}
              >
                Reset challenge
              </button>
            </div>
          </section>

          {/* Practice progress and timer */}
          <section className="panel practice-progress-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">YOUR SESSION</span>
                <h2>Stay in the flow</h2>
              </div>
            </div>

            <div
              className={`practice-status ${
                solved ? 'is-solved' : ''
              }`}
            >
              <span className="practice-status-dot" />

              <div>
                <strong>{solved ? 'Solved' : 'In progress'}</strong>

                <small>
                  {solved
                    ? 'All six faces are back together.'
                    : 'Take it one turn at a time.'}
                </small>
              </div>
            </div>

            <div className="practice-timer-card">
              <span>{solved ? 'FINAL TIME' : 'ELAPSED TIME'}</span>

              <strong>
                {formatSolveTime(solveTimeMs ?? elapsedMs)}
              </strong>

              <small>
                {!timerActive && !solved
                  ? 'Timer starts on your first turn'
                  : solved
                    ? 'Clock stopped'
                    : 'Timer running'}
              </small>
            </div>

            {/* Leaderboard submission */}
            {solved && isRandomScramble && (
              <form
                className="leaderboard-submit"
                onSubmit={postScore}
              >
                <label htmlFor="leaderboard-name">
                  Post your random scramble time
                </label>

                <div className="leaderboard-submit-row">
                  <input
                    id="leaderboard-name"
                    value={effectivePlayerName}
                    onChange={(event) =>
                      setPlayerName(event.target.value)
                    }
                    maxLength={24}
                    placeholder="Your name"
                    required
                  />

                  <button
                    className="button button-small"
                    type="submit"
                    disabled={
                      submittingScore ||
                      !effectivePlayerName.trim() ||
                      Boolean(scoreMessage)
                    }
                  >
                    {submittingScore
                      ? 'Posting…'
                      : scoreMessage
                        ? 'Posted ✓'
                        : 'Post time'}
                  </button>
                </div>

                {scoreMessage && (
                  <p className="score-success" role="status">
                    {scoreMessage}{' '}
                    <a href="/leaderboard">View ranks</a>
                  </p>
                )}

                {scoreError && (
                  <p className="helper-text" role="alert">
                    {scoreError}
                  </p>
                )}
              </form>
            )}

            {solved && !isRandomScramble && (
              <p className="practice-unranked-note">
                Custom cube times are not ranked. Generate a random
                scramble to post a leaderboard time.
              </p>
            )}

            <div className="practice-move-total">
              <strong>
                {turns.length.toString().padStart(2, '0')}
              </strong>

              <span>TURNS MADE</span>
            </div>

            {/* Recent move history */}
            <div className="practice-log-heading">
              <span>RECENT TURNS</span>
              <span>{turns.length} total</span>
            </div>

            <div className="practice-turn-log">
              {turns.length ? (
                turns
                  .slice(-12)
                  .reverse()
                  .map((move, index) => (
                    <div
                      key={`${move}-${turns.length - index}`}
                    >
                      <span>
                        {String(turns.length - index).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      <strong>{move.replace("'", '′')}</strong>

                      <small>
                        {FACE_NAMES[move[0]]}{' '}
                        {move.endsWith("'")
                          ? 'counterclockwise'
                          : 'clockwise'}
                      </small>
                    </div>
                  ))
              ) : (
                <p>
                  Your moves will appear here as you practice.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
