// Game Classes and Constants
const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 600;
const TILE_SIZE = 32;

const CLASS_STATS = {
    warrior: {
        name: 'Warrior',
        health: 150,
        mana: 30,
        attack: 25,
        defense: 15,
        critRate: 5,
        icon: '🛡️',
        color: '#ff4757',
        spriteColor: '#e74c3c'
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
        color: '#667eea',
        spriteColor: '#3498db'
    },
    rogue: {
        name: 'Rogue',
        health: 100,
        mana: 50,
        attack: 30,
        defense: 8,
        critRate: 25,
        icon: '🗡️',
        color: '#ffa502',
        spriteColor: '#f39c12'
    }
};

const SKILLS = {
    warrior: [
        { name: 'Power Strike', desc: 'Deal 150% damage', bonus: '+50% ATK' },
        { name: 'Whirlwind', desc: 'Hit all nearby enemies', bonus: '+1 AoE' },
        { name: 'Shield Wall', desc: 'Block 50% damage', bonus: '+50% DEF' }
    ],
    mage: [
        { name: 'Fireball', desc: 'Cast fireball projectile', bonus: '+100% Magic' },
        { name: 'Frostbolt', desc: 'Slow enemies with ice', bonus: '-50% Speed' },
        { name: 'Mana Shield', desc: 'Convert mana to health', bonus: '+Mana Regen' }
    ],
    rogue: [
        { name: 'Backstab', desc: 'Deal 200% critical damage', bonus: '+100% CRIT' },
        { name: 'Shadow Clone', desc: 'Create a clone to fight', bonus: '+Damage' },
        { name: 'Evasion', desc: 'Dodge incoming attacks', bonus: '+Dodge' }
    ]
};

let gameInstance = null;

// Projectile class for spells
class Projectile {
    constructor(x, y, targetX, targetY, damage, type = 'fireball') {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.type = type;
        this.speed = 6;
        this.radius = 8;
        this.traveled = 0;
        this.maxDistance = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        this.particles = [];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.traveled += this.speed;
        
        // Create particle trail
        if (Math.random() < 0.7) {
            this.particles.push(new Particle(this.x, this.y, this.type));
        }
        
        // Remove old particles
        this.particles = this.particles.filter(p => p.alive);
    }
    
    draw(ctx) {
        // Draw particles first
        this.particles.forEach(p => p.draw(ctx));
        
        // Draw projectile
        if (this.type === 'fireball') {
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow effect
            ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'frostbolt') {
            ctx.fillStyle = '#87ceeb';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Frost pattern
            ctx.strokeStyle = '#4a90e2';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i;
                const x2 = this.x + Math.cos(angle) * this.radius * 1.5;
                const y2 = this.y + Math.sin(angle) * this.radius * 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }
    
    isFinished() {
        return this.traveled >= this.maxDistance;
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, type = 'fireball') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 20;
        this.maxLife = 20;
        this.alive = true;
        
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3 - 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.alive = false;
    }
    
