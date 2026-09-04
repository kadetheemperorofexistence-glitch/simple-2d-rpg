// Game Classes and Constants
const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 600;

const CLASS_STATS = {
    warrior: {
        name: 'Warrior',
        health: 150,
        mana: 30,
        attack: 25,
        defense: 15,
        critRate: 5,
        icon: '🛡️',
        color: '#ff4757'
    },
    mage: {
        name: 'Mage',
        health: 80,
        mana: 100,
        attack: 12,
        defense: 5,
        magic: 35,
        critRate: 10,
        icon: '🔮',
        color: '#667eea'
    },
    rogue: {
        name: 'Rogue',
        health: 100,
        mana: 50,
        attack: 30,
        defense: 8,
        critRate: 25,
        icon: '🗡️',
        color: '#ffa502'
    }
};

const SKILLS = {
    warrior: [
        { name: 'Power Strike', desc: 'Deal 150% damage', bonus: '+50% ATK' },
        { name: 'Whirlwind', desc: 'Hit all nearby enemies', bonus: '+1 AoE' },
        { name: 'Shield Wall', desc: 'Block 50% damage', bonus: '+50% DEF' }
    ],
    mage: [
        { name: 'Fireball', desc: 'Deal magic damage in area', bonus: '+100% Magic' },
        { name: 'Frostbolt', desc: 'Slow enemies', bonus: '-50% Speed' },
        { name: 'Mana Shield', desc: 'Convert mana to health', bonus: '+Mana Regen' }
    ],
    rogue: [
        { name: 'Backstab', desc: 'Deal 200% critical damage', bonus: '+100% CRIT' },
        { name: 'Shadow Clone', desc: 'Create a clone to fight', bonus: '+Damage' },
        { name: 'Evasion', desc: 'Dodge incoming attacks', bonus: '+Dodge' }
    ]
};

class Player {
    constructor(playerClass) {
        const stats = CLASS_STATS[playerClass];
        this.class = playerClass;
        this.name = `${stats.name} Adventurer`;
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT / 2;
        this.width = 30;
        this.height = 30;
        this.speed = 4;
        this.color = stats.color;
        
        // Stats
        this.maxHealth = stats.health;
        this.health = stats.health;
        this.maxMana = stats.mana;
        this.mana = stats.mana;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.critRate = stats.critRate;
        this.magic = stats.magic || 0;
        
        // Progression
        this.level = 1;
        this.experience = 0;
        this.gold = 0;
        this.enemiesDefeated = 0;
        
        // Equipment
        this.equipment = {};
        this.inventory = [];
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw health bar above player
        const barWidth = this.width * 2;
        const barHeight = 4;
        const healthRatio = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 4, this.y - 15, barWidth, barHeight);
        
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : '#ff4757';
        ctx.fillRect(this.x - barWidth / 4, this.y - 15, barWidth * healthRatio, barHeight);
    }
    
    move(direction, obstacles) {
        const [dx, dy] = direction;
        let newX = this.x + dx * this.speed;
        let newY = this.y + dy * this.speed;
        
        if (newX >= 0 && newX + this.width <= SCREEN_WIDTH && !this.checkCollision(newX, this.y, obstacles)) {
            this.x = newX;
        }
        if (newY >= 0 && newY + this.height <= SCREEN_HEIGHT && !this.checkCollision(this.x, newY, obstacles)) {
            this.y = newY;
        }
    }
    
    checkCollision(x, y, obstacles) {
        if (!obstacles) return false;
        const rect = { x, y, w: this.width, h: this.height };
        for (let obs of obstacles) {
            if (this.rectsCollide(rect, { x: obs.x, y: obs.y, w: obs.width, h: obs.height })) {
                return true;
            }
        }
        return false;
    }
    
    rectsCollide(r1, r2) {
        return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
    }
    
    healDamage(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    gainExperience(amount) {
        this.experience += amount;
        const requiredExp = 100 * this.level;
        if (this.experience >= requiredExp) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level += 1;
        this.experience = 0;
        this.maxHealth += 30;
        this.health = this.maxHealth;
        this.maxMana += 20;
        this.mana = this.maxMana;
        this.attack += 8;
        this.defense += 3;
        this.critRate += 2;
    }
    
    isAlive() {
        return this.health > 0;
    }
}

class Enemy {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 2 + (level * 0.5);
        this.color = this.getEnemyColor(level);
        this.level = level;
        
        // Scale stats with level
        this.maxHealth = 40 + (level * 20);
        this.health = this.maxHealth;
        this.attack = 15 + (level * 5);
        this.defense = 3 + (level * 2);
        this.critRate = 5 + level;
        
