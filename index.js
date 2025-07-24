const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Feedback = require('./models/Feedback');
const { v4: uuidv4 } = require('uuid');

const app = express();

const LOCAL_FEEDBACK_FILE = path.join(__dirname, 'local_feedback.json');

// Ensure local_feedback.json exists and is initialized as an empty array if missing
if (!fs.existsSync(LOCAL_FEEDBACK_FILE)) {
  fs.writeFileSync(LOCAL_FEEDBACK_FILE, '[]');
}

// Try MongoDB connection (do not set global fallback here)
mongoose.connect('mongodb+srv://varshini:12345@cluster0.wmdkv9w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection failed, will use fallback if needed.'));

// Handlebars setup
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve a blank favicon.ico to prevent 404 and CSP errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Helper: Read feedback from file
function readLocalFeedback() {
  if (!fs.existsSync(LOCAL_FEEDBACK_FILE)) return [];
  try {
    const data = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
// Helper: Write feedback to file
function writeLocalFeedback(feedbacks) {
  fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
}

// Helper: Check if Mongoose is connected
function isMongooseConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// Helper: Get feedbacks (tries MongoDB, falls back to file)
async function getFeedbacks() {
  if (isMongooseConnected()) {
    try {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
      return { feedbacks, fallback: false };
    } catch (e) {}
  }
  const feedbacks = readLocalFeedback().reverse();
  return { feedbacks, fallback: true };
}

// Helper: Save feedback (tries MongoDB, falls back to file)
async function saveFeedback({ name, message }) {
  if (isMongooseConnected()) {
    try {
      await Feedback.create({ name, message });
      return { fallback: false };
    } catch (e) {}
  }
  const feedbacks = readLocalFeedback();
  feedbacks.push({ name, message, createdAt: new Date().toISOString(), _id: uuidv4() });
  writeLocalFeedback(feedbacks);
  return { fallback: true };
}

// Home - display all feedback
app.get('/', async (req, res) => {
  const { feedbacks, fallback } = await getFeedbacks();
  res.render('index', { feedbacks, fallback });
});

// Show feedback form
app.get('/submit', (req, res) => {
  res.render('submit', { fallback: false });
});

// Handle feedback deletion
app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;
  let fallback = false;
  if (isMongooseConnected()) {
    try {
      await Feedback.findByIdAndDelete(id);
      return res.redirect('/');
    } catch (e) {}
  }
  // Fallback: delete from file
  let feedbacks = readLocalFeedback();
  feedbacks = feedbacks.filter(fb => fb._id !== id);
  writeLocalFeedback(feedbacks);
  res.redirect('/');
});

// Handle feedback submission
app.post('/submit', async (req, res) => {
  const { name, message } = req.body;
  let errors = [];
  if (!name || name.trim().length < 2) {
    errors.push('Name is required and should be at least 2 characters.');
  }
  if (!message || message.trim().length < 5) {
    errors.push('Message is required and should be at least 5 characters.');
  }
  if (errors.length > 0) {
    return res.render('submit', { errors, name, message, fallback: false });
  }
  await saveFeedback({ name: name.trim(), message: message.trim() });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 