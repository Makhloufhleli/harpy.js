# Contributing to Harpy 🦅

First off, thank you for considering contributing to Harpy! It's people like you that make Harpy such a great tool for the NestJS and React community.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (Node version, OS, package versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful** to most Harpy users
- **Include code examples** if applicable

### Pull Requests

We actively welcome your pull requests! Here's how to contribute code:

## 🚀 Development Workflow

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/harpy.js.git
cd harpy.js
```

### 2. Create a Branch

**IMPORTANT:** The `main` branch is protected. All contributions must be made through pull requests from feature branches.

```bash
# Create a new branch for your feature or fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/add-custom-layout-support`)
- `fix/` - Bug fixes (e.g., `fix/hydration-race-condition`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-build-process`)
- `test/` - Adding or updating tests (e.g., `test/add-cli-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 3. Set Up Development Environment

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Build specific packages
pnpm run build:core
pnpm run build:cli
```

### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests if applicable
- Update documentation if needed
- Ensure all tests pass

### 5. Test Your Changes Locally

```bash
# Build the packages
pnpm run build

# Test the CLI locally
cd packages/harpy-cli
npm pack
npm install -g hepta-solutions-harpy-cli-*.tgz

# Create a test app
mkdir test-app
cd test-app
harpy create my-test-app
cd my-test-app

# Test dev mode
pnpm install
pnpm run start:dev

# Test production build
pnpm run build
pnpm run start
```

### 6. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
# Examples:
git commit -m "feat(cli): add custom port configuration"
git commit -m "fix(core): resolve hydration timing issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(cli): simplify template generation"
git commit -m "test(core): add hydration manifest tests"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### 7. Push to Your Fork

```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

1. Go to the [Harpy repository](https://github.com/Makhloufhleli/harpy.js)
2. Click "Pull Requests" → "New Pull Request"
3. Click "compare across forks"
4. Select your fork and branch
5. Fill in the PR template with:
   - **Clear title** describing the change
   - **Description** of what changed and why
   - **Related issues** (if any)
   - **Screenshots** (if UI changes)
   - **Testing steps** you performed

## 📋 Pull Request Guidelines

### Before Submitting

- ✅ Code builds without errors (`pnpm run build`)
- ✅ All tests pass (if tests exist)
- ✅ Code follows existing style conventions
- ✅ Commit messages follow conventional commits
- ✅ Documentation is updated (if needed)
- ✅ Changes are tested locally

### PR Title Format

Use the same format as commit messages:

```
feat(cli): add support for custom templates
fix(core): resolve memory leak in hydration
docs(contributing): add branch naming conventions
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code builds successfully
- [ ] Tested locally with sample app
- [ ] Documentation updated
- [ ] Follows conventional commits
```

## 🏗️ Project Structure

```
harpy.js/
├── packages/
│   ├── harpy-core/         # Core rendering engine
│   │   ├── src/
│   │   │   ├── core/       # Main functionality
│   │   │   └── decorators/ # NestJS decorators
│   │   └── scripts/        # Build scripts
│   │
│   └── harpy-cli/          # CLI tool
│       ├── src/
│       │   ├── commands/   # CLI commands
│       │   └── utils/      # Utilities
│       └── templates/      # Project templates
│           └── app/        # Default app template
│
├── apps/                   # Test applications (gitignored)
├── lerna.json             # Lerna configuration
├── pnpm-workspace.yaml    # pnpm workspace config
└── package.json           # Root package.json
```

## 🔧 Working on Specific Packages

### harpy-core

The core package handles SSR and hydration:

```bash
cd packages/harpy-core
pnpm run build

# Watch mode for development
pnpm run dev
```

### harpy-cli

The CLI package creates new projects:

```bash
cd packages/harpy-cli
pnpm run build

# Test locally
npm pack
npm install -g hepta-solutions-harpy-cli-*.tgz
```

## 📝 Code Style

- Use **TypeScript** for type safety
- Follow existing **code formatting** (Prettier is configured)
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **small and focused**
- Export types and interfaces properly

## 🐛 Debugging Tips

### CLI Issues

```bash
# Add debug logging
console.log('Debug:', yourVariable);

# Test CLI without global install
node packages/harpy-cli/dist/index.js create test-app
```

### Core Issues

```bash
# Enable verbose logging in your test app
# Add to main.ts:
console.log('Bootstrap debug:', ...);
```

## 📦 Version Bumping

Only maintainers can bump versions and publish packages. We use Lerna for version management:

```bash
# Bump versions (maintainers only)
pnpm version

# Publish to npm (maintainers only)
pnpm publish
```

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and considerate
- **Be collaborative** and helpful
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community
- **Show empathy** towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

## 🎉 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for contributing to Harpy! Together we're building something powerful for the NestJS and React community. 🦅

---

**Questions?** Feel free to open a discussion or reach out to the maintainers.
