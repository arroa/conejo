class Game {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.time = 0;
        this.isPaused = false;
        this.timer = null;
        this.maze = null;
        this.rabbit = null;
        this.eggs = [];
        this.bombs = [];
        this.trees = [];
        this.results = [];
        this.eggsCollected = 0;
        this.totalEggs = 20;
        this.gridSize = 20;
        this.maxBombs = 27;
        this.lastResultTime = 0;
        this.timerStarted = false;
        this.init();
    }

    init() {
        this.createMaze();
        this.setupEventListeners();
        this.renderResults();
    }

    createMaze() {
        const mazeSize = this.gridSize;
        const eggCount = this.totalEggs;
        const bombCount = Math.min(3 * this.level, this.maxBombs);
        const treeCount = 5 * this.level;
        this.eggsCollected = 0;
        this.maze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(0));

        // Crear paredes exteriores
        for (let i = 0; i < mazeSize; i++) {
            for (let j = 0; j < mazeSize; j++) {
                if (i === 0 || i === mazeSize - 1 || j === 0 || j === mazeSize - 1) {
                    this.maze[i][j] = 1; // Pared
                }
            }
        }

        // Colocar conejo en posición aleatoria
        let rabbitX, rabbitY;
        do {
            rabbitX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            rabbitY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
        } while (this.maze[rabbitY][rabbitX] !== 0);
        this.rabbit = { x: rabbitX, y: rabbitY };
        
        // Colocar árboles
        this.trees = [];
        let placedTrees = 0;
        while (placedTrees < treeCount) {
            let treeX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            let treeY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            if (
                this.maze[treeY][treeX] === 0 &&
                !(treeX === rabbitX && treeY === rabbitY) &&
                !this.trees.some(t => t.x === treeX && t.y === treeY)
            ) {
                this.trees.push({ x: treeX, y: treeY });
                placedTrees++;
            }
        }

        // Colocar huevos
        this.eggs = [];
        let placedEggs = 0;
        while (placedEggs < eggCount) {
            let eggX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            let eggY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            if (
                this.maze[eggY][eggX] === 0 &&
                !(eggX === rabbitX && eggY === rabbitY) &&
                !this.eggs.some(e => e.x === eggX && e.y === eggY) &&
                !this.trees.some(t => t.x === eggX && t.y === eggY)
            ) {
                this.eggs.push({ x: eggX, y: eggY });
                placedEggs++;
            }
        }

        // Colocar bombas
        this.bombs = [];
        let placedBombs = 0;
        while (placedBombs < bombCount) {
            let bombX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            let bombY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            if (
                this.maze[bombY][bombX] === 0 &&
                !(bombX === rabbitX && bombY === rabbitY) &&
                !this.eggs.some(e => e.x === bombX && e.y === bombY) &&
                !this.bombs.some(b => b.x === bombX && b.y === bombY) &&
                !this.trees.some(t => t.x === bombX && t.y === bombY)
            ) {
                this.bombs.push({ x: bombX, y: bombY });
                placedBombs++;
            }
        }

        this.renderMaze();
    }

    renderMaze() {
        const mazeElement = document.getElementById('maze');
        mazeElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 30px)`;
        mazeElement.innerHTML = '';

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else if (this.trees.some(tree => tree.x === x && tree.y === y)) {
                    cell.classList.add('tree');
                } else if (x === this.rabbit.x && y === this.rabbit.y) {
                    cell.classList.add('rabbit');
                } else if (this.eggs.some(egg => egg.x === x && egg.y === y)) {
                    cell.classList.add('carrot');
                } else if (this.bombs.some(bomb => bomb.x === x && bomb.y === y)) {
                    cell.classList.add('bomb');
                }
                mazeElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isPaused) {
                const pauseMenu = document.getElementById('pause-menu');
                const h2Text = pauseMenu.querySelector('h2').textContent;
                // Menú de nivel superado
                if (h2Text.includes('Nivel superado')) {
                    if (e.key.toLowerCase() === 's') {
                        this.nextLevel();
                        return;
                    }
                    if (e.key.toLowerCase() === 'r') {
                        this.restartLevel();
                        return;
                    }
                    if (e.key.toLowerCase() === 't') {
                        this.restart();
                        return;
                    }
                    if (e.key.toLowerCase() === 'x') {
                        window.location.reload();
                        return;
                    }
                }
                // Menú de explosión
                else if (h2Text.includes('Explotaste')) {
                    if (e.key.toLowerCase() === 'r') {
                        this.restartLevel();
                        return;
                    }
                    if (e.key.toLowerCase() === 't') {
                        this.restart();
                        return;
                    }
                    if (e.key.toLowerCase() === 'x') {
                        window.location.reload();
                        return;
                    }
                }
                // Menú de pausa normal
                else {
                    if (e.key === ' ') {
                        this.togglePause();
                        return;
                    }
                    if (e.key.toLowerCase() === 'r') {
                        this.restartLevel();
                        return;
                    }
                    if (e.key.toLowerCase() === 't') {
                        this.restart();
                        return;
                    }
                    if (e.key.toLowerCase() === 's') {
                        window.location.reload();
                        return;
                    }
                }
                return;
            }
            let newX = this.rabbit.x;
            let newY = this.rabbit.y;
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    newY--;
                    break;
                case 'ArrowDown':
                case 's':
                    newY++;
                    break;
                case 'ArrowLeft':
                case 'a':
                    newX--;
                    break;
                case 'ArrowRight':
                case 'd':
                    newX++;
                    break;
                case ' ':
                    this.togglePause();
                    return;
            }
            if (this.maze[newY][newX] !== 1 && !this.trees.some(tree => tree.x === newX && tree.y === newY)) {
                if (!this.timerStarted) {
                    this.startTimer();
                    this.timerStarted = true;
                }
                this.rabbit.x = newX;
                this.rabbit.y = newY;
                this.checkCollisions();
                this.renderMaze();
            }
        });
        this.assignPauseMenuListeners();
    }

    assignPauseMenuListeners() {
        document.getElementById('next-btn').onclick = () => this.nextLevel();
        document.getElementById('restart-level-btn').onclick = () => this.restartLevel();
        document.getElementById('restart-btn').onclick = () => this.restart();
        document.getElementById('exit-btn').onclick = () => window.location.reload();
    }

    checkCollisions() {
        let foundEgg = false;
        this.eggs = this.eggs.filter(egg => {
            if (egg.x === this.rabbit.x && egg.y === this.rabbit.y) {
                this.score++;
                this.eggsCollected++;
                foundEgg = true;
                document.getElementById('score').textContent = this.eggsCollected;
                return false;
            }
            return true;
        });
        // Verificar colisión con bomba
        if (this.bombs.some(bomb => bomb.x === this.rabbit.x && bomb.y === this.rabbit.y)) {
            this.endLevel(false);
            return;
        }
        // Verificar si todos los huevos fueron recolectados
        if (this.eggs.length === 0) {
            this.endLevel(true);
        }
    }

    endLevel(success) {
        let resultado = success ? 'Superado' : 'Explotado';
        // Guardar el tiempo ANTES de pausar o reiniciar
        let tiempoFinal = this.time;
        this.results.push({
            nivel: this.level,
            huevos: this.eggsCollected,
            total: this.totalEggs,
            tiempo: tiempoFinal,
            resultado: resultado
        });
        this.renderResults();
        this.showEndMenu(success);
    }

    showEndMenu(success) {
        this.isPaused = true;
        const pauseMenu = document.getElementById('pause-menu');
        pauseMenu.classList.remove('hidden');
        const nextBtn = document.getElementById('next-btn');
        const restartLevelBtn = document.getElementById('restart-level-btn');
        const restartBtn = document.getElementById('restart-btn');
        const exitBtn = document.getElementById('exit-btn');
        if (success) {
            pauseMenu.querySelector('h2').textContent = '¡Nivel superado!';
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = 'Siguiente Nivel (S)';
            restartLevelBtn.style.display = 'inline-block';
            restartLevelBtn.textContent = 'Reiniciar Nivel (R)';
            restartBtn.style.display = 'inline-block';
            restartBtn.textContent = 'Reiniciar Todo (T)';
            exitBtn.style.display = 'inline-block';
            exitBtn.textContent = 'Salir (X)';
        } else {
            pauseMenu.querySelector('h2').textContent = '¡Explotaste!';
            nextBtn.style.display = 'none';
            restartLevelBtn.style.display = 'inline-block';
            restartLevelBtn.textContent = 'Reiniciar Nivel (R)';
            restartBtn.style.display = 'inline-block';
            restartBtn.textContent = 'Reiniciar Todo (T)';
            exitBtn.style.display = 'inline-block';
            exitBtn.textContent = 'Salir (X)';
        }
        this.assignPauseMenuListeners();
    }

    nextLevel() {
        this.level++;
        this.time = 0;
        this.timerStarted = false;
        if (this.timer) clearInterval(this.timer);
        document.getElementById('level').textContent = this.level;
        document.getElementById('time').textContent = '0';
        document.getElementById('score').textContent = '0';
        this.createMaze();
        this.togglePause(false);
    }

    renderResults() {
        let resultsDiv = document.getElementById('results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'results';
            document.querySelector('.game-container').appendChild(resultsDiv);
        }
        let html = '<h3>Resultados</h3>';
        html += '<table style="width:100%;border-collapse:collapse;text-align:center;">';
        html += '<tr><th>Nivel</th><th>Huevos</th><th>Total</th><th>Segundos</th><th>Resultado</th></tr>';
        for (const r of this.results) {
            html += `<tr><td>${r.nivel}</td><td>${r.huevos}</td><td>${r.total}</td><td>${r.tiempo}</td><td>${r.resultado}</td></tr>`;
        }
        html += '</table>';
        resultsDiv.innerHTML = html;
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.time++;
                document.getElementById('time').textContent = this.time;
            }
        }, 1000);
    }

    togglePause(forcePause = null) {
        if (forcePause !== null) {
            this.isPaused = forcePause;
        } else {
            this.isPaused = !this.isPaused;
        }
        const pauseMenu = document.getElementById('pause-menu');
        pauseMenu.classList.toggle('hidden', !this.isPaused);
        if (!this.isPaused) {
            document.getElementById('next-btn').style.display = 'none';
            document.getElementById('restart-level-btn').style.display = 'inline-block';
            document.getElementById('restart-level-btn').textContent = 'Reiniciar Nivel (R)';
            document.getElementById('restart-btn').style.display = 'inline-block';
            document.getElementById('restart-btn').textContent = 'Reiniciar Todo (T)';
            document.getElementById('exit-btn').style.display = 'inline-block';
            document.getElementById('exit-btn').textContent = 'Salir (S)';
            pauseMenu.querySelector('h2').textContent = 'Pausa';
        } else {
            // Solo mostrar 'Pausa' si no es fin de nivel
            if (!pauseMenu.querySelector('h2').textContent.includes('Nivel superado') && !pauseMenu.querySelector('h2').textContent.includes('Explotaste')) {
                pauseMenu.querySelector('h2').textContent = 'Pausa';
            }
        }
        this.assignPauseMenuListeners();
    }

    restart() {
        this.score = 0;
        this.time = 0;
        this.level = 1;
        this.results = [];
        this.timerStarted = false;
        if (this.timer) clearInterval(this.timer);
        document.getElementById('score').textContent = '0';
        document.getElementById('time').textContent = '0';
        document.getElementById('level').textContent = '1';
        this.createMaze();
        this.renderResults();
        this.togglePause(false);
    }

    restartLevel() {
        this.score = 0;
        this.eggsCollected = 0;
        this.time = 0;
        this.timerStarted = false;
        if (this.timer) clearInterval(this.timer);
        document.getElementById('score').textContent = '0';
        document.getElementById('time').textContent = '0';
        this.createMaze();
        this.togglePause(false);
    }
}

// Iniciar el juego cuando se carga la página
window.addEventListener('load', () => {
    new Game();
}); 