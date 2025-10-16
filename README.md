# 🍅 Pomodoro Timer App

A simple and elegant Pomodoro Timer application built with React 19, TypeScript, and Tailwind CSS.

## Features (V1.0)

- **Fixed Timer Durations**
  - Work session: 25 minutes
  - Short break: 5 minutes
  - Long break: 15 minutes (after 4 work sessions)

- **Basic Controls**
  - Start/Pause button
  - Reset button
  - Session counter (1-4)

- **Visual Feedback**
  - Color-coded sessions (red for work, green for short break, blue for long break)
  - Large, clear countdown display
  - Browser tab shows countdown
  - Smooth background transitions

- **Audio Notification**
  - Two-tone chime sound when timer completes
  - Generated using Web Audio API

## Tech Stack

- **React 19** - Latest version of React
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podomoro-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. Click **Start** to begin a 25-minute work session
2. When the timer completes, you'll hear a notification sound
3. The timer automatically switches to a 5-minute break
4. After 4 work sessions, you'll get a 15-minute long break
5. Use **Pause** to temporarily stop the timer
6. Use **Reset** to return to the initial work session

## Project Structure

```
podomoro-app/
├── public/
│   └── vite.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── Timer.tsx         # Timer display component
│   │   ├── Controls.tsx      # Control buttons
│   │   └── SessionInfo.tsx   # Session type and counter
│   ├── hooks/
│   │   └── useTimer.ts       # Custom timer hook
│   ├── types/
│   │   └── timer.ts          # TypeScript types and constants
│   ├── utils/
│   │   └── audio.ts          # Audio notification utility
│   ├── App.tsx               # Main app component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles with Tailwind
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite type declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Future Versions

### V2.0 - Enhanced Experience
- Customizable timer durations
- Persistent state (survives page refresh)
- Desktop notifications
- Skip break functionality
- Sound options
- Dark/Light mode toggle

### V3.0 - Productivity Suite
- Task management
- Statistics dashboard
- Advanced settings
- Data export/import

## Testing with AI Assistant (MCP Integration)

This project includes Chrome DevTools MCP setup for AI-assisted testing and debugging.

### Quick Start

1. **Launch Chrome with debugging:**
   ```bash
   # Windows PowerShell
   .\launch-chrome-debug.ps1
   
   # Or double-click
   launch-chrome-debug.bat
   ```

2. **Configure MCP in Cursor** (one-time setup)
   - See `MCP_SETUP_GUIDE.md` for detailed instructions
   - Restart Cursor after configuration

3. **Ask the AI assistant to test your app!**
   - "Take a screenshot of the app"
   - "Test the timer functionality"
   - "Check for console errors"

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

