import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
const gameStarButton = document.querySelector(".game-start");
const audioTag = document.querySelector(".tetris-music");
const muteButton = document.querySelector(".music-mute");

//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//Variables
let score = 0;
let duration = 500;
let dowInterval;
let tempMovingItem;


const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3
}

function gameStart() {
    init();
    musicOn();
    gameStarButton.style.display = "none";
}

function musicMute() {
    audioTag.pause();
}

function musicOn() {
    audioTag.play();
}

//functins
function init() {
    //스프레드 오퍼레이터는 안의 값을 복사해서 가져온다는 느낌 중요!
    // 객체이기 때문에 그 값을 가르키는 전체가 변경되는것이 아닌 그 값만 딱 가져와서 사용한다 너무 중요
    tempMovingItem = {...movingItem};
    for(let i=0; i<GAME_ROWS; i++) {
        prependNewLine();
    }
    generateNewBlock()
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
    //디스트럭처링을 사용해서 변수처럼 사용할 수 있게
    const {type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving")
    })
    BLOCKS[type][direction].some(block => {
        //forEach는 반복문을 중간에 중지할 수 없다. some을 사용하면 반복문을 중간에 중지?할 수 있다.
        const x = block[0] + left;
        const y = block[1] + top;
        //childNodes 는 배열처럼 배열 메소드를 사용할 수 있는 형태로 반환이 되기 때문에 사용한다.
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = {...movingItem}
            if(moveType === "retry") {
                clearInterval(dowInterval);
                showGameoverText();
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
    musicMute();
}

//event handling
document.addEventListener("keydown", e => {
    //각각의 키는 고유한 키 코드가 존재한다.
    if(e.keyCode === 39) {
        moveBlock("left", 1);
    } else if(e.keyCode === 37) {
        moveBlock("left", -1);
    } else if(e.keyCode === 40) {
        moveBlock("top", 1);
    } else if(e.keyCode === 38) {
        changeDirection();
    } else if(e.keyCode === 32) {
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