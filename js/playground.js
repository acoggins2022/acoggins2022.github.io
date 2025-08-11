/**
 * Main execution function that runs after the HTML document has been fully loaded.
 * It finds the interactive components on the page and initializes them.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize each interactive module if it exists on the page
    setupStatisticalCalculator();
    setupTicTacToeGame();
});


/**
 * Sets up all functionality for the Statistical Calculator.
 * It finds the calculator element and attaches the necessary event listeners.
 */
function setupStatisticalCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    // If the calculator button doesn't exist on the page, do nothing.
    if (!calculateBtn) return;

    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const num3Input = document.getElementById('num3');
    const errorMessage = document.getElementById('error-message');

    calculateBtn.addEventListener('click', () => {
        // Clear previous error messages
        errorMessage.textContent = '';

        // Validate that all inputs have values
        if (num1Input.value === '' || num2Input.value === '' || num3Input.value === '') {
            errorMessage.textContent = 'Please enter all three numbers.';
            return;
        }

        // Convert input strings to numbers and sort them for easier calculation
        const numbers = [
            parseFloat(num1Input.value), 
            parseFloat(num2Input.value), 
            parseFloat(num3Input.value)
        ].sort((a, b) => a - b);

        // Perform calculations
        const min = numbers[0];
        const max = numbers[2];
        const median = numbers[1];
        const sum = numbers.reduce((total, current) => total + current, 0);
        const average = (sum / numbers.length).toFixed(2);
        const range = max - min;

        // Display the results in the UI
        document.getElementById('max-result').textContent = max;
        document.getElementById('min-result').textContent = min;
        document.getElementById('avg-result').textContent = average;
        document.getElementById('median-result').textContent = median;
        document.getElementById('range-result').textContent = range;
    });
}


/**
 * Sets up all functionality for the Tic-Tac-Toe game.
 * It initializes the game state, creates the board, and attaches event listeners.
 */
function setupTicTacToeGame() {
    const tictactoeBoard = document.getElementById('tictactoe-board');
    // If the game board doesn't exist on the page, do nothing.
    if (!tictactoeBoard) return;

    // DOM Elements
    const statusDisplay = document.getElementById('game-status');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const restartBtn = document.getElementById('restart-game-btn');
    const clearScoreBtn = document.getElementById('clear-score-btn');

    // Game State
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let scores = { X: 0, O: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    /** Checks if the current player has won, if it's a draw, or continues the game. */
    function handleResultValidation() {
        let roundWon = false;
        for (const winCondition of winningConditions) {
            const [a, b, c] = winCondition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `Player ${currentPlayer} has won!`;
            scores[currentPlayer]++;
            updateScore();
            isGameActive = false;
            return;
        }

        if (!board.includes('')) {
            statusDisplay.textContent = "It's a draw!";
            isGameActive = false;
            return;
        }

        changePlayer();
    }
    
    /** Switches the current player and updates the status display. */
    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    }

    /** Handles a click on a cell, updating the board and checking the result. */
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (board[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        board[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        handleResultValidation();
    }
    
    /** Resets the game board for a new round. */
    function restartGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
    }

    /** Updates the scoreboard display. */
    function updateScore() {
        scoreXDisplay.textContent = scores.X;
        scoreODisplay.textContent = scores.O;
    }

    /** Clears the scoreboard. */
    function clearScore() {
        scores = { X: 0, O: 0 };
        updateScore();
    }

    // --- Initialize Game ---
    // Create the board cells dynamically
    tictactoeBoard.innerHTML = ''; // Clear board in case of re-initialization
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-index', i);
        cell.addEventListener('click', handleCellClick);
        tictactoeBoard.appendChild(cell);
    }

    // Attach event listeners to buttons
    restartBtn.addEventListener('click', restartGame);
    clearScoreBtn.addEventListener('click', clearScore);
}
