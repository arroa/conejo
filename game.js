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
        this.exit = null;
        
        this.init();
    }

    init() {
        this.createMaze();
        this.setupEventListeners();
        this.startTimer();
    }

    createMaze() {
        const mazeSize = 5 + this.level * 2;
        const eggCount = 2 + this.level;
        
        this.maze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(0));
        
        // Crear paredes exteriores
        for (let i = 0; i < mazeSize; i++) {
            for (let j = 0; j < mazeSize; j++) {
                if (i === 0 || i === mazeSize - 1 || j === 0 || j === mazeSize - 1) {
                    this.maze[i][j] = 1; // Pared
                }
            }
        }

        // Agregar paredes internas
        for (let i = 2; i < mazeSize - 2; i += 2) {
            for (let j = 2; j < mazeSize - 2; j += 2) {
                this.maze[i][j] = 1; // Pared
                
                // Agregar paredes horizontales o verticales aleatorias
                if (Math.random() > 0.5) {
                    this.maze[i][j-1] = 1;
                } else {
                    this.maze[i-1][j] = 1;
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

        // Colocar huevos
        this.eggs = [];
        for (let i = 0; i < eggCount; i++) {
            let eggX, eggY;
            do {
                eggX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
                eggY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            } while (this.maze[eggY][eggX] !== 0 || 
                    (eggX === rabbitX && eggY === rabbitY));
            this.eggs.push({ x: eggX, y: eggY });
        }

        // Colocar salida
        let exitX, exitY;
        do {
            exitX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
            exitY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
        } while (this.maze[exitY][exitX] !== 0 || 
                (exitX === rabbitX && exitY === rabbitY));
        this.exit = { x: exitX, y: exitY };

        this.renderMaze();
    }

    renderMaze() {
        const mazeElement = document.getElementById('maze');
        mazeElement.style.gridTemplateColumns = `repeat(${this.maze.length}, 30px)`;
        mazeElement.innerHTML = '';

        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else if (x === this.rabbit.x && y === this.rabbit.y) {
                    cell.classList.add('rabbit');
                } else if (this.eggs.some(egg => egg.x === x && egg.y === y)) {
                    cell.classList.add('egg');
                } else if (x === this.exit.x && y === this.exit.y) {
                    cell.classList.add('exit');
                }
                
                mazeElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isPaused) return;

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

            if (this.maze[newY][newX] !== 1) {
                this.rabbit.x = newX;
                this.rabbit.y = newY;
                this.checkCollisions();
                this.renderMaze();
            }
        });

        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('exit-btn').addEventListener('click', () => window.location.reload());
    }

    checkCollisions() {
        // Verificar colisión con huevos
        this.eggs = this.eggs.filter(egg => {
            if (egg.x === this.rabbit.x && egg.y === this.rabbit.y) {
                this.score++;
                document.getElementById('score').textContent = this.score;
                return false;
            }
            return true;
        });

        // Verificar si todos los huevos fueron recolectados
        if (this.eggs.length === 0 && 
            this.rabbit.x === this.exit.x && 
            this.rabbit.y === this.exit.y) {
            this.nextLevel();
        }
    }

    nextLevel() {
        this.level++;
        document.getElementById('level').textContent = this.level;
        this.createMaze();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.time++;
                document.getElementById('time').textContent = this.time;
            }
        }, 1000);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseMenu = document.getElementById('pause-menu');
        pauseMenu.classList.toggle('hidden');
    }

    restart() {
        this.score = 0;
        this.time = 0;
        this.level = 1;
        document.getElementById('score').textContent = '0';
        document.getElementById('time').textContent = '0';
        document.getElementById('level').textContent = '1';
        this.createMaze();
        this.togglePause();
    }
}

// Iniciar el juego cuando se carga la página
window.addEventListener('load', () => {
    new Game();
}); 