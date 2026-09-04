// Game Constants
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const FPS = 60;

// Colors
const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    BLUE: '#0000FF',
    RED: '#FF0000',
    GREEN: '#00FF00',
    GRAY: '#808080',
    YELLOW: '#FFFF00'
};

class Character {
    constructor(x, y, width, height, speed, maxHealth, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.color = color;
    }

    draw(ctx) {
        // Draw character
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw health bar
        const barWidth = this.width;
        const barHeight = 5;
        const healthRatio = this.health / this.maxHealth;

        ctx.fillStyle = COLORS.RED;
        ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);

        ctx.fillStyle = COLORS.GREEN;
        ctx.fillRect(this.x, this.y - 10, barWidth * healthRatio, barHeight);
    }

    move(direction, obstacles) {
        const [dx, dy] = direction;
        let newX = this.x + dx * this.speed;
        let newY = this.y + dy * this.speed;

        // Boundary checking
        if (newX >= 0 && newX + this.width <= SCREEN_WIDTH) {
            if (!this.checkCollision(newX, this.y, obstacles)) {
                this.x = newX;
            }
        }

        if (newY >= 0 && newY + this.height <= SCREEN_HEIGHT) {
            if (!this.checkCollision(this.x, newY, obstacles)) {
                this.y = newY;
            }
        }
    }

    checkCollision(x, y, obstacles) {
        if (!obstacles) return false;
        const rect = { x, y, w: this.width, h: this.height };
        for (let obstacle of obstacles) {
            if (this.rectsCollide(rect, { x: obstacle.x, y: obstacle.y, w: obstacle.width, h: obstacle.height })) {
                return true;
            }
        }
        return false;
    }

    rectsCollide(r1, r2) {
        return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    isAlive() {
        return this.health > 0;
    }
}

class Player extends Character {
    constructor(x, y) {
        super(x, y, 30, 30, 5, 100, COLORS.BLUE);
        this.attackPower = 20;
        this.experience = 0;
        this.level = 1;
    }

    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= 100 * this.level) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level += 1;
        this.experience = 0;
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.attackPower += 5;
        console.log(`Level up! Now level ${this.level}`);
    }
}

class Enemy extends Character {
    constructor(x, y, level = 1) {
        const health = 30 + (level * 10);
        super(x, y, 25, 25, 2, health, COLORS.RED);
        this.level = level;
        this.attackPower = 10 + (level * 3);
        this.moveCounter = 0;
    }

    aiMove(player, obstacles) {
        this.moveCounter += 1;
        if (this.moveCounter < 30) return;

        this.moveCounter = 0;
        const dx = player.x - this.x;
        const dy = player.y - this.y;

        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? [1, 0] : [-1, 0];
        } else {
            direction = dy > 0 ? [0, 1] : [0, -1];
        }

        this.move(direction, obstacles);
    }

    canAttackPlayer(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 50;
    }
}

class Obstacle {
    constructor(x, y, width = 40, height = 40) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = new Player(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        this.enemies = [];
        this.obstacles = [];
        this.attackCooldown = 0;
        this.gameOver = false;
        this.won = false;
        this.paused = false;
        this.keys = {};

        this.spawnEnemies(3);
        this.spawnObstacles();
        this.setupEventListeners();
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            let validSpawn = false;
            while (!validSpawn) {
                x = Math.random() * (SCREEN_WIDTH - 25);
                y = Math.random() * (SCREEN_HEIGHT - 25);
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                if (Math.abs(dx) > 150 && Math.abs(dy) > 150) {
                    validSpawn = true;
                }
            }
            const level = Math.floor(Math.random() * (this.player.level + 1)) + 1;
            this.enemies.push(new Enemy(x, y, level));
        }
    }

    spawnObstacles() {
        const positions = [
            [200, 200], [600, 150], [150, 450],
            [500, 400], [300, 300], [700, 500]
        ];
        for (let [x, y] of positions) {
            this.obstacles.push(new Obstacle(x, y));
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    handleInput() {
        const keys = this.keys;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.player.move([0, -1], this.obstacles);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.player.move([0, 1], this.obstacles);
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.player.move([-1, 0], this.obstacles);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.player.move([1, 0], this.obstacles);
        }

        if (keys[' '] && this.attackCooldown === 0) {
            this.playerAttack();
            this.attackCooldown = 30;
        }
    }

    playerAttack() {
        for (let enemy of this.enemies) {
            if (enemy.canAttackPlayer(this.player)) {
                const damage = this.player.attackPower + Math.floor(Math.random() * 11 - 5);
                enemy.takeDamage(damage);
            }
        }
    }

    update() {
        if (this.paused || this.gameOver || this.won) return;

        this.handleInput();

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1;
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive()) {
                this.enemies.splice(i, 1);
                this.player.gainExperience(50 * enemy.level);
            } else {
                enemy.aiMove(this.player, this.obstacles);
                if (enemy.canAttackPlayer(this.player)) {
                    const damage = enemy.attackPower + Math.floor(Math.random() * 7 - 3);
                    this.player.takeDamage(damage);
                }
            }
        }

        if (!this.player.isAlive()) {
            this.gameOver = true;
        } else if (this.enemies.length === 0) {
            this.won = true;
        }

        this.updateUI();
    }

    draw() {
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        for (let obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }

        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        this.player.draw(this.ctx);

        // Draw UI text
        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = '14px Arial';
        this.ctx.fillText(
            `HP: ${this.player.health}/${this.player.maxHealth} | Level: ${this.player.level} | XP: ${this.player.experience}`,
            10, 25
        );
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 45);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.ctx.fillStyle = COLORS.RED;
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER - YOU LOST!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            this.ctx.textAlign = 'left';
        } else if (this.won) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.ctx.fillStyle = COLORS.YELLOW;
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('YOU WON!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            this.ctx.textAlign = 'left';
        }

        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.ctx.fillStyle = COLORS.WHITE;
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            this.ctx.textAlign = 'left';
        }
    }

    updateUI() {
        document.getElementById('health').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('experience').textContent = this.player.experience;
        document.getElementById('enemies').textContent = this.enemies.length;
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
    }

    restart() {
        this.player = new Player(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        this.enemies = [];
        this.obstacles = [];
        this.spawnEnemies(3);
        this.spawnObstacles();
        this.attackCooldown = 0;
        this.gameOver = false;
        this.won = false;
        this.paused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        this.updateUI();
    }

    run() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    game.run();
});