    draw(ctx) {
        this.update();
        const alpha = this.life / this.maxLife;
        
        if (this.type === 'fireball') {
            ctx.fillStyle = `rgba(255, ${Math.floor(107 * alpha)}, ${Math.floor(53 * alpha)}, ${alpha})`;
        } else if (this.type === 'frostbolt') {
            ctx.fillStyle = `rgba(135, 206, 235, ${alpha * 0.7})`;
        } else {
            ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player {
    constructor(playerClass) {
        const stats = CLASS_STATS[playerClass];
        this.class = playerClass;
        this.name = `${stats.name} Adventurer`;
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT / 2;
        this.width = 24;
        this.height = 32;
        this.speed = 4;
        this.color = stats.color;
        this.spriteColor = stats.spriteColor;
        
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
        
        // Animation
        this.animFrame = 0;
        this.lastAttackTime = 0;
    }
    
    draw(ctx) {
        // Draw player sprite (Terraria style)
        const tileX = Math.floor(this.x);
        const tileY = Math.floor(this.y);
        
        // Body
        ctx.fillStyle = this.spriteColor;
        ctx.fillRect(tileX + 4, tileY + 4, 16, 16);
        
        // Head
        ctx.fillStyle = '#f4a460';
        ctx.fillRect(tileX + 6, tileY, 12, 8);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(tileX + 8, tileY + 2, 2, 2);
        ctx.fillRect(tileX + 14, tileY + 2, 2, 2);
        
        // Legs
        ctx.fillStyle = this.spriteColor;
        ctx.fillRect(tileX + 6, tileY + 20, 4, 8);
        ctx.fillRect(tileX + 14, tileY + 20, 4, 8);
        
        // Draw health bar above player
        const barWidth = this.width * 2;
        const barHeight = 4;
        const healthRatio = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 4, this.y - 20, barWidth, barHeight);
        
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : '#ff4757';
        ctx.fillRect(this.x - barWidth / 4, this.y - 20, barWidth * healthRatio, barHeight);
        
        // Draw mana bar
        if (this.maxMana > 0) {
            const manaRatio = this.mana / this.maxMana;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barWidth / 4, this.y - 14, barWidth, barHeight);
            ctx.fillStyle = '#667eea';
            ctx.fillRect(this.x - barWidth / 4, this.y - 14, barWidth * manaRatio, barHeight);
        }
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
        if (this.magic) this.magic += 5;
    }
    
    isAlive() {
        return this.health > 0;
    }
}

class Enemy {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.speed = 2 + (level * 0.5);
        this.spriteColor = this.getEnemyColor(level);
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
        if (level <= 2) return '#e74c3c';
        if (level <= 5) return '#c0392b';
        return '#a93226';
    }
    
    draw(ctx) {
        // Draw enemy sprite (Terraria style goblin/imp)
        const tileX = Math.floor(this.x);
        const tileY = Math.floor(this.y);
        
        // Body
        ctx.fillStyle = this.spriteColor;
        ctx.fillRect(tileX + 4, tileY + 8, 16, 16);
        
        // Head
        ctx.fillStyle = this.spriteColor;
        ctx.fillRect(tileX + 5, tileY, 14, 10);
        
        // Eyes (evil looking)
        ctx.fillStyle = '#fff';
        ctx.fillRect(tileX + 7, tileY + 2, 3, 3);
        ctx.fillRect(tileX + 14, tileY + 2, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(tileX + 8, tileY + 3, 1, 1);
        ctx.fillRect(tileX + 15, tileY + 3, 1, 1);
        
        // Spikes/horns
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(tileX + 6, tileY - 2, 2, 3);
        ctx.fillRect(tileX + 16, tileY - 2, 2, 3);
        
        // Legs
        ctx.fillStyle = '#333';
        ctx.fillRect(tileX + 6, tileY + 24, 4, 6);
        ctx.fillRect(tileX + 14, tileY + 24, 4, 6);
        
        // Draw health bar
        const barWidth = this.width * 2;
        const barHeight = 3;
        const healthRatio = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 4, this.y - 12, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth / 4, this.y - 12, barWidth * healthRatio, barHeight);
        
        // Draw level
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Lv' + this.level, this.x + this.width / 2, this.y + 16);
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
        // Draw Terraria-style stone blocks
        const tileX = Math.floor(this.x / TILE_SIZE) * TILE_SIZE;
        const tileY = Math.floor(this.y / TILE_SIZE) * TILE_SIZE;
        const tilesX = Math.ceil(this.width / TILE_SIZE);
        const tilesY = Math.ceil(this.height / TILE_SIZE);
        
        for (let i = 0; i < tilesX; i++) {
            for (let j = 0; j < tilesY; j++) {
                const px = tileX + i * TILE_SIZE;
                const py = tileY + j * TILE_SIZE;
                
                // Stone texture
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                
                // Details
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                
                // Cracks for detail
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + 5, py);
                ctx.lineTo(px + 5, py + TILE_SIZE);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(px, py + 5);
                ctx.lineTo(px + TILE_SIZE, py + 5);
                ctx.stroke();
            }
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.obstacles = [];
        this.projectiles = [];
        this.keys = {};
        this.isPaused = false;
        this.isGameOver = false;
        this.isWon = false;
        this.attackCooldown = 0;
        this.mousePos = { x: 0, y: 0 };
        
        this.setupEventListeners();
        this.showClassSelection();
    }
    
