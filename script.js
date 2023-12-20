import tileData from "./tileData.js";

const moveCount = document.querySelector('.move-count');
const puzzleGrid = document.querySelector('.puzzle-grid');
const startButton = document.querySelector('.start-puzzle');
const message = document.querySelector('.message');
const tiles = [];
let squaresArray = [...Array(8).keys()].map(x => ++x);
let playing = false;
let targetTile = null;
let moveComplete = true;
let blankSquare = '9';
let moving = false;
let moves = 0;
let mousePosition = {};
let offset = [];
let minX, maxX, minY, maxY, leftVal, topVal;

const appendTiles = () => {
    let i = 0;
    for (const tile of tiles) {
        tile.className = ''
        tile.className = `pos-${squaresArray[i]}`;

        puzzleGrid.appendChild(tile);

        i++;
    }
};

const createTiles = () => {
    for (const sq of squaresArray) {
        const tile = document.createElement('div');
        tile.id = `tile-${sq}`;

        tiles.push(tile);
    }

    appendTiles();
}

const shuffle = () => {
    moves = 0;
    moveCount.textContent = moves;
    playing = true;
    startButton.classList.add('playing');

    squaresArray = squaresArray
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value).slice(0, squaresArray.length);

    let inversions = 0;
    // Had to look this bit up, calculates inversion value to sort the array
    for(let i = 0; i < squaresArray.length - 1; i++) {
        for(let j = i + 1; j < squaresArray.length; j++) {
            if(squaresArray[i] > squaresArray[j]) inversions++;
        }
    }

    // Check if puzzle is solvable
    // Otherwise reshuffle
    if (inversions % 2 === 1) {
        shuffle();
    } else {
        puzzleGrid.innerHTML = '';

        appendTiles();
    }
}

const canMove = () => blankSquare in tileData[targetTile.className];

const dragTile = e => {
    if (!targetTile) {
        return;
    }

    const direction = tileData[targetTile.className][blankSquare].direction;
    const currentStyles = window.getComputedStyle(targetTile);
    minX = tileData[targetTile.className][blankSquare].minX;
    maxX = tileData[targetTile.className][blankSquare].maxX;
    minY = tileData[targetTile.className][blankSquare].minY;
    maxY = tileData[targetTile.className][blankSquare].maxY;
    leftVal = parseInt(currentStyles.getPropertyValue('left').replace('px', ''));
    topVal = parseInt(currentStyles.getPropertyValue('top').replace('px', ''));
    moving = true;

    mousePosition = {
        x : e.clientX,
        y : e.clientY
    };

    if (direction === 'left' || direction === 'right') {
        const currentXPos = mousePosition.x + offset[0];
        if((leftVal > minX && leftVal > currentXPos) || (leftVal < maxX && leftVal < currentXPos)) {
            targetTile.style.left = `${currentXPos}px`;
        }

        if (leftVal < minX) {
            targetTile.style.left = `${minX}px`;
        } else if (leftVal > maxX) {
            targetTile.style.left = `${maxX}px`;
        }
    } else {
        const currentYPos = mousePosition.y + offset[1];
        if(topVal > minY && topVal > currentYPos || topVal < maxY && topVal < currentYPos) {
            targetTile.style.top = `${currentYPos}px`;
        }

        if (topVal < minY) {
            targetTile.style.top = `${minY}px`;
        } else if (topVal > maxY) {
            targetTile.style.top = `${maxY}px`;
        }
    }
};

const selectSquare = e => {
    if (!playing || !e.target.className.startsWith('pos-')) return;

    moveComplete && (targetTile = document.querySelector(`#${e.target.id}`));

    if(canMove()) {
        targetTile.addEventListener('mousemove', dragTile);

        offset = [
            targetTile.offsetLeft - e.clientX,
            targetTile.offsetTop - e.clientY
        ];
    } else {
        targetTile = null;
    }
};

const checkOrder = () => {
    const tileOrder = document.querySelectorAll('.puzzle-grid div');

    for (const tile of tileOrder) {
        const tileId = parseInt(tile.id.replace('tile-', ''));
        const tileClass = parseInt(tile.className.replace('pos-', ''));

        if (tileId != tileClass) return;
    };

    playing = false;
    startButton.classList.remove('playing');
    squaresArray = [...Array(8).keys()].map(x => ++x)
};

const deselectSquare = () => {
    if(moving === false && moveComplete === true) {
        targetTile = null;
        return;
    }

    if (targetTile) {
        targetTile.removeEventListener('mousemove', dragTile);
        message.classList.contains('show') && message.classList.remove('show');

        if (leftVal === minX || leftVal === maxX || topVal === minY || topVal === maxY) {
            const newPos = blankSquare;

            blankSquare = targetTile.className.slice(-1);
            targetTile.className = `pos-${newPos}`;
            moveComplete = true;
            moveCount.textContent = ++moves;

            checkOrder();
        } else {
            moveComplete = false;
            message.classList.add('show');
        }
    }

    moving = false;
}

const init = () => {
    createTiles();

    startButton.addEventListener('click', shuffle);

    puzzleGrid.addEventListener('mousedown', selectSquare);
    puzzleGrid.addEventListener('mouseup', deselectSquare);
};

window.addEventListener('load', init);