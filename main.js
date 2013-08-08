enchant();

var checked = 0;
var stage = 1;
var board, bar, game,
    score = 0, time = 0, rest = 400, size = 24;


var stages = {
    1: {width: 8, height: 8, bonus: 100},
    2: {width: 10, height: 8, bonus: 100},
    3: {width: 13, height: 8, bonus: 100},
    4: {width: 13, height: 10, bonus: 100},
    5: {width: 13, height: 10, bonus: 100},
    6: {width: 13, height: 10, bonus: 100},
    7: {width: 13, height: 10, bonus: 100},
    8: {width: 13, height: 10, bonus: 100},
    9: {width: 13, height: 10, bonus: 100},
    10: {width: 13, height: 10, bonus: 100}
};

window.onload = function() {
    game = new Game(320, 320);
    game.fps = 20;
    game.preload('fruits.png', 'bar.png', 'se2.wav', 'se6.wav', 'se7.wav', 'lock2.wav', 'jingle03.wav', 'bomb2.wav', 'bomb3.wav');

    game.onload = function() {
        resetBoard();

        bar = new Sprite(1, 12);
        bar.image = game.assets['bar.png'];
        bar.defaultpos = {x: 16, y: 40};
        rest = Math.max(0, rest);
        bar.width = rest / 2;

        game.rootScene.addChild(bar);
        game.texts = [];
        game.pinch = false;

        game.texts.score = new MutableText(16, 8, game.width, "Score:" + score);
        game.rootScene.addChild(game.texts.score);

        game.texts.time = new MutableText(16, 24, game.width, "Time:" + (rest / game.fps).toFixed(2) + 's');
        game.rootScene.addChild(game.texts.time);

        game.texts.bonus = new MutableText(16, 56, game.width, "");
        game.rootScene.addChild(game.texts.bonus);


        game.timer = [];
    };

    game.rootScene.addEventListener('enterframe',
        function() {
            for (var p in board) {
                for (var q in board[p]) {
                    var fruit = board[p][q];
                    if (fruit.x != fruit.target.x)fruit.x += Math.max(-8, Math.min(10, fruit.target.x - fruit.x));
                    if (fruit.y != fruit.target.y)fruit.y += Math.max(-8, Math.min(10, fruit.target.y - fruit.y));
                    if (rest < 100) {
                        if (!game.pinch) {
                            game.pinch = true;
                            game.assets['jingle03.wav'].play();
                        }
                        fruit.x += rand(3) - 1;
                    } else {
                        if (game.pinch) {
                            game.pinch = false;
                            game.assets['jingle03.wav'].stop();
                        }
                    }
                }
            }

            time++;
            rest--;
            rest = Math.min(rest, 400);
            bar.width = rest / 2;
            game.texts.time.setText("Time: " + (rest / game.fps).toFixed(2));
            game.texts.score.setText("Score: " + score);

            if (rest <= 0) {
                game.end(score, 'スコア: ' + score);
                game.assets['bomb3.wav'].play();
            }

        }
    );
    game.start();
};

function setBonus(bonus, time) {
    game.texts.bonus.setText(bonus)
    if (game.timer.bonus) clearTimeout(game.timer.bonus);
    game.timer.bonus = setTimeout(
        function() {
            game.texts.bonus.setText("");
        }
        , time);
}


function clearBoard() {
    for (var p in board) {
        for (var q in board[p]) {
            game.rootScene.removeChild(board[p][q]);
        }
    }
}

function getNumOfFruits() {
    var fruits = 0;
    for (var p in board) {
        for (var q in board[p]) {
            fruits++;
        }
    }
    return fruits;
}


