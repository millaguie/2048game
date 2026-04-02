(function () {
    const boardEl = document.getElementById('game-board');
    const scoreEl = document.getElementById('current-score');
    const bestEl = document.getElementById('best-score');
    const overlayEl = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const newGameBtn = document.getElementById('new-game-btn');
    const overlayRetry = document.getElementById('overlay-retry');
    const sizeBtns = document.querySelectorAll('.size-btn');

    let gridSize = 4;
    let grid = [];
    let score = 0;
    let bestScore = 0;
    let gameOver = false;
    let hasWon = false;

    function init() {
        ParticleCanvas.init();
        newGameBtn.addEventListener('click', newGame);
        overlayRetry.addEventListener('click', newGame);
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gridSize = parseInt(btn.dataset.size);
                newGame();
            });
        });
        document.addEventListener('keydown', handleKey);
        setupSwipe();
        newGame();
    }

    function newGame() {
        score = 0;
        gameOver = false;
        hasWon = false;
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        overlayEl.classList.add('hidden');
        overlayEl.classList.remove('won');
        boardEl.dataset.size = gridSize;
        addRandomTile();
        addRandomTile();
        render();
    }

    function addRandomTile() {
        const empty = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return;
        const cell = empty[Math.floor(Math.random() * empty.length)];
        grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
    }

    function render() {
        boardEl.innerHTML = '';
        const fontSize = gridSize <= 4 ? 32 : gridSize <= 5 ? 26 : 20;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const val = grid[r][c];
                if (val) {
                    cell.dataset.value = val;
                    cell.textContent = val;
                    cell.style.fontSize = fontSize + 'px';
                    if (val >= 16384) cell.style.fontSize = (fontSize - 6) + 'px';
                    if (val >= 131072) cell.style.fontSize = (fontSize - 12) + 'px';
                }
                boardEl.appendChild(cell);
            }
        }
        scoreEl.textContent = score;
        bestEl.textContent = bestScore;
    }

    function slide(row) {
        let arr = row.filter(v => v !== 0);
        const mergedPositions = [];
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                if (score > bestScore) bestScore = score;
                arr[i + 1] = 0;
                mergedPositions.push(i);
                i++;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < gridSize) arr.push(0);
        return { result: arr, merged: mergedPositions };
    }

    function move(direction) {
        if (gameOver) return;

        const oldGrid = grid.map(r => [...r]);
        let mergedCells = [];

        if (direction === 'left') {
            for (let r = 0; r < gridSize; r++) {
                const { result, merged } = slide(grid[r]);
                grid[r] = result;
                merged.forEach(c => mergedCells.push({ r, c }));
            }
        } else if (direction === 'right') {
            for (let r = 0; r < gridSize; r++) {
                const { result, merged } = slide([...grid[r]].reverse());
                grid[r] = result.reverse();
                merged.forEach(c => mergedCells.push({ r, c: gridSize - 1 - c }));
            }
        } else if (direction === 'up') {
            for (let c = 0; c < gridSize; c++) {
                const col = [];
                for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
                const { result, merged } = slide(col);
                for (let r = 0; r < gridSize; r++) grid[r][c] = result[r];
                merged.forEach(r => mergedCells.push({ r, c }));
            }
        } else if (direction === 'down') {
            for (let c = 0; c < gridSize; c++) {
                const col = [];
                for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
                const { result, merged } = slide(col.reverse());
                const reversed = result.reverse();
                for (let r = 0; r < gridSize; r++) grid[r][c] = reversed[r];
                merged.forEach(r => mergedCells.push({ r: gridSize - 1 - r, c }));
            }
        }

        let moved = false;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (oldGrid[r][c] !== grid[r][c]) { moved = true; break; }
            }
            if (moved) break;
        }

        if (!moved) return;

        addRandomTile();
        render();

        mergedCells.forEach(({ r, c }) => {
            const idx = r * gridSize + c;
            const cellEl = boardEl.children[idx];
            if (cellEl) {
                cellEl.classList.add('merged');
                const rect = cellEl.getBoundingClientRect();
                ParticleCanvas.emit(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    grid[r][c]
                );
            }
        });

        if (!hasWon) {
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (grid[r][c] === 2048) {
                        hasWon = true;
                        overlayTitle.textContent = 'You Win!';
                        overlayEl.classList.remove('hidden');
                        overlayEl.classList.add('won');
                        return;
                    }
                }
            }
        }

        if (isGameOver()) {
            gameOver = true;
            overlayTitle.textContent = 'Game Over!';
            overlayEl.classList.remove('hidden');
            overlayEl.classList.remove('won');
        }
    }

    function isGameOver() {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === 0) return false;
                if (c < gridSize - 1 && grid[r][c] === grid[r][c + 1]) return false;
                if (r < gridSize - 1 && grid[r][c] === grid[r + 1][c]) return false;
            }
        }
        return true;
    }

    function handleKey(e) {
        const map = {
            ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
            a: 'left', d: 'right', w: 'up', s: 'down',
            A: 'left', D: 'right', W: 'up', S: 'down'
        };
        if (map[e.key]) {
            e.preventDefault();
            move(map[e.key]);
        }
    }

    function setupSwipe() {
        let startX, startY;
        const threshold = 30;

        boardEl.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        boardEl.addEventListener('touchend', e => {
            if (!startX || !startY) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < threshold) return;

            if (absDx > absDy) {
                move(dx > 0 ? 'right' : 'left');
            } else {
                move(dy > 0 ? 'down' : 'up');
            }

            startX = null;
            startY = null;
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
