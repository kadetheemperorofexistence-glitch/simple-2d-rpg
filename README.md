# Simple 2D RPG

A basic 2D RPG game built with Python and Pygame featuring player movement, enemy AI, combat system, and progression.

## Features

- **Player Character**: Blue square that you control
- **Enemy AI**: Red enemies that hunt and attack the player
- **Combat System**: Press SPACE to attack nearby enemies
- **Level Progression**: Gain experience by defeating enemies and level up
- **Health System**: Both player and enemies have health bars
- **Obstacles**: Gray obstacles that block movement
- **Game States**: Win by defeating all enemies or lose if your health reaches 0

## Controls

- **Arrow Keys** or **WASD**: Move the player
- **Space**: Attack nearby enemies
- **ESC or Close Window**: Quit game

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kadetheemperorofexistence-glitch/simple-2d-rpg.git
cd simple-2d-rpg
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the game:
```bash
python main.py
```

## Gameplay

1. Move your character (blue square) around the map using arrow keys or WASD
2. Avoid or defeat enemies (red squares) by pressing SPACE when nearby
3. Defeat all enemies to win, or defend yourself until your health is depleted
4. Gain experience points from defeating enemies and level up
5. Each level increases your health, attack power, and enemy spawning difficulty

## Game Mechanics

- **Health System**: Both player and enemies have health bars displayed above them
- **Combat**: Attack damage is based on character level and has slight randomization
- **Leveling**: Defeat enemies to gain experience and level up, which increases stats
- **Enemy AI**: Enemies pursue the player and attack when in range
- **Collision**: Obstacles block both player and enemy movement

## Future Enhancements

- [ ] More enemy types
- [ ] Weapon and armor items
- [ ] Skill system
- [ ] Procedurally generated dungeons
- [ ] Save/load system
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Boss enemies
- [ ] NPC interactions
- [ ] Quest system

## License

MIT License