        this.moveCounter = 0;
        this.goldReward = 50 * level;
        this.expReward = 75 * level;
    }
    
    getEnemyColor(level) {
        if (level <= 2) return '#ff6b7a';
        if (level <= 5) return '#ff4757';
        return '#c41e3a';
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw level
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.level, this.x + this.width / 2, this.y + this.height / 2 + 3);
        
        // Draw health bar
        const barWidth = this.width * 1.5;
        const barHeight = 3;
        const healthRatio = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 4, this.y - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth / 4, this.y - 10, barWidth * healthRatio, barHeight);
    }
    
    aiMove(player, obstacles) {
        this.moveCounter += 1;
        if (this.moveCounter < 20) return;
        
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
    
    move(direction, obstacles) {
        const [dx, dy] = direction;
        let newX = this.x + dx * this.speed;
        let newY = this.y + dy * this.speed;
        
        if (newX >= 0 && newX + this.width <= SCREEN_WIDTH && !this.checkCollision(newX, this.y, obstacles)) {
            this.x = newX;
        }
        if (newY >= 0 && newY + this.height <= SCREEN_HEIGHT && !this.checkCollision(this.x, newY, obstacles)) {
            this.y = newY;
        }
    }
    
    checkCollision(x, y, obstacles) {
        if (!obstacles) return false;
        const rect = { x, y, w: this.width, h: this.height };
        for (let obs of obstacles) {
            if (this.rectsCollide(rect, { x: obs.x, y: obs.y, w: obs.width, h: obs.height })) {
                return true;
            }
        }
        return false;
    }
    
    rectsCollide(r1, r2) {
        return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
    }
    
    canAttackPlayer(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 60;
    }
    
    isAlive() {
        return this.health > 0;
    }
}

class Obstacle {
    constructor(x, y, width = 50, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#555';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add pattern
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.obstacles = [];
        this.keys = {};
        this.isPaused = false;
        this.isGameOver = false;
        this.isWon = false;
        this.attackCooldown = 0;
        
        this.setupEventListeners();
        this.showClassSelection();
    }
    
    setupEventListeners() {
        // Class selection
        document.querySelectorAll('.class-card').forEach(card => {
            card.querySelector('.select-btn').addEventListener('click', () => {
                this.startGame(card.dataset.class);
            });
        });
        
        // Menu buttons
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
        document.getElementById('inventoryBtn').addEventListener('click', () => this.showInventory());
        document.getElementById('skillsBtn').addEventListener('click', () => this.showSkills());
        document.getElementById('pauseGameBtn').addEventListener('click', () => this.togglePause());
        
        document.getElementById('closeStats').addEventListener('click', () => this.hideScreen('statsScreen'));
        document.getElementById('closeInventory').addEventListener('click', () => this.hideScreen('inventoryScreen'));
        document.getElementById('closeSkills').addEventListener('click', () => this.hideScreen('skillsScreen'));
        
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.returnToMenu());
        
