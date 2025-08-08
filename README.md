# DeepThought Discord Bot

A Discord bot for the Base42 hackerspace community that provides calendar integration and server information.

## Features

- 📅 Weekly Events: Shows events for the next 7 days
- 🗓️ Monthly Events: Shows events for the next 30 days
- 📚 Past Events: Shows events from the past 30 days
- ℹ️ Server Info: Displays information about Base42
- 👤 User Info: Shows user information and roles

## Setup

### Environment Variables

This bot uses environment variables for configuration. Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `DISCORD_TOKEN`: Your Discord bot token
- `DISCORD_CLIENT_ID`: Your Discord application client ID
- `GUILD_ID`: The Discord server ID where the bot will be used
- `GOOGLE_API_KEY`: Google Calendar API key for accessing calendar events

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` file

3. Run in development mode:
   ```bash
   npm run dev
   ```

### Production Deployment with Docker

#### Using Docker Compose

1. Set up your environment variables in a `.env` file
2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

#### Using Docker directly

```bash
docker build -t deepthought .
docker run -d \
  --name deepthought-bot \
  -e DISCORD_TOKEN=your_token \
  -e DISCORD_CLIENT_ID=your_client_id \
  -e GUILD_ID=your_guild_id \
  -e GOOGLE_API_KEY=your_api_key \
  --restart unless-stopped \
  deepthought
```

## CI/CD

The project includes a GitHub Actions workflow that:

- Builds a Docker image when code is pushed to the `main` branch
- Pushes the image to GitHub Container Registry (ghcr.io)
- Tags the image with the branch name, git SHA, and 'latest' for main branch

The workflow requires no additional setup - it uses GitHub's built-in container registry and authentication.

## Project Structure

```
src/
├── base/
│   ├── classes/           # Base classes
│   ├── constants/         # Application constants
│   ├── enums/            # Enumerations
│   ├── interfaces/       # TypeScript interfaces
│   └── utilities/        # Utility functions
├── commands/             # Discord slash commands
└── events/              # Discord event handlers
```

## Available Scripts

- `npm run dev`: Run in development mode with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm run start`: Clean build and start production
- `npm run startNoClean`: Build and start without cleaning

## License

This project is licensed under the ISC License.
