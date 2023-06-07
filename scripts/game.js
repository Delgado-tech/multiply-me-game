/*Game elements*/
const subTitle = document.querySelector("#sub-title");
const exitBtn = document.querySelector("#exit");
const questionValue = document.querySelector("#question-value");
const optionsList = document.querySelectorAll("#options button");
const livesList = document.querySelectorAll("#lives .heart");
const levelPercent = document.querySelector("#level-percent");
const clock = document.querySelector("#clock");
const clockValueElement = clock.childNodes[1];
const confirmAnswer = document.querySelector("#confirm button");
/*Win elements*/
const winScreen = document.querySelector("#win-screen");
const winDifficultyName = document.querySelector("#win-medal p");
const winMedal = document.querySelector("#win-medal .medal-image img");
const winExitBtn = document.querySelector("#win-exit button");
/*Lose elements*/
const loseScreen = document.querySelector("#lose-screen");
const loseMessage = document.querySelector("#lose-message p");
const loseExitBtn = document.querySelector("#lose-exit button");
const repeatBtn = document.querySelector("#repeat button");

const menuUrl = "../index.html";

/*====== CONFIG SESSION ======*/
const gameSessionId = localStorage.getItem("game-session");
const selectedDifficulty = ConvertGameSessionLevelLetter(GetStringLetters(gameSessionId));
const selectedDifficultySpeed = Number(GetStringNumbers(gameSessionId)); // procura e retorna apenas o número da string;

const speedDifficultyTime = {
    "total": [
        [ //normal speed
            20, //easy time
            35, //medium time
            50 //hard time
        ],
        [ //fast speed
            15, //easy time
            30, //medium time
            45 //hard time
        ],
        [ //very-fast speed
            10, //easy time
            25, //medium time
            35 //hard time
        ]
    ],
    "extraTime": [
        [ //normal speed
            10, //easy extra-time
            20, //medium extra-time
            25 //hard extra-time
        ],
        [ //fast speed
            5, //easy extra-time
            15, //medium extra-time
            20 //hard extra-time
        ],
        [ //very-fast speed
            4, //easy extra-time
            10, //medium extra-time
            15 //hard extra-time
        ]
    ]
};

const levelDifficultyCount = [
    10, //easy levels
    8, //medium levels
    6 //hard levels
];

const level = { "count": levelDifficultyCount[selectedDifficulty-1], "current": 1 };
const timer = { "total": speedDifficultyTime.total[selectedDifficultySpeed-1][selectedDifficulty-1], "current": 0, "extraTime": speedDifficultyTime.extraTime[selectedDifficultySpeed-1][selectedDifficulty-1] };
/*============================*/

const IDifficulty = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3
};

const DifficultyNames = {
    "en": ["easy", "medium", "hard"],
    "ptbr": ["fácil","médio","difícil"]
};

var medalWinLevel = 1;

var timerInterval;
var clockInterval;
var clockIntervalMilliseconds;

var lives = 3;
var result = 0;
var values = [0, 0];
var answer;

StartGame(selectedDifficulty);

confirmAnswer.addEventListener("click", () => {
    if(result != answer) {
        livesList[lives-1].setAttribute("data-heart-breaked", "true");
        lives--;

        if (lives <= 0) {
            CallLoseScreen();
            return;
        }

    }else {
        levelPercent.style.setProperty("width", `${(level.current*100)/level.count}%`);
        level.current++;
    
        let addTime;
        if (timer.current + timer.extraTime > timer.total) addTime = timer.total - timer.current;
        else addTime = timer.extraTime;

        timer.current += addTime;
        clockValueElement.textContent = timer.current;
        clockIntervalMilliseconds -= addTime * 1000;
    
        if(level.current > level.count) {
            CallWinScreen();
            return;
        }
    }

    CreateQuestion(selectedDifficulty);
    ResetButtons();
});


optionsList.forEach((op) => { //adiciona um evento de click para cada botão
    op.addEventListener("click", () => {
        ResetButtons();
        op.setAttribute("data-selected-btn", "true"); //seleciona o botão clicado
        answer = Number(op.textContent);
        confirmAnswer.disabled = false;
    });
});

exitBtn.addEventListener("click", () => {
    ExitToMenu();
});

function StartGame(Difficulty){
    StopClock();
    SetElementsBgColor("var(--color-green)");
    ResetButtons();
    ResetLives();
    ResetLevel();
    ClockCountdown();
    CreateQuestion(Difficulty);
}

function StopClock() {
    clearInterval(clockInterval);
    clearInterval(timerInterval);
}

function ResetButtons() {
    optionsList.forEach((e) => e.setAttribute("data-selected-btn", "false")); //reseta todos botões;
    confirmAnswer.disabled = true;
}

function ResetLives() {
    livesList.forEach((e) => {
        e.setAttribute("data-heart-breaked", "false");
        e.style.setProperty("filter", "none");
    }); 
    lives = 3;
}

function ResetLevel() {
    levelPercent.style.setProperty("width", "0%");
    level.current = 1;
}

function SetElementsBgColor(color) {
    subTitle.style.setProperty("background-color", color);
    levelPercent.style.setProperty("background-color", color);
}

function CreateQuestion(Difficulty) {
    let modifier = 1;

    if (Difficulty == IDifficulty.MEDIUM) modifier = 10;
    else if (Difficulty == IDifficulty.HARD) modifier = 100;

    values = values.map((i) => {
        i = Math.floor((Math.random()) * 10 * modifier);
        i = (i > modifier) ? i : i + modifier; //se valor gerado for menor que o modificador soma ele mais o modificador;
        return i;
    });

    questionValue.textContent = `${values[0]}x${values[1]}`;
    result = values[0] * values[1];

    CreateOptions(Difficulty, modifier, result);
}

