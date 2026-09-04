# Simple 2D RPG - Web Version

A browser-based version of the Simple 2D RPG game, built with HTML5 Canvas and vanilla JavaScript.

## Features

- 🎮 **Web-Based Gameplay** - Play directly in your browser, no installation needed
- 🎯 **Smooth Controls** - Arrow keys or WASD for movement
- ⚔️ **Real-time Combat** - Press SPACE to attack nearby enemies
- 📊 **Level Progression** - Gain experience and level up
- ❤️ **Health System** - Visual health bars for all characters
- 🧱 **Obstacle Navigation** - Avoid obstacles while fighting enemies
- ⏸️ **Pause/Resume** - Pause the game anytime
- 🔄 **Restart** - Start a new game instantly

## How to Run

### Online
Simply open `index.html` in your web browser. No server required!

### Local Development
```bash
# Clone the repository
git clone https://github.com/kadetheemperorofexistence-glitch/simple-2d-rpg.git
cd simple-2d-rpg

# Switch to web-app branch
git checkout web-app

# Open index.html in your browser
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### With a Local Server (Optional)
For better performance, serve with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## Game Controls

| Control | Action |
|---------|--------|
| **Arrow Keys** | Move up/down/left/right |
| **WASD** | Alternative movement |
| **Space** | Attack nearby enemies |
| **Pause Button** | Pause/Resume game |
| **Restart Button** | Start a new game |

## Gameplay

1. **Move** around the map avoiding obstacles
2. **Approach** enemies (red squares) that spawn around the map
3. **Attack** enemies by pressing SPACE when you're close
4. **Level Up** by defeating enemies and gaining experience
5. **Win** by defeating all enemies on the map
6. **Lose** if your health reaches 0

## Game Mechanics

### Player (Blue Square)
- Health: 100 HP
- Speed: 5 pixels per frame
- Attack Power: 20 damage (increases with level)
- Gains experience from defeating enemies

### Enemies (Red Squares)
- Vary in level and difficulty
- AI chases and attacks the player
- Drop experience points when defeated
- Spawn at varying levels based on player level

### Obstacles (Gray Squares)
- Block movement for both player and enemies
- Create strategic gameplay elements
- Scattered around the map

## File Structure

```
web-app/
├── index.html       # Main HTML file with UI
├── styles.css       # Responsive styling
├── game.js          # Game logic and engine
└── README-WEB.md    # This file
```

## Technologies Used

- **HTML5** - Page structure and canvas
- **CSS3** - Responsive design and styling
- **JavaScript (Vanilla)** - Game engine and logic
- **Canvas API** - 2D graphics rendering

## Features Overview

### Stats Display
- Real-time health monitoring
- Level and experience tracking
- Enemy count indicator

### Visual Feedback
- Color-coded characters (Blue=Player, Red=Enemies, Gray=Obstacles)
- Health bar display above each character
- Win/Lose screen with visual overlay
- Pause overlay

### Responsive Design
- Works on desktop and tablet
- Adaptive grid layout for instructions
- Touch-friendly button sizes

## Performance

- **60 FPS** gameplay for smooth animation
- Efficient collision detection
- Optimized rendering pipeline
- Minimal memory footprint

## Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers with keyboard/gamepad support

## Tips for Winning

1. Use obstacles to your advantage - enemies can get stuck on them
2. Attack multiple enemies by moving between them
3. Level up quickly to gain more health and damage
4. Avoid taking damage early to have room for mistakes
5. Corner enemies against obstacles to prevent escape

## Future Enhancements

- [ ] Touch/Mobile controls with joystick
- [ ] Gamepad/Controller support
- [ ] Sound effects and background music
- [ ] Different enemy types
- [ ] Power-ups and items
- [ ] Procedurally generated maps
- [ ] Multiplayer support
- [ ] Save/Load game state
- [ ] Leaderboard system
- [ ] More detailed graphics and animations

## License

MIT License - Feel free to use this for learning or as a base for your own projects!

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.