# IPA Client Web

A web-based client for the IPA AI Assistant that connects to the IPA Server.

## Features

- **Real-time Communication**: Connects to IPA Server via Socket.IO for instant messaging
- **Article Management**: Save, read, and delete articles stored on the server
- **Image Analysis**: Upload images for AI analysis
- **Modern UI**: Clean, terminal-inspired interface with orange theme
- **Connection Status**: Real-time connection status indicator
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ and npm
- IPA Server running on `http://localhost:3001`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3002`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Connecting to Server**: The client automatically attempts to connect to the IPA Server on startup
2. **Sending Messages**: Type your message and press Enter or click Send
3. **Image Analysis**: Click the image icon to attach an image for AI analysis
4. **Article Management**:
   - **Save Response**: Save the last AI response as an article
   - **Read Articles**: Browse and read articles stored on the server
   - **Delete Article**: Remove articles from the server

## Configuration

The client is configured to connect to `http://localhost:3001` by default. To change the server URL:

1. Edit `src/services/socketService.ts`
2. Update the `serverUrl` parameter in the `connect()` method
3. Update the proxy configuration in `vite.config.ts` if needed

## API Endpoints

The client communicates with the server via:

- **Socket.IO**: Real-time messaging and AI responses
- **REST API**: Article management operations
  - `GET /api/articles` - List all articles
  - `GET /api/articles/:filename` - Get article content
  - `POST /api/articles` - Save new article
  - `PUT /api/articles/:filename` - Update article
  - `DELETE /api/articles/:filename` - Delete article
  - `GET /api/stats` - Get server statistics
  - `GET /api/health` - Health check

## Troubleshooting

### Connection Issues
- Ensure the IPA Server is running on port 3001
- Check firewall settings
- Verify network connectivity

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to version 18 or higher

### Runtime Errors
- Check browser console for detailed error messages
- Verify server is accessible at the configured URL

## Development

### Project Structure
```
client-web/
├── src/
│   ├── components/          # React components
│   ├── services/           # API and socket services
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

### Key Components
- `ChatWindow`: Main chat interface
- `SocketService`: Handles real-time communication
- `ApiService`: Manages REST API calls
- `ConnectionStatus`: Shows server connection status

## License

This project is part of the IPA AI Assistant system.

