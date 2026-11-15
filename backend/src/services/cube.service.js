import Cube from "cubejs";

let solverInitialized = false;

// Initialize cubejs solver
export const initializeCubeSolver = () => {
    if (solverInitialized) return;

    Cube.initSolver();

    solverInitialized = true;

    console.log("Cube solver initialized successfully");
};

// Solve the cube
export const solveCube = (cubeState) => {
    if (!solverInitialized) {
        throw new Error("Cube solver has not been initialized");
    }

    const cube = Cube.fromString(cubeState);

    const solution = cube.solve();

    return solution;
};

// Check if cube is solved
export const isCubeSolved = (cubeState) => {
    const cube = Cube.fromString(cubeState);

    return cube.isSolved();
};

// Apply moves to a cube
export const applyMoves = (cubeState, moves) => {
    const cube = Cube.fromString(cubeState);

    cube.move(moves);

    return cube.asString();
};
