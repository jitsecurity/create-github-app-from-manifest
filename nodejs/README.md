# GitHub App Creator

This application helps you create GitHub Apps using a manifest file.

## Installation

1. Make sure you have Node.js installed
2. Clone this repository
3. Install dependencies:

```bash
cd nodejs
npm install
```

## Usage

Run the application with all required arguments:

```bash
node app.js --org <your-github-org> --baseUrl <github-base-url> --apiUrl <github-api-url>
```

### Command Line Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `--org` or `--organization` | GitHub organization name | Yes |
| `--baseUrl` | GitHub base URL | Yes |
| `--apiUrl` | GitHub API URL | Yes |

### Examples

For GitHub.com:

```bash
node app.js --org my-github-org --baseUrl https://github.com --apiUrl https://api.github.com
```

For GitHub Enterprise:

```bash
node app.js --org my-github-org --baseUrl https://github.mycompany.com --apiUrl https://api.github.mycompany.com
```

## How it works

The application uses the provided command line arguments to:

1. Generate an `environments.json` file with your specified organization and URLs
2. Start a web server on port 8080
3. Serve a form where you can create a GitHub App with a manifest

Once you submit the form, you'll be redirected to GitHub to authorize and create the app.

## License

MIT 