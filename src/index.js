const biblioteca = ["verbos.txt", "palavras.txt"];

let dictionary = [];

const state = {
    secret: "",
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};

Promise.all(biblioteca.map(arquivo => fetch(arquivo).then(response => response.text())))
    .then(textos => {
        dictionary = textos
            .flatMap(texto => texto.split(/\r?\n/))
            .map(palavra => palavra.trim())
            .filter(palavra => palavra.length === 5);

        dictionary = [...new Set(dictionary)];

        if (dictionary.length > 0) {
            state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
            console.log("Palavra secreta:", state.secret);
        } else {
            console.error("Nenhuma palavra válida encontrada.");
        }

        startup();
    })
    .catch(error => console.error("Erro ao carregar os dicionários:", error));

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, letter = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;
    container.appendChild(box);
    return box;
}

function drawGrid(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function registerKeyboardEvents() {
    document.body.onkeydown = (e) => {
        const key = e.key.toLowerCase();

        if (key === 'enter') {
            if (state.currentCol === 5) {
                const word = getCurrentWord();
                if (isWordValid(word)) {
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;
                } else {
                    alert("Essa palavra não é válida.");
                }
            }
        } else if (key === 'backspace') {
            removeLetter();
        } else if (isLetter(key)) {
            addLetter(key);
        }

        updateGrid();
    };
}

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isWordValid(word) {
    const normalizedWord = normalize(word);
    return dictionary.some(item => normalize(item) === normalizedWord);
}

function revealWord(guess) {
    const row = state.currentRow;
    const animation_duration = 500; 
    const secretArray = state.secret.split(""); 
    const guessArray = guess.split(""); 
    const usedIndexes = Array(5).fill(false); // Rastreamento de letras já usadas

    const boxes = []; // Guardar referências às caixas para aplicar animação depois

    // Passo 1: Marcar as letras corretas ]
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        boxes.push(box); // Salvar referência para a animação
        box.classList.add('animated'); 
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;

        if (guessArray[i] === secretArray[i]) {
            setTimeout(() => box.classList.add('right'), ((i + 1) * animation_duration) / 2);
            usedIndexes[i] = true;
            secretArray[i] = null;
        }
    }

    // Passo 2: Marcar letras corretas em posição errada 
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] !== state.secret[i] && secretArray.includes(guessArray[i])) {
            const index = secretArray.indexOf(guessArray[i]);
            if (!usedIndexes[index]) {
                setTimeout(() => boxes[i].classList.add('wrong'), ((i + 1) * animation_duration) / 2);
                usedIndexes[index] = true;
                secretArray[index] = null;
            }
        }
    }

    // Passo 3: Marcar letras erradas 
    for (let i = 0; i < 5; i++) {
        if (!boxes[i].classList.contains('right') && !boxes[i].classList.contains('wrong')) {
            setTimeout(() => boxes[i].classList.add('empty'), ((i + 1) * animation_duration) / 2);
        }
    }

    const isWinner = state.secret === guess;
    const isGameOver = state.currentRow === 5;

    setTimeout(() => {
        if (isWinner) {
            alert("Parabéns! Você acertou.");
            resetGame();
        } else if (isGameOver) {
            alert(`Você perdeu! A palavra era: ${state.secret}`);
            resetGame();
        }
    }, 3 * animation_duration);
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-záéíóúãõç]/i);
}

function addLetter(letter) {
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function removeLetter() {
    if (state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;
}

function startup() {
    const game = document.getElementById('game');
    drawGrid(game);
    registerKeyboardEvents();
    console.log("Jogo iniciado com a palavra secreta:", state.secret);
}

// resetando 

function resetGame(){
   // nova palavra secreta
   state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
   console.log("Nova palavra secreta:", state.secret);

   // Reiniciar a grid
   state.grid = Array(6).fill().map(() => Array(5).fill(''));
   state.currentRow = 0;
   state.currentCol = 0;

   for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
        const box = document.getElementById(`box${i}${j}`);
        box.textContent = "";  // Limpa o conteúdo
        box.classList.remove("right", "wrong", "empty", "animated");  // Remove as classes de cor
    }
}

   // Limpar a interface do jogo (grid)
   updateGrid();
}


