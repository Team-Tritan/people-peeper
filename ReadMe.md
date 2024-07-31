# People Ping

People Ping is a web application that allows users to select a friend and view their latest response and avatar. The application is built using Node.js, Express, and EJS for templating.

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```sh
   bun install
   ```

## Configuration

Update the configuration in `config.ts` with your specific settings, such as the Discord user token.

## Running the Application

Start the server:

```sh
bun run src/server.ts
```

The application will be running on http://localhost:3000.

Project Files

- `config.ts`: Configuration file for the application.
- `src/server.ts`: Main server file that sets up the Express server and handles routes.
- `src/views/index.ejs`: EJS template for the main page where users can select a friend.
- `src/views/user.ejs`: EJS template for displaying the selected user's details.
