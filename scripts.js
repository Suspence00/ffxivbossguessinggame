let bosses = [];

fetch('bosses.json')
    .then(response => response.json())
    .then(data => {
        bosses = data;
        initializeAutocomplete();
        randomizeBoss();
    })
    .catch(error => console.error('Error loading bosses:', error));

function initializeAutocomplete(filteredNames = null) {
    const bossNames = filteredNames ? filteredNames : bosses.map(boss => boss.name);
    $("#guess-input").autocomplete({
        source: bossNames
    });
}

function randomizeBoss() {
    const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
    initializeGame(randomBoss);
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const messageElement = document.createElement('h2');
    messageElement.textContent = message;
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    popup.appendChild(messageElement);
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
}

function showInstructions() {
    const instructionsPopup = document.getElementById('instructions-popup');
    instructionsPopup.style.display = 'block';
}

function closeInstructions() {
    const instructionsPopup = document.getElementById('instructions-popup');
    instructionsPopup.style.display = 'none';
}

window.handleGuess = function handleGuess() {
    const guessInput = document.getElementById('guess-input');
    const bossNameDisplay = document.getElementById('boss-name-display');
    const scoreDisplay = document.getElementById('score');

    const guess = guessInput.value.trim();
    const boss = window.currentBoss;
    
    if (guess.toLowerCase() === boss.name.toLowerCase()) {
        showPopup(`Correct! Your score is ${window.score}`);
        bossNameDisplay.innerHTML = `<a href="${boss.wiki_link}" target="_blank">${boss.name}</a>`;
    } else {
        const pointsLost = 300;
        updateScore(pointsLost);
        if (window.score <= 0) {
            showPopup(`Game Over! The correct answer was ${boss.name}`);
            bossNameDisplay.innerHTML = `<a href="${boss.wiki_link}" target="_blank">${boss.name}</a>`;
        } else {
            showPopup(`Wrong, guess again. You lost ${pointsLost} points.`);
        }
    }
    guessInput.value = '';
}

window.revealHint = function revealHint(hintKey) {
    const hintDisplay = document.getElementById('hint-display');
    const scoreDisplay = document.getElementById('score');

    const boss = window.currentBoss;
    const hintKeyFormatted = hintKey.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    const hintText = `${hintKeyFormatted}: ${boss[hintKey]}`;
    const hintElement = document.createElement('div');
    hintElement.textContent = hintText;
    hintDisplay.appendChild(hintElement);
    hintDisplay.style.display = 'block';
    hintElement.style.animation = 'fadeIn 1s forwards';
    const cost = hintKey === 'type' || hintKey === 'patch' ? 200 : 300;
    updateScore(cost);
    const hintButton = document.getElementById(`hint-${hintKey}`);
    if (hintButton) {
        hintButton.disabled = true;
        hintButton.style.backgroundColor = '#6c757d';
    } else {
        console.error(`Hint button not found: hint-${hintKey}`);
    }
    if (hintKey === 'first_letter') {
        const filteredNames = bosses.map(boss => boss.name).filter(name => name.startsWith(boss.first_letter));
        initializeAutocomplete(filteredNames);
    }
}

function updateScore(points) {
    window.score -= points;
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = `Score: ${window.score}`;
    scoreDisplay.classList.add('score-animation');
    setTimeout(() => {
        scoreDisplay.classList.remove('score-animation');
    }, 300);
    if (window.score <= 0) {
        handleGameOver();
    }
}

function handleGameOver() {
    const bossNameDisplay = document.getElementById('boss-name-display');
    const boss = window.currentBoss;
    showPopup(`Game Over! The correct answer was ${boss.name}`);
    bossNameDisplay.innerHTML = `<a href="${boss.wiki_link}" target="_blank">${boss.name}</a>`;
}

function initializeGame(boss) {
    const bossImage = document.getElementById('boss-image');
    const bossNameDisplay = document.getElementById('boss-name-display');
    const scoreDisplay = document.getElementById('score');
    const hintDisplay = document.getElementById('hint-display');
    const hintButtons = document.querySelectorAll('.hint-button');
    
    window.score = 2000;
    window.currentBoss = boss;

    if (boss.image) {
        bossImage.src = boss.image;
        bossImage.alt = boss.name;
    } else {
        bossImage.src = '';
        bossImage.alt = 'No image available';
    }

    hintDisplay.innerHTML = '';
    hintDisplay.style.display = 'none';
    bossNameDisplay.textContent = '';
    scoreDisplay.textContent = `Score: ${window.score}`;
    hintButtons.forEach(button => {
        button.disabled = false;
        button.style.backgroundColor = '#007bff';
    });
    initializeAutocomplete();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('instructions-button').addEventListener('click', showInstructions);
    document.getElementById('close-instructions').addEventListener('click', closeInstructions);
    document.getElementById('randomize-boss').addEventListener('click', randomizeBoss);

    document.getElementById('hint-type').addEventListener('click', () => revealHint('type'));
    document.getElementById('hint-content').addEventListener('click', () => revealHint('content'));
    document.getElementById('hint-first_letter').addEventListener('click', () => revealHint('first_letter'));
    document.getElementById('hint-patch').addEventListener('click', () => revealHint('patch'));
    document.getElementById('submit-guess').addEventListener('click', handleGuess);
});
