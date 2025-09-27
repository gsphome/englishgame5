# Environment Configuration Guide

## Overview
This project uses Vite's environment management system with proper separation of concerns.

## File Structure
```
config/
├── .env.development     # Development-specific variables
├── .env.production      # Production-specific variables
├── .env.example         # Template for environment variables
└── vite.config.ts       # Vite configuration with environment handling
```

## Important Notes

### NODE_ENV Handling
- **❌ Don't set `NODE_ENV` in .env files** - This causes Vite warnings
- **✅ Vite manages `NODE_ENV` automatically** based on the build mode
- **✅ Use `import.meta.env.MODE`** to check environment in code

### Environment Variables

#### Available in All Environments:
- `VITE_APP_BASE_URL` - Base URL for the application
- `VITE_APP_TITLE` - Application title
- `VITE_API_URL` - API endpoint URL
- `VITE_ENABLE_CACHE_LOGS` - Enable/disable cache logging
- `VITE_PWA_ENABLED` - Enable/disable PWA features
- `VITE_DEBUG_MODE` - Enable/disable debug mode
- `VITE_HOT_RELOAD` - Enable/disable hot reload

#### Build-time Variables:
- `__APP_VERSION__` - Package version from package.json
- `__BUILD_TIME__` - Build timestamp
- `import.meta.env.VITE_IS_PRODUCTION` - Boolean for production check

## Usage in Code

### Checking Environment:
```typescript
// ✅ Correct way to check environment
const isProduction = import.meta.env.MODE === 'production';
const isDevelopment = import.meta.env.MODE === 'development';

// ✅ Using custom production flag
const isProduction = import.meta.env.VITE_IS_PRODUCTION;

// ❌ Avoid using process.env.NODE_ENV directly
// const isProduction = process.env.NODE_ENV === 'production';
```

### Accessing Environment Variables:
```typescript
// ✅ Correct way to access Vite env vars
const apiUrl = import.meta.env.VITE_API_URL;
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
```

## Build Commands

### Development:
```bash
npm run dev          # Uses .env.development
npm run build:dev    # Development build
```

### Production:
```bash
npm run build        # Uses .env.production
npm run preview      # Preview production build
```

## Troubleshooting

### Common Issues:

1. **Warning: "NODE_ENV=production is not supported in .env file"**
   - **Solution**: Remove `NODE_ENV` from .env files
   - **Reason**: Vite manages this automatically

2. **Environment variables not available**
   - **Check**: Variables must start with `VITE_`
   - **Check**: Variables are defined in correct .env file
   - **Check**: Using `import.meta.env.VARIABLE_NAME`

3. **Different behavior in dev vs production**
   - **Check**: Both .env files have consistent variables
   - **Check**: Using proper environment detection

## Best Practices

1. **Always prefix custom variables with `VITE_`**
2. **Use `import.meta.env.MODE` for environment detection**
3. **Keep sensitive data out of client-side env vars**
4. **Document all environment variables in .env.example**
5. **Use TypeScript for environment variable types**

## Security Notes

- All `VITE_` variables are exposed to the client
- Never put secrets in environment variables
- Use server-side environment variables for sensitive data
- Validate environment variables at build time