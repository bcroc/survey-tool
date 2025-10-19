# Contributing to Event Survey Application

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discriminatory comments, or personal attacks
- Trolling, insulting comments, or political arguments
- Publishing others' private information
- Any conduct inappropriate in a professional setting

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Verify you're using the latest version
3. Try to reproduce the issue

**Bug Report Template:**
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

### Suggesting Features

Feature suggestions are welcome! Please include:
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered?
- **Impact**: Who benefits from this?

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Commit with clear messages**
7. **Push to your fork**
8. **Open a Pull Request**

## Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for complete setup instructions.

**Quick Start:**
```bash
git clone <your-fork>
cd survey-tool
npm install
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types for reusability

**Example:**
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUser(id: string): User {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for props

**Example:**
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### API Routes

- Use consistent REST conventions
- Validate all input with Zod
- Return consistent response format
- Handle errors properly

**Example:**
```typescript
// ✅ Good
import { z } from 'zod';
import { validate } from '../middleware/validation';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

router.post('/surveys', validate(createSchema), async (req, res, next) => {
  try {
    const survey = await prisma.survey.create({ data: req.body });
    return sendCreated(res, survey);
  } catch (error) {
    next(error);
  }
});

// ❌ Bad
router.post('/surveys', async (req, res) => {
  const survey = await prisma.survey.create({ data: req.body });
  res.json(survey);
});
```

### Styling

- Use Tailwind utility classes
- Follow existing patterns
- Keep styles consistent
- Use existing design tokens

**Example:**
```tsx
// ✅ Good
<div className="card">
  <h2 className="mb-3">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// ❌ Bad
<div style={{ padding: '20px', background: 'white' }}>
  <h2 style={{ marginBottom: '12px' }}>Title</h2>
</div>
```

### Database

- Use Prisma for all database operations
- Define proper relations in schema
- Use transactions for multi-step operations
- Index frequently queried fields

**Example:**
```typescript
// ✅ Good
const survey = await prisma.survey.create({
  data: {
    title: 'New Survey',
    sections: {
      create: [
        {
          title: 'Section 1',
          order: 1,
        },
      ],
    },
  },
  include: { sections: true },
});

// ❌ Bad
await prisma.$executeRaw`INSERT INTO surveys ...`;
```

## Testing

### Writing Tests

- Write tests for new features
- Maintain or improve coverage
- Test edge cases and error conditions
- Use descriptive test names

**Test Structure:**
```typescript
describe('Feature Name', () => {
  describe('when condition A', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Specific workspace
npm test --workspace=api

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test Coverage

Aim for:
- **80%+ overall coverage**
- **100% coverage for critical paths**
- **All edge cases tested**

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Examples

```bash
# Feature
git commit -m "feat(surveys): add word cloud visualization to results"

# Bug fix
git commit -m "fix(auth): resolve session persistence issue"

# Documentation
git commit -m "docs: update API reference with new endpoints"

# Breaking change
git commit -m "feat(api)!: change response format to include metadata

BREAKING CHANGE: API responses now wrapped in {success, data} format"
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] No merge conflicts
- [ ] Changes are focused and atomic

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test the changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guide
- [ ] Self-review completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Feedback addressed** if needed
4. **Approved and merged**

### After Merge

- Delete your feature branch
- Update your fork
- Close related issues

## Documentation

### When to Update Docs

- New features added
- API changes
- Configuration changes
- Breaking changes
- Bug fixes that affect behavior

### Documentation Locations

- **README.md** - Project overview and quick start
- **docs/ARCHITECTURE.md** - System design
- **docs/API.md** - API reference
- **docs/DEVELOPMENT.md** - Development setup
- **docs/DEPLOYMENT.md** - Deployment guide
- **docs/USER_GUIDE.md** - End-user documentation

### Writing Good Documentation

- **Clear and concise**
- **Use examples**
- **Include code snippets**
- **Add screenshots for UI**
- **Keep it up to date**

## Project Structure

```
survey-tool/
├── api/                  # Backend
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── tests/           # API tests
│
├── web/                  # Frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript types
│   └── tests/           # Frontend tests
│
└── docs/                # Documentation
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes

### Creating a Release

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to repository
5. Create GitHub release
6. Deploy to production

## Getting Help

- **Questions**: Open a discussion
- **Bugs**: Create an issue
- **Features**: Start with a discussion
- **Security**: Email maintainers privately

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

Thank you for contributing! 🎉

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
