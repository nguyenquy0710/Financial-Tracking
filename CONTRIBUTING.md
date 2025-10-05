# Contributing to FinTrack

Thank you for your interest in contributing to FinTrack! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

We welcome suggestions for new features or improvements. Please create an issue with:
- A clear, descriptive title
- Detailed description of the proposed feature
- Why this feature would be useful
- Any examples or mockups (if applicable)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed
3. **Test your changes**
   - Run `npm test` to ensure all tests pass
   - Run `npm run lint` to check code style
4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format (optional but recommended)
5. **Push to your fork** and submit a pull request

### Code Style

- Use ES6+ features
- Follow the existing code structure
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### Commit Message Guidelines

We recommend following the Conventional Commits specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(transactions): add recurring transaction support

Added ability to create recurring transactions with daily, weekly,
monthly, or yearly frequency.

Closes #123
```

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good code coverage

### Documentation

- Update README.md if adding new features
- Update API documentation in docs/API.md
- Add inline code comments for complex logic

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to FinTrack! 🎉
