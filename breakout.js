//varijable za ploču igre
let board;
let boardWidth = 800;
let boardHeight = 600;

//varijable za palicu
let paddleWidth = 130;
let paddleHeight = 15;
let paddleSpeed = 7;
let paddle = {
    x: boardWidth / 2 - paddleWidth / 2,
    y: boardHeight - 30,
    width: paddleWidth,
    height: paddleHeight,
    dx: 7,
    speed: paddleSpeed
};

//varijable za lopticu
let ballRadius = 13;
let ballSpeed = 4;
let ball ={
    x: boardWidth / 2 - ballRadius / 2,
    y: paddle.y - ballRadius,
    radius: ballRadius,
    speed: ballSpeed,
    dx: (Math.random() * 8) - 4,
    dy: -4
}

//varijable za cigle
let bricks = [];
let numOfCols = 8;
let numOfRows = 6;
let brickWidth = 84;
let brickHeight = 20;
let bricksCount = 0;

//varijable za bodove
let score = 0;
let maxScore = numOfCols * numOfRows;
let highScore = localStorage.getItem('highScore') || 0;

//varijable za igru
let gameOverVar = false;

let context;

window.onload = function() {
    board = document.getElementById('gameBoard');
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext('2d'); //za crtanje po ploči

    requestAnimationFrame(update)

    document.addEventListener('keydown', movePaddle);

    //kreiranje cigli
    createBricks();
}

//funkcija za ažuriranje ploče
function update() {

    //ako je igra gotova, ne ažuriraj ploču
    if(gameOverVar) {
        return;
    }

    context.clearRect(0, 0, boardWidth, boardHeight);

    //crtanje palice
    context.shadowBlur = 10;
    context.shadowColor = 'black';
    context.fillStyle = 'red';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    //crtanje loptice
    context.shadowBlur = 10;
    context.shadowColor = 'black';
    context.fillStyle = 'white';
    ball.x = ball.x + ball.dx;
    ball.y = ball.y + ball.dy;
    context.fillRect(ball.x, ball.y, ball.radius, ball.radius);

    //odbijanje od zidova ili palice
    if (ball.x + ball.radius > boardWidth || ball.x < 0) {
        //ako je loptica došla do lijeve ili desne strane
        ball.dx = -ball.dx; //promjena smjera loptice

    } else if (ball.y < 0) {
        //ako je loptica došla do vrha
        ball.dy = -ball.dy; //promjena smjera loptice

    } else if (topCollision(ball, paddle) || bottomCollision(ball, paddle)) {
        //ako je loptica došla do palice
        ball.dy = -ball.dy; //promjena smjera loptice

    } else if (leftCollision(ball, paddle) || rightCollision(ball, paddle)) {
        //ako je loptica došla do palice
        ball.dx = -ball.dx; //promjena smjera loptice

    } else if (ball.y + ball.radius > boardHeight) {
        //ako je loptica došla do dna
        gameOver();
    }

    //crtanje cigli
    context.shadowBlur = 10;
    context.shadowColor = 'black';
    context.fillStyle = 'skyblue';
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if(!brick.broken) {
            //ako je loptica došla do cigle s gornje ili donje strane
            if(topCollision(ball, brick) || bottomCollision(ball, brick)) {
                brick.broken = true;
                ball.dy = -ball.dy; //promjena smjera loptice
                score++;
                bricksCount--;
                //ako je postignut najbolji rezultat
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                }
                //ako su sve cigle razbijene
                if (bricksCount === 0) {
                    winnerMessage();
                }
            //ako je loptica došla do cigle s lijeve ili desne strane
            } else if (leftCollision(ball, brick) || rightCollision(ball, brick)) {
                brick.broken = true;
                ball.dx = -ball.dx;
                score++;
                bricksCount--;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                }
                if (bricksCount === 0) {
                    winnerMessage();
                }
            }
            context.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    }

    //praćenje bodova
    drawScores();

    requestAnimationFrame(update);
}

//funkcija za pomicanje palice
function movePaddle(e) {

    //ako je pritisnuta tipka desno i ako palica nije došla do kraja ploče
    if (e.key === 'ArrowRight' && paddle.x + paddle.width < boardWidth) {
        paddle.x += paddle.speed;

    //ako je pritisnuta tipka lijevo i ako palica nije došla do kraja ploče
    } else if (e.key === 'ArrowLeft' && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}

//funkcija za kreiranje cigli
function createBricks() {
    bricks = [];
    for (let i = 0; i < numOfCols; i++) {
        for (let j = 0; j < numOfRows; j++) {
            let brick = {
                x: i * (brickWidth + 10) + 30, //udaljenost između cigli horizontalno
                y: j * (brickHeight + 10) + 30, //udaljenost između cigli okomito
                width: brickWidth,
                height: brickHeight,
                broken: false
            }
            bricks.push(brick);
        }
    }
    bricksCount = bricks.length;
}

//funkcija za detekciju kolizija
function detectCollisions(a, b) {
    return a.x < b.x + b.width && //lijeva strana loptice je manja od desne strane cigle
        a.x + a.radius > b.x && //desna strana loptice je veća od lijeve strane cigle
        a.y < b.y + b.height && //gornja strana loptice je manja od donje strane cigle
        a.y + a.radius > b.y; //donja strana loptice je veća od gornje strane cigle
}

//funkcije za detekciju kolizija s gornjom, donjom, lijevom i desnom stranom cigle

function topCollision(ball, brick) {
    return detectCollisions(ball, brick) && (ball.y + ball.radius) >= brick.y;
}

function bottomCollision(ball, brick) {
    return detectCollisions(ball, brick) && (brick.y + brick.height) >= ball.y;
}

function leftCollision(ball, brick) {
    return detectCollisions(ball, brick) && (ball.x + ball.radius) >= brick.x;
}

function rightCollision(ball, brick) {
    return detectCollisions(ball, brick) && (brick.x + brick.width) >= ball.x;
}

//funkcija za crtanje bodova
function drawScores() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(`Najbolji rezultat: ${highScore}`, 20, 20);
    context.fillText(`Bodovi: ${score}`, boardWidth - 360, 20);
    context.fillText('Maksimalan broj bodova: ' + maxScore, boardWidth - 260, 20);
}

//funkcija za kraj igre
function gameOver() {
    gameOverVar = true;
    drawScores();
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = 'white';
    context.font = '40px Arial';
    context.fillText('GAME OVER', boardWidth / 2 - context.measureText('GAME OVER').width / 2, boardHeight / 2);
    document.removeEventListener('keydown', movePaddle);
}

//funkcija za poruku o pobjedi
function winnerMessage() {
    gameOverVar = true;
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = 'white';
    context.font = '40px Arial';
    context.fillText('Čestitamo, pobijedili ste!', boardWidth / 2 - context.measureText('Čestitamo, pobijedili ste!').width / 2, boardHeight / 2)
    document.removeEventListener('keydown', movePaddle);
}

