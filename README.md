# cylip|notes

Snap, Note, Remember

A lightweight, real-time note-taking application powered by AI, designed to run efficiently on Cloudflare.

## Features

- **Real-time Collaboration:** Take notes with others in real-time, with instant updates across all connected devices.
- **AI-Powered:** Get smart suggestions, summaries, and searches powered by AI to enhance your note-taking process.

## Installation

To get started with building cylip|notes, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/cylip-notes.git
   cd cylip-notes
   ```

2. Install Dependencies: Ensure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. Set Up Environment Variables: Copy the example environment file and populate it with your settings:

   ```bash
   cp .env.example .env
   ```

4. Run the Development Server and PartyKit: Start the Nuxt 3 development server and PartyKit for WebSockets:

   ```bash
   npm run dev
   npm run partykit:dev
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
