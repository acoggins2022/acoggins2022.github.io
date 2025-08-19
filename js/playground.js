/**
 * Main execution function that runs after the HTML document has been fully loaded.
 * It finds the interactive components on the page and initializes them.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize each interactive module if it exists on the page
    setupStatisticalCalculator();
    setupTicTacToeGame();
    setupChoiceGrid();
});


/**
 * Sets up all functionality for the ChoiceGrid Decision Maker.
 */
function setupChoiceGrid() {
    const container = document.querySelector('.choicegrid-container');
    if (!container) return; // If the component isn't on the page, do nothing.

    // --- DATA STATE ---
    const state = {
        options: [],
        criteria: [],
        scores: {},
    };

    // --- DOM ELEMENTS ---
    const optionInput = document.getElementById('cg-option-input');
    const addOptionBtn = document.getElementById('cg-add-option-btn');
    const optionsList = document.getElementById('cg-options-list');
    const criteriaList = document.getElementById('cg-criteria-list');
    const addCriterionBtn = document.getElementById('cg-add-criterion-btn');
    const totalWeightEl = document.getElementById('cg-total-weight');
    const scoringGridContainer = document.getElementById('cg-scoring-grid-container');
    const scoringTable = document.getElementById('cg-scoring-table');
    const resultsContainer = document.getElementById('cg-results-container');
    const winnerDisplay = document.getElementById('cg-winner-display');
    const viewToggles = document.querySelectorAll('.cg-view-toggle');

    let barChartInstance = null;
    let radarChartInstance = null;

    // --- INITIALIZATION ---
    function initializeWithSampleData() {
        state.options = [
            { id: 1, name: 'Laptop A' },
            { id: 2, name: 'Laptop B' },
        ];
        state.criteria = [
            { id: 1, name: 'Price', weight: 40 },
            { id: 2, name: 'Performance', weight: 30 },
            { id: 3, name: 'Battery Life', weight: 20 },
            { id: 4, name: 'Portability', weight: 10 },
        ];
        state.scores = {
            '1-1': 8, '1-2': 9, '1-3': 6, '1-4': 7,
            '2-1': 6, '2-2': 7, '2-3': 9, '2-4': 9,
        };
        render();
    }

    // --- EVENT LISTENERS ---
    addOptionBtn.addEventListener('click', handleAddOption);
    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddOption();
    });
    addCriterionBtn.addEventListener('click', handleAddCriterion);
    viewToggles.forEach(btn => btn.addEventListener('click', handleViewToggle));

    // --- HANDLER FUNCTIONS ---
    function handleAddOption() {
        const name = optionInput.value.trim();
        if (name) {
            const newOption = { id: Date.now(), name };
            state.options.push(newOption);
            optionInput.value = '';
            render();
        }
    }

    function handleAddCriterion() {
        const newCriterion = { id: Date.now(), name: 'New Criterion', weight: 10 };
        state.criteria.push(newCriterion);
        render();
    }

    function handleViewToggle(e) {
        const selectedView = e.target.dataset.view;
        viewToggles.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === selectedView);
        });
        document.querySelectorAll('.cg-view-content').forEach(view => {
            view.classList.toggle('hidden', view.id !== `cg-${selectedView}-view`);
        });
    }

    // --- CORE LOGIC & CALCULATIONS ---
    function calculateResults() {
        const totalWeight = state.criteria.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight === 0) return [];
        return state.options.map(option => {
            let finalScore = 0;
            const criteriaScores = {};
            state.criteria.forEach(criterion => {
                const score = state.scores[`${option.id}-${criterion.id}`] || 0;
                const weightedScore = (score / 10) * (criterion.weight / totalWeight) * 100;
                finalScore += weightedScore;
                criteriaScores[criterion.name] = weightedScore;
            });
            return { ...option, finalScore: parseFloat(finalScore.toFixed(2)), criteriaScores };
        }).sort((a, b) => b.finalScore - a.finalScore);
    }

    // --- RENDER FUNCTIONS ---
    function render() {
        renderOptionsList();
        renderCriteriaList();
        renderScoringGrid();
        renderResults();
    }

    function renderOptionsList() {
        optionsList.innerHTML = state.options.map(option => `
            <div class="list-item">
                <span>${option.name}</span>
                <button class="delete-btn" data-id="${option.id}" data-type="option">&times;</button>
            </div>
        `).join('');
    }

    function renderCriteriaList() {
        criteriaList.innerHTML = state.criteria.map(criterion => `
            <div class="criterion-item">
                <input type="text" value="${criterion.name}" data-id="${criterion.id}" class="criterion-name-input">
                <input type="range" min="0" max="100" value="${criterion.weight}" data-id="${criterion.id}" class="criterion-weight-slider">
                <span class="criterion-weight-label">${criterion.weight}%</span>
                <button class="delete-btn" data-id="${criterion.id}" data-type="criterion">&times;</button>
            </div>
        `).join('');
        updateTotalWeight();
    }

    function renderScoringGrid() {
        if (state.options.length === 0 || state.criteria.length === 0) {
            scoringGridContainer.classList.add('hidden');
            return;
        }
        scoringGridContainer.classList.remove('hidden');
        let headerHtml = '<thead><tr><th>Option</th>';
        state.criteria.forEach(c => { headerHtml += `<th>${c.name}</th>`; });
        headerHtml += '</tr></thead>';
        let bodyHtml = '<tbody>';
        state.options.forEach(option => {
            bodyHtml += `<tr><td>${option.name}</td>`;
            state.criteria.forEach(criterion => {
                const scoreKey = `${option.id}-${criterion.id}`;
                const score = state.scores[scoreKey] || 0;
                bodyHtml += `<td><input type="number" min="0" max="10" value="${score}" data-option-id="${option.id}" data-criterion-id="${criterion.id}" class="score-input"></td>`;
            });
            bodyHtml += '</tr>';
        });
        bodyHtml += '</tbody>';
        scoringTable.innerHTML = headerHtml + bodyHtml;
    }

    function renderResults() {
        if (state.options.length === 0 || state.criteria.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }
        resultsContainer.classList.remove('hidden');
        const results = calculateResults();
        if (results.length > 0 && results[0].finalScore > 0) {
            const winner = results[0];
            winnerDisplay.innerHTML = `<strong>Winner:</strong> ${winner.name} (Score: ${winner.finalScore.toFixed(1)})`;
        } else {
            winnerDisplay.innerHTML = `Enter scores to see the winner.`;
        }
        renderTreemap(results);
        renderBarChart(results);
        renderRadarChart(results);
    }

    // --- VISUALIZATION RENDERERS ---
    function renderTreemap(results) {
        const svg = d3.select("#cg-treemap-svg");
        svg.selectAll("*").remove();
        if (results.length === 0) return;

        // Give the SVG more height for better visuals
        svg.attr("height", 400); 

        const width = svg.node().getBoundingClientRect().width;
        const height = 400;

        // Create a hierarchical data structure. This is key for a proper treemap.
        const treemapData = {
            name: "root",
            children: results.map(res => ({
                name: res.name,
                // The children are the criteria that make up the option's score
                children: Object.entries(res.criteriaScores).map(([name, score]) => ({
                    name: name,
                    score: score
                }))
            }))
        };
        
        const root = d3.hierarchy(treemapData)
            .sum(d => Math.max(0, d.score)) // Sum scores of criteria to get option total
            .sort((a, b) => b.value - a.value);

        // Use d3.treemap to calculate the layout
        d3.treemap()
            .size([width, height])
            .paddingTop(28) // Space for the header
            .paddingInner(2)
            (root);

        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // Create a group for each option
        const node = svg.selectAll("g")
            .data(root.children) // Bind data to the main options
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        // Header rectangle for each option
        node.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", 28)
            .attr("fill", d => color(d.data.name));

        // Name to the header
        node.append("text")
            .attr("x", 6)
            .attr("y", 18)
            .text(d => `${d.data.name} (${d.value.toFixed(1)})`)
            .attr("font-size", "14px")
            .attr("fill", "white")
            .attr("font-weight", "bold");

        // Create groups for the criteria rectangles within each option
        const leaf = node.selectAll("g")
            .data(d => d.children) // Bind data to the criteria
            .join("g")
            .attr("transform", d => `translate(${d.x0 - d.parent.x0},${d.y0 - d.parent.y0})`);

        // Add the rectangle for each criterion
        leaf.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => color(d.parent.data.name))
            .attr("opacity", 0.7);

        // Add the criterion name and score, but only if it fits
    leaf.append("text")
            .attr("x", 4)
            .attr("y", 14)
            .text(d => `${d.data.name} (${d.value.toFixed(1)})`)
            .attr("fill", "white")
            .each(function(d) { // Use 'each' to run custom logic for each text element
                const text = d3.select(this);
                const rectWidth = d.x1 - d.x0;
                const rectHeight = d.y1 - d.y0;
                let fontSize = 12; // Starting font size
                text.attr("font-size", `${fontSize}px`);
                
                // Loop to shrink font size until it fits or reaches a minimum
                while (text.node().getComputedTextLength() > rectWidth - 8 && fontSize > 6) {
                    fontSize--;
                    text.attr("font-size", `${fontSize}px`);
                }

                // Final check to hide if it's still too small or doesn't fit
                if (fontSize <= 4 || text.node().getBBox().height > rectHeight) {
                    text.style("display", "none");
                }
            });
    }


    function renderBarChart(results) {
        const ctx = document.getElementById('cg-bar-chart-canvas').getContext('2d');
        if (barChartInstance) barChartInstance.destroy();
        if (results.length === 0) return;
        const labels = results.map(r => r.name);
        const criteriaNames = state.criteria.map(c => c.name);
        const datasets = criteriaNames.map((criterionName, index) => ({
            label: criterionName,
            data: results.map(r => r.criteriaScores[criterionName] || 0),
            backgroundColor: d3.schemeTableau10[index % 10],
        }));
        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
        });
    }

    function renderRadarChart(results) {
        const ctx = document.getElementById('cg-radar-chart-canvas').getContext('2d');
        if (radarChartInstance) radarChartInstance.destroy();
        if (results.length === 0) return;
        const labels = state.criteria.map(c => c.name);
        const datasets = results.map((result, index) => {
            const color = d3.schemeTableau10[index % 10];
            return {
                label: result.name,
                data: state.criteria.map(c => state.scores[`${result.id}-${c.id}`] || 0),
                fill: true,
                backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
                borderColor: color,
            };
        });
        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: { labels, datasets },
            options: { responsive: true, scales: { r: { suggestedMin: 0, suggestedMax: 10 } } }
        });
    }

    // --- DYNAMIC EVENT HANDLING (using event delegation) ---
    container.addEventListener('input', (e) => {
        const { id } = e.target.dataset;
        if (e.target.matches('.criterion-name-input')) {
            const criterion = state.criteria.find(c => c.id == id);
            if (criterion) criterion.name = e.target.value;
            renderScoringGrid(); 
            renderResults();
        } else if (e.target.matches('.criterion-weight-slider')) {
            const criterion = state.criteria.find(c => c.id == id);
            if (criterion) {
                criterion.weight = parseInt(e.target.value, 10);
                const label = e.target.nextElementSibling;
                if(label && label.classList.contains('criterion-weight-label')) {
                    label.textContent = `${criterion.weight}%`;
                }
                updateTotalWeight();
                renderResults();
            }
        } else if (e.target.matches('.score-input')) {
            const { optionId, criterionId } = e.target.dataset;
            const score = parseInt(e.target.value, 10);
            if (score >= 0 && score <= 10) {
                state.scores[`${optionId}-${criterionId}`] = score;
            } else if (e.target.value === '') {
                state.scores[`${optionId}-${criterionId}`] = 0;
            }
            renderResults();
        }
    });

    container.addEventListener('click', (e) => {
        if (e.target.matches('.delete-btn')) {
            const { id, type } = e.target.dataset;
            if (type === 'option') {
                state.options = state.options.filter(o => o.id != id);
            } else if (type === 'criterion') {
                state.criteria = state.criteria.filter(c => c.id != id);
            }
            render();
        }
    });

    function updateTotalWeight() {
        const total = state.criteria.reduce((sum, c) => sum + c.weight, 0);
        totalWeightEl.textContent = `${total}%`;
        totalWeightEl.style.color = total === 100 ? 'green' : 'red';
    }

    // --- START THE APP ---
    initializeWithSampleData();
    handleViewToggle({ target: document.querySelector('.cg-view-toggle[data-view="treemap"]') });
}


