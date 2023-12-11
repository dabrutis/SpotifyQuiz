let score = 0; // Variable to keep track of the score
let isQuizOver = false; // Variable to check if the quiz is over

async function fetchTracksAndAlbums() {
  try {
    const response = await fetch('/api/tracks'); // Fetching data from the server endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const tracksAndAlbums = await response.json(); // Extracting JSON data
    console.log('Tracks and albums data:', tracksAndAlbums);
    const dataLength = tracksAndAlbums.length;
    console.log('Data length:', dataLength);

    // Call function to create quiz with the fetched data
    createQuiz(tracksAndAlbums);

    // Display the quiz elements
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('question').style.display = 'block';
    document.getElementById('options').style.display = 'block';
  } catch (error) {
    console.error('Error fetching tracks and albums:', error);
    // Add any specific error handling here
  }
}

// Example: Send high score to server
async function sendHighScore(score) {
  try {
    const response = await fetch('/api/highscores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score }), // Sending the score as expected by the server
    });
    if (!response.ok) {
      throw new Error('Failed to send high score');
    }
    console.log('High score sent successfully!');
  } catch (error) {
    console.error('Error sending high score:', error);
  }
}

window.onload = async function () {
  const startButton = document.getElementById('startButton');
  const questionDiv = document.getElementById('question');
  const optionsContainer = document.getElementById('options');

  questionDiv.style.display = 'none'; // Hide question and options initially
  optionsContainer.style.display = 'none';

  startButton.addEventListener('click', fetchTracksAndAlbums);
  startButton.style.display = 'block'; // Show the start button explicitly

  try {
    const response = await fetch('/api/tracks'); // Fetching data from the server endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const tracksAndAlbums = await response.json(); // Extracting JSON data
    console.log('Tracks and albums data:', tracksAndAlbums);
    const dataLength = tracksAndAlbums.length;
    console.log('Data length:', dataLength);

    // Call function to create quiz with the fetched data
    createQuiz(tracksAndAlbums);
  } catch (error) {
    console.error('Error fetching tracks and albums:', error);
    // Add any specific error handling here
  }
};

function createQuiz(data) {
  // Shuffle the tracks and albums array
  const shuffledData = data.sort(() => Math.random() - 0.5);

  // Assuming you want to create a quiz for the first track
  const questionTrack = shuffledData[0];
  const correctAlbum = questionTrack.albumName;

  // Generate 3 incorrect options
  const incorrectOptions = shuffledData
    .slice(1, 4) // Exclude the correct answer
    .map((track) => track.albumName);

  const options = shuffleArray([correctAlbum, ...incorrectOptions]);

  // Display the question and options in your HTML
  const questionDiv = document.getElementById('question');
  const optionsContainer = document.getElementById('options');
  questionDiv.textContent = `Which album does the track '${questionTrack.trackName}' belong to?`;
  
  optionsContainer.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(option, correctAlbum));
    optionsContainer.appendChild(button);
  });
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function displayStartButton() {
  document.getElementById('startButton').style.display = 'block';
  document.getElementById('question').style.display = 'none';
  document.getElementById('options').style.display = 'none';
}

function checkAnswer(selectedOption, correctAnswer) {
  if (isQuizOver) return;

  if (selectedOption === correctAnswer) {
    score++;
    alert('Correct!');
  } else {
    isQuizOver = true;
    alert(`Incorrect! The correct album is '${correctAnswer}'.\nYour score: ${score}`);
    sendHighScore(score);
    score = 0; // Reset the score on failure
    displayStartButton(); // Show the start button
  }

  if (!isQuizOver) {
    fetchTracksAndAlbums();
  }
}

// Event listener for the start button
document.getElementById('startButton').addEventListener('click', () => {
  isQuizOver = false; // Reset the quiz state
  fetchTracksAndAlbums();
});