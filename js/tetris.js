import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
const gameStarButton = document.querySelector(".game-start");
const audioTag = document.querySelector(".tetris-music");
const muteButton = document.querySelector(".music-mute");
const bestScore = document.querySelector(".best-score > span");

//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//Variables
let score = 0;
let duration = 500;
let dowInterval;
let tempMovingItem;

const BEST_SCORE = "bestScroe";

const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 0
}

init()

//functins
function gameStart() {
    musicOn();
    generateNewBlock();
    gameStarButton.style.display = "none";
}

function musicMute() {
    audioTag.pause();
}

function musicOn() {
    audioTag.play();
}

function init() {
    tempMovingItem = {...movingItem};
    for(let i=0; i<GAME_ROWS; i++) {
        prependNewLine();
    }
    bestScore.innerText = localStorage.getItem(BEST_SCORE);
}

function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    
    for(let j=0; j<GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }

    li.prepend(ul);
    playground.prepend(li);
}

function renderBlocks(moveType = "") {
    const {type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving")
    })
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        
        if(isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = {...movingItem}
            if(moveType === "retry") {
                clearInterval(dowInterval);
                showGameoverText();
                setBestScore(score);
            }
            setTimeout(() => {
                renderBlocks("retry");
                if(moveType === "top") {
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function setBestScore(score) {
    let currentScore = localStorage.getItem(BEST_SCORE);

    if(currentScore < score) {
        localStorage.setItem(BEST_SCORE, score);
    }
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving")
        moving.classList.add("seized")
    })
    checkMatch()
}

function checkMatch() {
    const childNodes = playground.childNodes;

    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if(matched) {
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock();
}

function generateNewBlock() {
    clearInterval(dowInterval);
    dowInterval = setInterval(() => {
        moveBlock('top', 1);
    }, duration);

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);

    movingItem.type = blockArray[randomIndex][0];;
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem};
    renderBlocks();
}

function checkEmpty(target) {
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount
    renderBlocks(moveType);
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock() {
    clearInterval(dowInterval);
    dowInterval = setInterval(() => {
        moveBlock("top", 1);
    }, 10)
}

function showGameoverText() {
    gameText.style.display = "flex"
    audioTag.currentTime = 0;
    musicMute();
}

//event handling
document.addEventListener("keydown", e => {
    if(e.key === "ArrowRight") {
        moveBlock("left", 1);
    } else if(e.key === "ArrowLeft") {
        moveBlock("left", -1);
    } else if(e.key === "ArrowDown") {
        moveBlock("top", 1);
    } else if(e.key === "ArrowUp") {
        changeDirection();
    } else if(e.key === " ") {
        dropBlock();
    }
});

restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none"
    scoreDisplay.innerText = 0;
    musicOn();
    init();
})

gameStarButton.addEventListener("click", gameStart);
muteButton.addEventListener("click", musicMute);