/**
 * Sets up all functionality for the Statistical Calculator.
 */
function setupStatisticalCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    if (!calculateBtn) return;

    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const num3Input = document.getElementById('num3');
    const errorMessage = document.getElementById('error-message');

    calculateBtn.addEventListener('click', () => {
        errorMessage.textContent = '';
        if (num1Input.value === '' || num2Input.value === '' || num3Input.value === '') {
            errorMessage.textContent = 'Please enter all three numbers.';
            return;
        }
        const numbers = [
            parseFloat(num1Input.value), 
            parseFloat(num2Input.value), 
            parseFloat(num3Input.value)
        ].sort((a, b) => a - b);
        const min = numbers[0];
        const max = numbers[2];
        const median = numbers[1];
        const sum = numbers.reduce((total, current) => total + current, 0);
        const average = (sum / numbers.length).toFixed(2);
        const range = max - min;
        document.getElementById('max-result').textContent = max;
        document.getElementById('min-result').textContent = min;
        document.getElementById('avg-result').textContent = average;
        document.getElementById('median-result').textContent = median;
        document.getElementById('range-result').textContent = range;
    });
}


/**
 * Sets up all functionality for the Tic-Tac-Toe game.
 */
function setupTicTacToeGame() {
    const tictactoeBoard = document.getElementById('tictactoe-board');
    if (!tictactoeBoard) return;

    const statusDisplay = document.getElementById('game-status');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const restartBtn = document.getElementById('restart-game-btn');
    const clearScoreBtn = document.getElementById('clear-score-btn');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let scores = { X: 0, O: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

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
    
    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
        if (board[clickedCellIndex] !== '' || !isGameActive) return;
        board[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
        handleResultValidation();
    }
    
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

    function updateScore() {
        scoreXDisplay.textContent = scores.X;
        scoreODisplay.textContent = scores.O;
    }

    function clearScore() {
        scores = { X: 0, O: 0 };
        updateScore();
    }

    tictactoeBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-index', i);
        cell.addEventListener('click', handleCellClick);
        tictactoeBoard.appendChild(cell);
    }

    restartBtn.addEventListener('click', restartGame);
    clearScoreBtn.addEventListener('click', clearScore);
}
