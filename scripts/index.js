#!/usr/bin/env node

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

console.log(`
${colors.bright}${colors.blue}MADFAM Development Scripts${colors.reset}
${'='.repeat(50)}

Available commands:

${colors.cyan}Setup & Configuration:${colors.reset}
  ${colors.green}npm run setup${colors.reset}      - Initial project setup wizard
  
${colors.cyan}Development:${colors.reset}
  ${colors.green}npm run dev${colors.reset}        - Start development environment with full orchestration
  ${colors.green}npm run dev:raw${colors.reset}    - Start development without checks (turbo only)
  ${colors.green}npm run health${colors.reset}     - Check system health and service status
  
${colors.cyan}Database Management:${colors.reset}
  ${colors.green}npm run db:utils${colors.reset}   - Database utility commands (status, backup, restore)
  ${colors.green}npm run db:migrate${colors.reset} - Run database migrations
  ${colors.green}npm run db:seed${colors.reset}    - Seed database with test data
  ${colors.green}npm run db:push${colors.reset}    - Push schema changes (development)
  
${colors.cyan}Code Quality:${colors.reset}
  ${colors.green}npm run test${colors.reset}       - Run tests
  ${colors.green}npm run lint${colors.reset}       - Run linting
  ${colors.green}npm run format${colors.reset}     - Format code with Prettier
  
${colors.cyan}Build & Deploy:${colors.reset}
  ${colors.green}npm run build${colors.reset}      - Build for production
  ${colors.green}npm run clean${colors.reset}      - Clean build artifacts

${colors.yellow}Pro Tips:${colors.reset}
  - Use ${colors.cyan}DEBUG=1 npm run dev${colors.reset} for verbose logging
  - Run ${colors.cyan}npm run health${colors.reset} to diagnose issues
  - Use ${colors.cyan}npm run db:utils studio${colors.reset} for a database GUI
  
For more information, see: ${colors.cyan}scripts/README.md${colors.reset}
`);