function CreateOptions(Difficulty, modifier, result) {

    const selectedValue = (values[0] % 2 == 0 ? values[1] : values[0]); //prioriza usar valores impares como base;

    //enquanto as opções não forem diferentes ou maiores que 0, é gerado elas novamente
    let randomOptions = [];
    do {
        if (Difficulty == IDifficulty.EASY) {
            randomOptions = [
                selectedValue * (Math.random() > 0.5 ? 1 : -1) * Math.floor((Math.random() * 2) + 1),
                selectedValue * (Math.random() > 0.5 ? 1 : -1) * Math.floor((Math.random() * 2) + 1)
            ];
        } else {
            randomOptions = [
                (((Math.random() > 0.5 ? 1 : -1) * Math.floor((Math.random() * 2) + 1)) * modifier),
                (((Math.random() > 0.5 ? 1 : -1) * Math.floor((Math.random() * 2) + 1)) * modifier)
            ];
        }
    } while (randomOptions[0] == randomOptions[1] || randomOptions[0] <= 0 || randomOptions[1] <= 0)

    const options = ShuffleArray([
        result,
        result + randomOptions[0],
        result + randomOptions[1]
    ]);

    for (let i = 0; i < optionsList.length; i++) {
        optionsList[i].textContent = options[i];
    }
}

function ClockCountdown() {
    let clockPercent = 0;

    clockValueElement.textContent = timer.total;
    timer.current = timer.total;

    // valor do númerico do relógio
    timerInterval = setInterval(() => {
        if(timer.current <= 0) {
            clearInterval(timerInterval);
            CallLoseScreen("clock");
        }

        clockValueElement.textContent = timer.current--;
    }, 1000);

    // animação de contagem regressiva
    clockIntervalMilliseconds = 0;
    clockInterval = setInterval(() => {
        if(clockPercent >= 100) {
            clearInterval(clockInterval);
        }

        clockPercent = (clockIntervalMilliseconds*100)/( (timer.total + 1) * 1000);
        clock.style.setProperty("background-image",`conic-gradient(var(--color-dark-blue) 0%, var(--color-dark-blue) ${clockPercent}%, transparent ${clockPercent+1}%, transparent 100%)`);
        
        clockIntervalMilliseconds+=10;

    }, 10);


}

function ExitToMenu() {
    window.location.href = menuUrl;
}

/*==================================== WIN FUNCTIONS ==================================== */

winExitBtn.addEventListener("click", () => {
    ExitToMenu();
});

function CallWinScreen() {
    StopClock();
    setTimeout(() => SetElementsBgColor("white"), 500);
    livesList.forEach((e) => e.style.setProperty("filter", "saturate(0%) brightness(200%)"));

    winDifficultyName.textContent = DifficultyNames.ptbr[selectedDifficulty-1];
    winMedal.src = winMedal.src.replace(/(\/clock-)(.*?)(\.)/,`/clock-${DifficultyNames.en[selectedDifficultySpeed-1]}.`);

    if(lives >= 3) {
        medalWinLevel = 2;
        winMedal.setAttribute("data-medal-level", medalWinLevel);
    }

    SetWinMedal();

    winScreen.style.setProperty("display", "inherit");
}

function SetWinMedal() {
    const medalId = localStorage.getItem("levels").split(",").find(value => new RegExp(gameSessionId).test(value)).split("=");
    
    const medalLevel = parseInt(medalId[1]);

    const levelLetter = GetStringLetters(gameSessionId);
    const levelNumber = Number(GetStringNumbers(gameSessionId));
    
    const nextLevelId = levelLetter + (levelNumber + 1);

    if (medalWinLevel > medalLevel) {
        localStorage.setItem("levels", localStorage.getItem("levels").replace(medalId.join("="), `${gameSessionId}=${medalWinLevel}`));
    }
    localStorage.setItem("levels", localStorage.getItem("levels").replace(`${nextLevelId}=locked`, `${nextLevelId}=0`));
}

/*==================================== LOSE FUNCTIONS ==================================== */

repeatBtn.addEventListener("click", () => {
    StartGame(selectedDifficulty);
    loseScreen.style.setProperty("display", "none");
});

loseExitBtn.addEventListener("click", () => {
    ExitToMenu();
});

function CallLoseScreen(loseBy = "lives") {
    StopClock();
    SetElementsBgColor("var(--color-red)");

    if(loseBy == "lives") loseMessage.innerHTML = "Suas vidas acabaram, mas suas chances NÃO!<br><br>Vamos repetir?";
    else loseMessage.innerHTML = "Ah, não! O seu tempo acabou...<br><br>Vamos repetir?";

    loseScreen.style.setProperty("display", "inherit");
}

/*==================================== UTILITY FUNCTIONS ==================================== */

function ShuffleArray(array) {
    //embaralha os valores dentro de um array
    for (let i = 0; i < array.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array;
}

function ConvertGameSessionLevelLetter(gameSession) {
    if(gameSession == "d") return 3;
    else if(gameSession == "m") return 2;
    else return 1;
}

function GetStringLetters(string){
    return string.match(/[a-zA-Z]+/g);
}

function GetStringNumbers(string){
    return string.match(/\d+/g);
}