function resetBoard() {
    width = stages[stage].width;
    height = stages[stage].height;

    board = new Array(width);
    for (var i = 0; i < width; i++) {
        board[i] = new Array(height);
        for (var j = 0; j < height; j++) {
            board[i][j] = new Sprite(16, 16);
            board[i][j].scaleX = size / 16;
            board[i][j].scaleY = size / 16;
            board[i][j].x = i * size + 5;
            board[i][j].y = (height - j - 1) * size + 64 - 240 - i * 10;

            board[i][j].target =
            { x: 0,
                y: 0};

            board[i][j].i = i;
            board[i][j].j = j;
            board[i][j].checked = false;
            board[i][j].image = game.assets['fruits.png'];
            board[i][j].frame = rand(4) + 1;

            //爆弾
            if (stage > 4 && rand(200) < stage * 2 + 5) {
//                if(true){
                board[i][j].frame = 0;
            }
            game.rootScene.addChild(board[i][j]);
            board[i][j].update = function() {
                this.target.x = this.i * size + 5;
                this.target.y = 320 - (this.j + 1) * size;
            }
            board[i][j].update();
        }
    }
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            board[i][j].addEventListener(
                'touchstart',
                function() {
                    click(this.i, this.j)
                }
            );
        }
    }
}


function click(i, j) {
    clearcheck();

    checked = 0;
    check(i, j);

    if (board[i][j].frame == 0) {
        if (checked < 5) {
            damage = Math.ceil(rest / 2);
            rest -= damage;
            setBonus('BOMB!! -' + (damage / game.fps) + 's', 2000);
            var bomb = game.assets['bomb2.wav'].clone();
            bomb.play();
        }
    }

    if (checked > 1) {
        score += Math.pow(checked, 2) * 20;
        if (checked >= 5) {
            bonus = Math.pow(checked - 2, 2) * 10 / (stage + 2);
            rest += bonus;
            setBonus(checked + "Combo +" + (bonus / game.fps).toFixed(1) + 's', 1000);
            var se = game.assets['se6.wav'].clone();
            se.play();
        } else {
            var se = game.assets['se2.wav'].clone();
            se.play();
        }
        //    #("#log").text(score);

        for (var p = width - 1; p >= 0; p--) {
            if (board[p]) {
                if (board[p].length == 0) {
                    board.splice(p, 1);
                } else {
                    for (var q = height - 1; q >= 0; q--) {
                        if (board[p][q] && board[p][q].checked) {
                            game.rootScene.removeChild(board[p][q]);
                            board[p].splice(q, 1);
                        }
                    }
                }
            }
        }

        var newBoard = new Array();
        for (var p = 0; p < width; p++) {
            if (board[p] && board[p].length > 0) {
                for (var q in board[p]) {
                    board[p][q].i = newBoard.length;
                    board[p][q].update();
                }
                newBoard.push(board[p]);
            }
        }
        board = newBoard;
        newBoard = []

        for (var p in board) {
            newBoard[p] = new Array();
            for (var q = 0; q < height; q++) {
                if (board[p][q]) {
                    newBoard[p].push(board[p][q]);
                    board[p][q].j = q;
                    board[p][q].update();
                }
            }
        }
    } else {
        //お手つき
        var se = game.assets['lock2.wav'].clone();
        se.play();
        rest -= stage;
    }
    if (endcheck()) {
        //game.end(score,'スコア:' + score);
        var bonus = stages[stage].bonus;
        rest += bonus;

        stage++;
        game.assets['se7.wav'].play();
        setBonus('STAGE' + stage + ' +' + (bonus / game.fps).toFixed(1), 3000);

        if (!stages[stage]) {
            alert('Game Clear!!!')
        } else {
            clearBoard();
            resetBoard();
        }
    }
}


function clearcheck() {
    for (var p in board) {
        for (var q in board[p]) {
            board[p][q].checked = false;
        }
    }
    checked = 0;
}

function endcheck() {
    for (var p in board) {
        for (var q in board[p]) {
            if (board[p][q].frame == 0)continue;
            clearcheck();
            check(p, q);
            if (checked > 1) {
                return false;
            }
        }
    }
    return true;
}

function check(i, j) {
    if (board[i][j].checked) {
        return false;
    }

    board[i][j].checked = true;
    if (board[i - 1] && board[i - 1][j] && board[i][j].frame == board[i - 1][j].frame) check(i - 1, j);
    if (board[i] && board[i][j - 1] && board[i][j].frame == board[i][j - 1].frame) check(i, j - 1);
    if (board[i + 1] && board[i + 1][j] && board[i][j].frame == board[i + 1][j].frame) check(i + 1, j);
    if (board[i] && board[i][j + 1] && board[i][j].frame == board[i][j + 1].frame) check(i, j + 1);
    checked++;
    return true;
}

function rand(max) {
    return Math.floor(Math.random() * max)
}