        document.getElementById('retryBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }
    
    hideScreen(screenId) {
        document.getElementById(screenId).classList.add('hidden');
    }
    
    showClassSelection() {
        this.showScreen('classScreen');
    }
    
    startGame(playerClass) {
        this.player = new Player(playerClass);
        this.enemies = [];
        this.obstacles = [];
        this.spawnEnemies(5 + this.player.level);
        this.spawnObstacles();
        this.showScreen('gameScreen');
        this.run();
    }
    
    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x, y, valid = false;
            while (!valid) {
                x = Math.random() * (SCREEN_WIDTH - 25);
                y = Math.random() * (SCREEN_HEIGHT - 25);
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                if (Math.sqrt(dx * dx + dy * dy) > 200) valid = true;
            }
            const level = Math.max(1, this.player.level - 1 + Math.floor(Math.random() * 3));
            this.enemies.push(new Enemy(x, y, level));
        }
    }
    
    spawnObstacles() {
        const positions = [
            [100, 100], [500, 80], [800, 150], [900, 400],
            [100, 450], [400, 350], [700, 500], [200, 250]
        ];
        positions.forEach(([x, y]) => this.obstacles.push(new Obstacle(x, y)));
    }
    
    handleInput() {
        if (this.isPaused || this.isGameOver || this.isWon) return;
        
        const keys = this.keys;
        if (keys['arrowup'] || keys['w']) this.player.move([0, -1], this.obstacles);
        if (keys['arrowdown'] || keys['s']) this.player.move([0, 1], this.obstacles);
        if (keys['arrowleft'] || keys['a']) this.player.move([-1, 0], this.obstacles);
        if (keys['arrowright'] || keys['d']) this.player.move([1, 0], this.obstacles);
        
        if (keys[' '] && this.attackCooldown === 0) {
            this.playerAttack();
            this.attackCooldown = 40;
        }
    }
    
    playerAttack() {
        for (let enemy of this.enemies) {
            if (this.distanceTo(this.player, enemy) < 70) {
                let damage = this.player.attack;
                if (Math.random() * 100 < this.player.critRate) {
                    damage *= 1.5;
                }
                enemy.takeDamage(damage);
            }
        }
    }
    
    distanceTo(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    update() {
        if (this.isPaused || this.isGameOver || this.isWon) return;
        
        this.handleInput();
        
        if (this.attackCooldown > 0) this.attackCooldown--;
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive()) {
                this.enemies.splice(i, 1);
                this.player.gold += enemy.goldReward;
                this.player.gainExperience(enemy.expReward);
                this.player.enemiesDefeated++;
            } else {
                enemy.aiMove(this.player, this.obstacles);
                if (enemy.canAttackPlayer(this.player)) {
                    let damage = enemy.attack;
                    if (Math.random() * 100 < enemy.critRate) damage *= 1.5;
                    this.player.takeDamage(damage);
                }
            }
        }
        
        if (!this.player.isAlive()) {
            this.gameOver();
        } else if (this.enemies.length === 0) {
            this.won();
        }
        
        this.updateUI();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        // Draw obstacles
        this.obstacles.forEach(obs => obs.draw(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw pause overlay
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        }
    }
    
    updateUI() {
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('healthFill').style.width = (this.player.health / this.player.maxHealth * 100) + '%';
        document.getElementById('healthText').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('manaFill').style.width = (this.player.mana / this.player.maxMana * 100) + '%';
        document.getElementById('manaText').textContent = `${this.player.mana}/${this.player.maxMana}`;
        document.getElementById('hudLevel').textContent = this.player.level;
        document.getElementById('hudExp').textContent = this.player.experience;
        document.getElementById('hudGold').textContent = this.player.gold;
        document.getElementById('hudEnemies').textContent = this.enemies.length;
    }
    
    showStats() {
        const p = this.player;
        document.getElementById('statClass').textContent = CLASS_STATS[p.class].name;
        document.getElementById('statLevel').textContent = p.level;
        document.getElementById('statExp').textContent = p.experience;
        document.getElementById('statGold').textContent = p.gold;
        document.getElementById('statHealth').textContent = `${p.health}/${p.maxHealth}`;
        document.getElementById('statMana').textContent = `${p.mana}/${p.maxMana}`;
        document.getElementById('statAttack').textContent = p.attack;
        document.getElementById('statDefense').textContent = p.defense;
        document.getElementById('statCrit').textContent = p.critRate + '%';
        document.getElementById('statEnemiesDefeated').textContent = p.enemiesDefeated;
        this.showScreen('statsScreen');
    }
    
    showInventory() {
        const equipList = document.getElementById('equipmentList');
        equipList.innerHTML = Object.keys(this.player.equipment).length > 0 ? 
            Object.entries(this.player.equipment).map(([key, item]) => 
                `<div class="item"><div class="item-name">${item.name}</div><div class="item-stats">${item.stats}</div></div>`
            ).join('') : '<p class="empty-msg">No equipment equipped</p>';
        
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = this.player.inventory.length > 0 ? 
            this.player.inventory.map(item => 
                `<div class="item"><div class="item-name">${item.name}</div></div>`
            ).join('') : '<p class="empty-msg">No items in inventory</p>';
        
        this.showScreen('inventoryScreen');
    }
    
    showSkills() {
        const skillsList = document.getElementById('skillsList');
        const skills = SKILLS[this.player.class] || [];
        skillsList.innerHTML = skills.map(skill => 
            `<div class="skill-card">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-desc">${skill.desc}</div>
                <div class="skill-bonus">${skill.bonus}</div>
            </div>`
        ).join('');
        this.showScreen('skillsScreen');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.showScreen('pauseScreen');
        } else {
            this.hideScreen('pauseScreen');
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        const stats = document.getElementById('gameOverStats');
        stats.innerHTML = `
            <p><strong>Class:</strong> ${CLASS_STATS[this.player.class].name}</p>
            <p><strong>Final Level:</strong> ${this.player.level}</p>
            <p><strong>Gold Earned:</strong> ${this.player.gold}</p>
            <p><strong>Enemies Defeated:</strong> ${this.player.enemiesDefeated}</p>
        `;
        document.getElementById('gameOverTitle').textContent = '💀 DEFEAT';
        this.showScreen('gameOverScreen');
    }
    
    won() {
        this.isWon = true;
        const stats = document.getElementById('gameOverStats');
        stats.innerHTML = `
            <p><strong>Class:</strong> ${CLASS_STATS[this.player.class].name}</p>
            <p><strong>Final Level:</strong> ${this.player.level}</p>
            <p><strong>Gold Earned:</strong> ${this.player.gold}</p>
            <p><strong>Enemies Defeated:</strong> ${this.player.enemiesDefeated}</p>
        `;
        document.getElementById('gameOverTitle').textContent = '🎉 VICTORY!';
        this.showScreen('gameOverScreen');
    }
    
    restartGame() {
        this.startGame(this.player.class);
    }
    
    returnToMenu() {
        this.isGameOver = false;
        this.isWon = false;
        this.isPaused = false;
        this.showScreen('classScreen');
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

// Initialize game
window.addEventListener('load', () => {
    new Game();
});