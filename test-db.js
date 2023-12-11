// Import required modules
const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://dabrutis:V1ZkIkVagJjmqalY@cluster0.preryr8.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//MONGODB_URI=mongodb+srv://dabrutis:V1ZkIkVagJjmqalY@Cluster0.mongodb.net/SpotifyIQ?retryWrites=true&w=majority


// Create a Mongoose schema
const highScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

// Create a Mongoose model
const HighScore = mongoose.model('HighScore', highScoreSchema);

// Function to test saving a high score
async function saveHighScore() {
  try {
    const highScore = new HighScore({ userId: 'user123', score: 100 });
    await highScore.save();
    console.log('High score saved successfully!');
  } catch (error) {
    console.error('Error saving high score:', error);
  }
}

// Function to test retrieving high scores
async function getHighScores() {
  try {
    const highScores = await HighScore.find().sort({ score: -1 }).limit(10);
    console.log('High scores:', highScores);
  } catch (error) {
    console.error('Error retrieving high scores:', error);
  }
}

// Test the database functions
async function testDatabase() {
  await saveHighScore();
  await getHighScores();
}

// Run the database test
testDatabase();