    setupEventListeners() {
        // Class selection
        document.querySelectorAll('.class-card').forEach(card => {
            card.querySelector('.select-btn').addEventListener('click', (e) => {
                const classType = card.dataset.class;
                console.log('Starting game with class:', classType);
                this.startGame(classType);
            });
        });
        
        // Menu buttons
        const statsBtn = document.getElementById('statsBtn');
        if (statsBtn) statsBtn.addEventListener('click', (e) => {
            console.log('Stats clicked');
            this.showStats();
        });
        
        const inventoryBtn = document.getElementById('inventoryBtn');
        if (inventoryBtn) inventoryBtn.addEventListener('click', (e) => {
            console.log('Inventory clicked');
            this.showInventory();
        });
        
        const skillsBtn = document.getElementById('skillsBtn');
        if (skillsBtn) skillsBtn.addEventListener('click', (e) => {
            console.log('Skills clicked');
            this.showSkills();
        });
        
        const pauseGameBtn = document.getElementById('pauseGameBtn');
        if (pauseGameBtn) pauseGameBtn.addEventListener('click', (e) => {
            console.log('Pause clicked');
            this.togglePause();
        });
        
        // Close buttons
        const closeStats = document.getElementById('closeStats');
        if (closeStats) closeStats.addEventListener('click', () => this.hideScreen('statsScreen'));
        
        const closeInventory = document.getElementById('closeInventory');
        if (closeInventory) closeInventory.addEventListener('click', () => this.hideScreen('inventoryScreen'));
        
        const closeSkills = document.getElementById('closeSkills');
        if (closeSkills) closeSkills.addEventListener('click', () => this.hideScreen('skillsScreen'));
        
        // Pause menu buttons
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
        
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
        
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => this.returnToMenu());
        
        // Game over buttons
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) retryBtn.addEventListener('click', () => this.restartGame());
        
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) menuBtn.addEventListener('click', () => this.returnToMenu());
        
        // Mouse tracking for spell targeting
        document.addEventListener('mousemove', (e) => {
            this.mousePos = { x: e.clientX, y: e.clientY };
        });
        
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
        console.log('Game starting with class:', playerClass);
        this.player = new Player(playerClass);
        this.enemies = [];
        this.obstacles = [];
        this.projectiles = [];
        this.isPaused = false;
        this.isGameOver = false;
        this.isWon = false;
        this.attackCooldown = 0;
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
            this.attackCooldown = 30;
        }
    }
    
    playerAttack() {
        if (this.player.class === 'mage') {
            this.castSpell();
        } else {
            this.meleeAttack();
        }
    }
    
    meleeAttack() {
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
    
    castSpell() {
        // Get canvas position for accurate spell targeting
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        const canvasX = this.mousePos.x - rect.left;
        const canvasY = this.mousePos.y - rect.top;
        
        // Fireball spell
        if (this.player.mana >= 15) {
            const projectile = new Projectile(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                canvasX,
                canvasY,
                this.player.magic + 20,
                'fireball'
            );
            this.projectiles.push(projectile);
            this.player.mana -= 15;
            this.attackCooldown = 25;
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
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update();
            
            // Check projectile collisions with enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dx = proj.x - (enemy.x + enemy.width / 2);
                const dy = proj.y - (enemy.y + enemy.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < proj.radius + 15) {
                    enemy.takeDamage(proj.damage);
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
            
            // Remove finished projectiles
            if (proj.isFinished()) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update enemies
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
        // Draw background (Terraria dirt)
        this.ctx.fillStyle = '#8b7355';
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        // Draw grid for Terraria feel
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < SCREEN_WIDTH; x += TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, SCREEN_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y < SCREEN_HEIGHT; y += TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(SCREEN_WIDTH, y);
            this.ctx.stroke();
        }
        
        // Draw obstacles
        this.obstacles.forEach(obs => obs.draw(this.ctx));
        
        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(this.ctx));
        
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
        if (!this.player) return;
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
        if (!this.player) return;
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
        if (!this.player) return;
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
        if (!this.player) return;
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
        if (!this.player) return;
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
        if (!this.player) return;
        this.startGame(this.player.class);
    }
    
    returnToMenu() {
        this.isGameOver = false;
        this.isWon = false;
        this.isPaused = false;
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
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
    gameInstance = new Game();
});