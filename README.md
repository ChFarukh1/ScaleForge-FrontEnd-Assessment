# ScaleForge Frontend

A modern Next.js 14 dashboard application for managing team members, built with TypeScript, Tailwind CSS, and Apollo GraphQL Client.

## Features

- 🚀 **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for modern, responsive design
- 🔄 **Apollo GraphQL Client** for data fetching
- 🌙 **Dark/Light Theme** support with next-themes
- 📱 **Responsive Design** for all devices
- 🧪 **Mock Mode** for offline development and testing
- 🔍 **Advanced Search** with multiple filters
- 📊 **Analytics Dashboard** with interactive metrics
- ⚙️ **Settings Management** with user preferences

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SF_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example env.local
   ```
   
4. **Configure your environment**
   Edit `env.local` with your API credentials:
   ```env
   NEXT_PUBLIC_GRAPHQL_URL=https://your-api-endpoint/graphql
   NEXT_PUBLIC_ACCESS_TOKEN=your_jwt_token_here
   NEXT_PUBLIC_MOCK_MODE=false
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GRAPHQL_URL` | Your GraphQL API endpoint | `https://report.development.opexa.io/graphql` |
| `NEXT_PUBLIC_ACCESS_TOKEN` | JWT token for authentication | `eyJhbGciOiJIUzI1NiIs...` |

Generate an access token (valid for 24h) using the platform’s auth endpoint:

```bash
curl --request POST \
  --url 'https://auth.development.opexa.io/sessions?ttl=24h' \
  --header 'authorization: Basic YmFieWVuZ2luZWVyOjVlODg0ODk4ZGEyODA0NzE1MWQwZTU2ZjhkYzYyOTI3NzM2MDNkMGQ2YWFiYmRkNjJhMTFlZjcyMWQxNTQyZDg=' \
  --header 'platform-code: Z892' \
  --header 'role: OPERATOR'
```

Set the returned token (without the `Bearer ` prefix) into `NEXT_PUBLIC_ACCESS_TOKEN`.

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MOCK_MODE` | Enable mock mode for offline testing | `false` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ScaleForge` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Running Modes

### 1. Real API Mode (Production)

Set `NEXT_PUBLIC_MOCK_MODE=false` or remove the variable entirely.

**Requirements:**
- Valid GraphQL API endpoint
- Valid JWT access token
- Network connectivity to your API

**Benefits:**
- Real-time data from your backend
- Full functionality with live data
- Production-ready performance

### 2. Mock Mode (Development/Offline)

Set `NEXT_PUBLIC_MOCK_MODE=true` for offline development.

**Features:**
- Sample member data for testing
- No network requests required
- Perfect for development and demos
- All UI components fully functional

**Use Cases:**
- Development without API access
- UI/UX testing and prototyping
- Offline demonstrations
- CI/CD pipeline testing

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analytics/         # Analytics dashboard
│   ├── dashboard/         # Main members dashboard
│   ├── settings/          # User settings page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── members-table.tsx  # Members data table
│   ├── enhanced-search.tsx # Search and filters
│   ├── theme-provider.tsx # Theme management
│   └── ...
├── graphql/              # GraphQL configuration
│   ├── apollo-client.ts  # Apollo Client setup
│   ├── queries.ts        # GraphQL queries
│   └── types.ts          # TypeScript types
├── hooks/                # Custom React hooks
│   └── use-members.ts    # Members data management
└── styles/               # Global styles
    └── globals.css       # Tailwind CSS imports
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

## Troubleshooting

### Common Issues

#### 1. Apollo Client 400 Bad Request

**Symptoms:** Network errors in browser console, 400 status codes

**Solutions:**
- Verify `NEXT_PUBLIC_ACCESS_TOKEN` is correct (no "Bearer " prefix)
- Check `NEXT_PUBLIC_GRAPHQL_URL` is accessible
- Ensure token has proper permissions
- Check API endpoint is responding

#### 2. Hydration Mismatch Warnings

**Symptoms:** React hydration warnings in console

**Solutions:**
- All client components now have `'use client'` directive
- Theme provider properly configured
- Layout uses `suppressHydrationWarning` where needed

#### 3. Members Not Loading

**Symptoms:** Empty members list, loading states stuck

**Solutions:**
- Check network tab for GraphQL errors
- Verify environment variables are loaded
- Try enabling mock mode for testing
- Check browser console for errors

#### 4. Navigation Issues

**Symptoms:** Analytics/Settings pages not working

**Solutions:**
- All pages now have proper client-side rendering
- Navigation components properly configured
- Check for JavaScript errors in console

### Debug Mode

Enable debug logging by setting in your browser console:
```javascript
localStorage.setItem('debug', 'apollo:*')
```

### Mock Mode Testing

The app automatically enables Mock Mode when either `NEXT_PUBLIC_GRAPHQL_URL` or `NEXT_PUBLIC_ACCESS_TOKEN` is missing. You can also force it with `NEXT_PUBLIC_MOCK_MODE=true`. The mock dataset matches the Figma table (names, statuses, and verification badges) for realistic demos.

To test without API:
1. Set `NEXT_PUBLIC_MOCK_MODE=true` in `env.local`
2. Restart development server
3. You'll see "🧪 Mock Mode" indicator
4. Sample data will be displayed

## Development

### Adding New Features

1. **New Pages:** Create in `src/app/` directory
2. **Components:** Add to `src/components/` directory
3. **GraphQL:** Update `src/graphql/queries.ts` and `types.ts`
4. **Hooks:** Create in `src/hooks/` directory

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js recommended rules
- **Prettier:** Code formatting
- **Tailwind:** Utility-first CSS approach

### Testing

The application includes:
- Error boundaries for graceful error handling
- Loading states for all async operations
- Empty states for no data scenarios
- Responsive design for all screen sizes

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all `NEXT_PUBLIC_*` variables are set in your production environment.

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review environment configuration
3. Check browser console for errors
4. Enable mock mode for testing
5. Create an issue with detailed error information

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
