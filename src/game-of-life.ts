
import * as fs from 'fs/promises';
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

//TODO log from file



/* @ts-ignore */
const initialStatePath = argv.config;
/* @ts-ignore */
const numGenerations = argv.generations;
/* @ts-ignore */
const logTime = process.logTime ? process.logTime : 300;


interface GameConfig {
    board: {
        length: number;
        height: number;
        matrix: boolean[][];
    };
    generations: number;
    logTimeMilliseconds: number;
}

const loadGameConfig = async (filename: string = initialStatePath): Promise<GameConfig> => {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data) as GameConfig;
}


const generateBoard = (boardLength: number, boardHeight: number): boolean[][] => {
    const board: boolean[][] = [];
    for (let i = 0; i < boardHeight; i++) {
        board.push(new Array(boardLength).fill(false));
    }
    return board;
}
// Initialize the board with the Toad Oscillator pattern


// Update the state of the board for each generation based on the rules of the Game of Life
const updateBoard = (board: boolean[][], config: GameConfig) => {
    let newBoard: boolean[][] = [];
    for (let i = 0; i < config.board.height; i++) {
        newBoard.push([]);
        for (let j = 0; j < config.board.length; j++) {
            const aliveNeighbors = countAliveNeighbors(i, j, board, config);
            if (board[i][j]) {
                // Cell is currently alive
                if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                    // Cell dies due to underpopulation or overpopulation
                    newBoard[i][j] = false;
                } else {
                    // Cell stays alive
                    newBoard[i][j] = true;
                }
            } else {
                // Cell is currently dead
                if (aliveNeighbors === 3) {
                    // Cell comes to life due to reproduction
                    newBoard[i][j] = true;
                } else {
                    // Cell stays dead
                    newBoard[i][j] = false;
                }
            }
        }
    }
    return newBoard;
}

// Count the number of alive neighbors for a given cell
const countAliveNeighbors = (row: number, col: number, board: boolean[][], config: GameConfig) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                // Skip the current cell
                continue;
            }
            const neighborRow = row + i;
            const neighborCol = col + j;
            if (
                neighborRow >= 0 &&
                neighborRow < config.board.height &&
                neighborCol >= 0 &&
                neighborCol < config.board.length &&
                board[neighborRow][neighborCol]
            ) {
                count++;
            }
        }
    }
    return count;
}

// Log the current state of the board to the console and clear the console each time
// we need to print the next state of the board
const logBoard = (board: boolean[][], config: GameConfig) => {
    console.clear();
    for (let i = 0; i < config.board.height; i++) {
        let row = "| ";
        for (let j = 0; j < config.board.length; j++) {
            if (board[i][j]) {
                row += "*";
            } else {
                row += " ";
            }
            row += " ";
        }
        row += "|";
        console.log(row);
    }
}

// Run the game for the specified number of generations and log the state of the board at
// regular intervals
const runGame = async () => {
    const config = await loadGameConfig()
    let board = config.board.matrix
    logBoard(board, config);
    const intervalId = setInterval(() => {
        board = updateBoard(board, config);
        logBoard(board, config);
    }, logTime);
}

// Start the game
runGame();

