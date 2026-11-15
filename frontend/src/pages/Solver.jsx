
import { useState } from "react";

import Cube3D from "../components/Cube/Cube3D.jsx";
import ColorPicker from "../components/Cube/ColorPicker.jsx";
import CubeGrid from "../components/Cube/CubeGrid.jsx";
import SolutionSteps from "../components/Solver/SolutionSteps.jsx";

import useCube from "../hooks/useCube.js";

import { solveCube } from "../services/cubeService.js";

import {
    FACE_COLORS,
    FACE_NAMES,
    FACE_ORDER
} from "../utils/cubeNotation.js";

export default function Solver({ user, navigate }) {
    // Cube state and controls
    const {
        cube,
        counts,
        selectedColor,
        setSelectedColor,
        colorSticker,
        reset,
        clearStickers,
        isColorValid
    } = useCube();

    // Component state
    const [solution, setSolution] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    // Find cube solution
    async function findSolution() {
        setBusy(true);
        setError("");
        setSolution(null);
        setCurrentStep(0);

        try {
            const result = await solveCube(cube);

            setSolution(result);
        } catch (err) {
            setError(err.message || "Unable to solve the cube.");
        } finally {
            setBusy(false);
        }
    }

    // Reset cube and solution
    function startAgain() {
        reset();
        setSolution(null);
        setCurrentStep(0);
        setError("");
    }

    function handleColor(index) {
        colorSticker(index);
        setSolution(null);
        setCurrentStep(0);
        setError("");
    }

    return (
        <main className="page-wrap">

            {/* Page heading */}
            <div className="page-heading">
                <div>
                    <span className="eyebrow">THE FUN PART</span>

                    <h1>Let's solve that cube.</h1>

                    <p>
                        Match each square to your real cube.
                        Start with the white center and take it face by face.
                    </p>
                </div>

                <span className="step-pill">
                    <span>1</span>
                    Set your colors
                    <i>→</i>
                    <span>2</span>
                    Get your moves
                </span>
            </div>

            {/* Main solver layout */}
            <div className="solver-layout">

                {/* Cube input panel */}
                <section className="panel cube-panel">

                    <div className="panel-heading">
                        <div>
                            <span className="panel-kicker">YOUR CUBE</span>
                            <h2>Tap a square to color it</h2>
                        </div>

                        <div className="cube-editor-actions">
                            <button className="quiet-button" onClick={clearStickers}>Clear pads</button>
                            <button className="quiet-button" onClick={startAgain}>Reset cube</button>
                        </div>
                    </div>

                    {/* 3D cube */}
                    <Cube3D
                        cube={cube}
                        solution={solution?.solution || ""}
                        appliedMoves={currentStep}
                        className="solver-cube"
                    />

                    {/* Color selection */}
                    <ColorPicker
                        selectedColor={selectedColor}
                        onSelect={setSelectedColor}
                    />

                    {/* Cube face input grid */}
                    <CubeGrid
                        cube={cube}
                        onColor={handleColor}
                    />

                    {/* Color validation counts */}
                    <div className="color-counts">
                        {FACE_ORDER.map((face) => (
                            <span
                                key={face}
                                className={
                                    counts[face] === 9
                                        ? "count-ok"
                                        : "count-warn"
                                }
                            >
                                <i
                                    style={{
                                        background: FACE_COLORS[face]
                                    }}
                                />

                                {counts[face]} {FACE_NAMES[face]}
                            </span>
                        ))}
                    </div>

                    {/* Solve button */}
                    <button
                        className="button button-full solve-button"
                        onClick={findSolution}
                        disabled={busy || !isColorValid}
                    >
                        {busy
                            ? "Finding your moves…"
                            : "Find my solution ✳"}
                    </button>

                    {!isColorValid && (
                        <p className="helper-text">
                            Every color needs exactly 9 squares
                            before we can solve it.
                        </p>
                    )}
                </section>

                {/* Solution panel */}
                <section className="panel solution-panel">

                    <div className="panel-heading">
                        <div>
                            <span className="panel-kicker">
                                YOUR GAME PLAN
                            </span>

                            <h2>
                                {solution
                                    ? "You've got this."
                                    : "Your moves will show up here"}
                            </h2>
                        </div>

                        <span className="panel-badge">
                            ✳ YOURS, JUST FOR YOU
                        </span>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div
                            className="error-toast"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {/* Solution steps */}
                    {solution ? (
                        <SolutionSteps
                            key={
                                solution.solution || "already-solved"
                            }
                            result={solution}
                            current={currentStep}
                            onChange={setCurrentStep}
                            onReset={startAgain}
                        />
                    ) : (
                        <div className="empty-solution">
                            <div className="empty-icon">◇</div>

                            <p>
                                Fill in the colors on all six faces
                                and your step-by-step solution will
                                land right here.
                            </p>

                            <span>
                                It's okay if it looks scrambled.
                                That's the whole point.
                            </span>
                        </div>
                    )}

                    {/* Helpful tip */}
                    <div className="friendly-tip">
                        <span>✳</span>

                        <p>
                            <strong>A tiny tip</strong>

                            {" "}Hold the cube with the face you're
                            entering turned toward you. The center
                            square never moves, so it's your color
                            compass.
                        </p>
                    </div>
                </section>
            </div>

            {/* Privacy information */}
            <p className="privacy-note">
                ✓{" "}
                {user
                    ? "Your cube stays in this session."
                    : "Your cube stays right here in your browser."}

                {!user && (
                    <button
                        onClick={() => navigate("/register")}
                    >
                        Create a free account
                    </button>
                )}
            </p>

        </main>
    );
}
