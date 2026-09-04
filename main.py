import pygame
import random
from enum import Enum
from dataclasses import dataclass

# Initialize Pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
GRAY = (128, 128, 128)
YELLOW = (255, 255, 0)

# FPS
FPS = 60
clock = pygame.time.Clock()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Simple 2D RPG")
font = pygame.font.Font(None, 36)
small_font = pygame.font.Font(None, 24)


class Direction(Enum):
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)


@dataclass
class Character:
    x: float
    y: float
    width: int
    height: int
    speed: int
    max_health: int
    health: int
    color: tuple

    def draw(self, surface):
        pygame.draw.rect(surface, self.color, (self.x, self.y, self.width, self.height))
        # Draw health bar
        bar_width = self.width
        bar_height = 5
        health_ratio = self.health / self.max_health
        pygame.draw.rect(surface, RED, (self.x, self.y - 10, bar_width, bar_height))
        pygame.draw.rect(surface, GREEN, (self.x, self.y - 10, bar_width * health_ratio, bar_height))

    def move(self, direction: Direction, obstacles=None):
        dx, dy = direction.value
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed

        # Boundary checking
        if 0 <= new_x <= SCREEN_WIDTH - self.width:
            if not self._check_collision(new_x, self.y, obstacles):
                self.x = new_x

        if 0 <= new_y <= SCREEN_HEIGHT - self.height:
            if not self._check_collision(self.x, new_y, obstacles):
                self.y = new_y

    def _check_collision(self, x, y, obstacles):
        if obstacles is None:
            return False
        rect = pygame.Rect(x, y, self.width, self.height)
        for obstacle in obstacles:
            if rect.colliderect(pygame.Rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)):
                return True
        return False

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def take_damage(self, damage):
        self.health = max(0, self.health - damage)

    def heal(self, amount):
        self.health = min(self.max_health, self.health + amount)

    def is_alive(self):
        return self.health > 0


class Player(Character):
    def __init__(self, x, y):
        super().__init__(x, y, 30, 30, 5, 100, 100, BLUE)
        self.attack_power = 20
        self.experience = 0
        self.level = 1

    def gain_experience(self, amount):
        self.experience += amount
        if self.experience >= 100 * self.level:
            self.level_up()

    def level_up(self):
        self.level += 1
        self.experience = 0
        self.max_health += 20
        self.health = self.max_health
        self.attack_power += 5
        print(f"Level up! Now level {self.level}")


class Enemy(Character):
    def __init__(self, x, y, level=1):
        health = 30 + (level * 10)
        super().__init__(x, y, 25, 25, 2, health, health, RED)
        self.level = level
        self.attack_power = 10 + (level * 3)
        self.move_counter = 0

    def ai_move(self, player, obstacles=None):
        self.move_counter += 1
        if self.move_counter < 30:
            return

        self.move_counter = 0
        dx = player.x - self.x
        dy = player.y - self.y

        if abs(dx) > abs(dy):
            direction = Direction.RIGHT if dx > 0 else Direction.LEFT
        else:
            direction = Direction.DOWN if dy > 0 else Direction.UP

        self.move(direction, obstacles)

    def can_attack_player(self, player):
        distance = ((self.x - player.x) ** 2 + (self.y - player.y) ** 2) ** 0.5
        return distance < 50


class Obstacle:
    def __init__(self, x, y, width=40, height=40):
        self.x = x
        self.y = y
        self.width = width
        self.height = height

    def draw(self, surface):
        pygame.draw.rect(surface, GRAY, (self.x, self.y, self.width, self.height))


class Game:
    def __init__(self):
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
        self.enemies = []
        self.obstacles = []
        self.spawn_enemies(3)
        self.spawn_obstacles()
        self.attack_cooldown = 0
        self.game_over = False
        self.won = False

    def spawn_enemies(self, count):
        for _ in range(count):
            while True:
                x = random.randint(0, SCREEN_WIDTH - 25)
                y = random.randint(0, SCREEN_HEIGHT - 25)
                if abs(x - self.player.x) > 150 and abs(y - self.player.y) > 150:
                    break
            level = random.randint(1, self.player.level + 1)
            self.enemies.append(Enemy(x, y, level))

    def spawn_obstacles(self):
        positions = [
            (200, 200), (600, 150), (150, 450),
            (500, 400), (300, 300), (700, 500)
        ]
        for x, y in positions:
            self.obstacles.append(Obstacle(x, y))

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.player.move(Direction.UP, self.obstacles)
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.player.move(Direction.DOWN, self.obstacles)
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.player.move(Direction.LEFT, self.obstacles)
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.player.move(Direction.RIGHT, self.obstacles)

        # Attack (space bar)
        if keys[pygame.K_SPACE] and self.attack_cooldown == 0:
            self.player_attack()
            self.attack_cooldown = 30

        return True

    def player_attack(self):
        for enemy in self.enemies:
            if enemy.can_attack_player(self.player):
                damage = self.player.attack_power + random.randint(-5, 5)
                enemy.take_damage(damage)

    def update(self):
        # Update attack cooldown
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1

        # Enemy AI and attacks
        for enemy in self.enemies[:]:
            if not enemy.is_alive():
                self.enemies.remove(enemy)
                self.player.gain_experience(50 * enemy.level)
            else:
                enemy.ai_move(self.player, self.obstacles)
                if enemy.can_attack_player(self.player):
                    damage = enemy.attack_power + random.randint(-3, 3)
                    self.player.take_damage(damage)

        # Check game over conditions
        if not self.player.is_alive():
            self.game_over = True
        elif len(self.enemies) == 0:
            self.won = True

    def draw(self):
        screen.fill(BLACK)

        # Draw obstacles
        for obstacle in self.obstacles:
            obstacle.draw(screen)

        # Draw enemies
        for enemy in self.enemies:
            enemy.draw(screen)

        # Draw player
        self.player.draw(screen)

        # Draw UI
        ui_text = f"HP: {self.player.health}/{self.player.max_health} | Level: {self.player.level} | XP: {self.player.experience}"
        ui_surface = small_font.render(ui_text, True, WHITE)
        screen.blit(ui_surface, (10, 10))

        enemies_text = f"Enemies: {len(self.enemies)}"
        enemies_surface = small_font.render(enemies_text, True, WHITE)
        screen.blit(enemies_surface, (10, 40))

        # Draw game over or won message
        if self.game_over:
            game_over_text = font.render("GAME OVER - You Lost!", True, RED)
            screen.blit(game_over_text, (SCREEN_WIDTH // 2 - 200, SCREEN_HEIGHT // 2))
        elif self.won:
            won_text = font.render("YOU WON!", True, YELLOW)
            screen.blit(won_text, (SCREEN_WIDTH // 2 - 150, SCREEN_HEIGHT // 2))

        pygame.display.flip()

    def run(self):
        running = True
        while running:
            running = self.handle_input()
            self.update()
            self.draw()
            clock.tick(FPS)

        pygame.quit()


if __name__ == "__main__":
    game = Game()
    game.run()