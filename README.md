# Feedback App

A simple feedback application built with Node.js, Express, and Handlebars. Feedback is stored in MongoDB (if available) or falls back to local file storage.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)
- (Optional) [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for cloud database

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure MongoDB (Optional):**
   - By default, the app tries to connect to MongoDB Atlas using the connection string in `index.js`.
   - To use your own MongoDB, update the connection string in `index.js`:
     ```js
     mongoose.connect('your-mongodb-connection-string', {})
     ```
   - If MongoDB is not available, the app will use local file storage (`local_feedback.json`).

4. **Run the app:**
   ```bash
   node index.js
   ```

5. **Open in your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

## Features
- Submit feedback with name and message
- Feedback is stored in MongoDB or local file (fallback)
- Simple, clean UI

## Notes
- If using local file storage, feedback is saved in `local_feedback.json` in the project directory.
- To deploy this app, use a platform that supports Node.js servers (Render, Railway, Heroku, etc.).

## License
MIT 