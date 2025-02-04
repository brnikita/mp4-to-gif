# Frontend Application

Angular-based frontend for MP4 to GIF conversion service.

## Structure

```
client/
├── src/
│   ├── app/
│   │   ├── core/              # Core modules, guards, interceptors
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication feature
│   │   │   ├── conversion/    # Video conversion feature
│   │   │   └── dashboard/     # User dashboard
│   │   ├── shared/            # Shared components, pipes, directives
│   │   └── app.module.ts
│   ├── assets/
│   └── environments/
├── package.json
└── tsconfig.json
```

## Dependencies

- Angular 16.x
- @angular/material for UI components
- @ngrx/store for state management
- ngx-file-drop for drag-and-drop file upload
- socket.io-client for real-time updates

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Features

- Drag-and-drop video upload
- Real-time conversion progress
- Conversion history
- User authentication
- Responsive design

## Configuration

Environment configuration files are located in `src/environments/`:
- `environment.ts` - development configuration
- `environment.prod.ts` - production configuration 