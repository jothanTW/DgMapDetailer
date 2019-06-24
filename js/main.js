const backgroundColor = "#EEEEEE";
const lineColor = "#000000";
const shadecolor = "#00000040";

const tileSize = 64;
const widthInTiles = 16;
const heightInTiles = 16;
const width = tileSize * widthInTiles;
const height = tileSize * heightInTiles;

const wallDotDensity = 100;
const wallDotBias = 12;

const crackChance = 0.5;
const crackShakeIter = 12;
const crackShake = 2;

const shadePercent = 0.2;
const shadeLen = tileSize * shadePercent;

const rockFlex = 0.01;
const rockIter = 0.01;

const mapcanvas = document.getElementById("mapcanvas");
mapcanvas.width = width;
mapcanvas.height = height;
const mapcanvasctx = mapcanvas.getContext("2d");

mapcanvasctx.fillStyle = backgroundColor;
mapcanvasctx.strokeStyle = lineColor;
mapcanvasctx.lineWidth = width / 512;

var tiles = [];
var rocks = [];

for (let j = 0; j < heightInTiles; j++) {
    for (let i = 0; i < widthInTiles; i++) {
        if (i > 4 && i <  8 && j > 8 && j < 15 ||
            i > 7 && i < 12 && j > 2 && j < 9 ||
            i == 6 && j > 8 ||
            i > 4 && i < 10 && j == 10 ||
            i == 9 && j == 9 ||
            i > 7 && j == 5) {
            tiles.push(true);
        } else {
            tiles.push(false);
        }
    }
}

var addremtile = false;

function doClick(evt) {
    if (evt.which != 1) {
        return;
    }
    let cx = Math.floor((evt.clientX - mapcanvas.offsetLeft) * width / 512 / tileSize);
    let cy = Math.floor((evt.clientY - mapcanvas.offsetTop) * height / 512 / tileSize);
    if (cx >= 0 && cx < widthInTiles && cy >= 0 && cy < heightInTiles) {
        addremtile = !tiles[cx + cy * widthInTiles];
        tiles[cx + cy * widthInTiles] = addremtile;
        drawTiles();
    }
}

function doMouseOver(evt) {
    if (evt.which != 1) {
        return;
    }
    let cx = Math.floor((evt.clientX - mapcanvas.offsetLeft) * width / 512 / tileSize);
    let cy = Math.floor((evt.clientY - mapcanvas.offsetTop) * height / 512 / tileSize);
    if (cx >= 0 && cx < widthInTiles && cy >= 0 && cy < heightInTiles && tiles[cx + cy * widthInTiles] != addremtile) {
        tiles[cx + cy * widthInTiles] = addremtile;
        drawTiles();
    }
}

//rocks.push({x: 6, y: 10});

function drawTiles() {
    mapcanvasctx.fillStyle = backgroundColor;

    mapcanvasctx.fillRect(0, 0, width, height);



    // draw tiles
    for (let i = 0; i < widthInTiles; i++) {
        for (let j = 0; j < heightInTiles; j++) {
            if (tiles[i + j * widthInTiles]) {
                // open tile
                mapcanvasctx.strokeRect(i * tileSize, j * tileSize, tileSize, tileSize);
                if (Math.random() < crackChance) {
                    // pick a random side, a random point on that side, a random adjacant side, and a random point on that side
                    let side = Math.floor(Math.random() * 4);
                    let spt = Math.floor(Math.random() * tileSize * 9 / 10 + tileSize / 20);
                    let adj = Math.random() < 0.5 ? 1 : 0;
                    let apt = Math.floor(Math.random() * tileSize / 4);
                    let p1x = 0; 
                    let p1y = 0;
                    let p2x = 0;
                    let p2y = 0;

                    switch (side) {
                        case 0: // top
                            p1x = spt;
                            p2x = adj == 0 ? 0 : tileSize;
                            p2y = apt;
                        break;
                        case 1: // bottom
                            p1x = spt;
                            p1y = tileSize;
                            p2x = adj == 0 ? 0 : tileSize;
                            p2y = tileSize - apt;
                        break;
                        case 2: // left
                            p1y = spt;
                            p2x = apt;
                            p2y = adj == 0 ? 0 : tileSize;
                        break;
                        case 3: // right
                            p1x = tileSize;
                            p1y = spt;
                            p2x = tileSize - apt;
                            p2y = adj == 0 ? 0 : tileSize;
                        break;
                    }

                    // to determine the shake, generate a set of points along the line
                    let dist = Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
                    let shakePoints = [];
                    for (let d = 0; d < dist; d += crackShakeIter) {
                        let skptx = Math.floor(p1x - (p1x - p2x) * d / dist + Math.random() * crackShake * 2 - crackShake);
                        let skpty = Math.floor(p1y - (p1y - p2y) * d / dist + Math.random() * crackShake * 2 - crackShake);
                        shakePoints.push({x: skptx, y: skpty});
                    }

                    mapcanvasctx.beginPath();
                    mapcanvasctx.moveTo(p1x + i * tileSize, p1y + j * tileSize);
                    for (let d = 0; d < shakePoints.length; d++) {
                        mapcanvasctx.lineTo(shakePoints[d].x + i * tileSize, shakePoints[d].y + j * tileSize);
                    }
                    mapcanvasctx.lineTo(p2x + i * tileSize, p2y + j * tileSize);
                    mapcanvasctx.lineWidth = width / 512 / 2;
                    mapcanvasctx.stroke();
                    mapcanvasctx.lineWidth = width / 512;
                }

                // draw shadow
                let didLeft = false;
                let didTop = false;
                mapcanvasctx.fillStyle = shadecolor;
                if (i > 0 && !tiles[i - 1 + j * widthInTiles]) {
                    mapcanvasctx.beginPath();
                    mapcanvasctx.moveTo(i * tileSize, j * tileSize);
                    mapcanvasctx.lineTo(i * tileSize + shadeLen, j * tileSize + shadeLen);
                    mapcanvasctx.lineTo(i * tileSize + shadeLen, j * tileSize + tileSize);
                    mapcanvasctx.lineTo(i * tileSize, j * tileSize + tileSize);
                    mapcanvasctx.closePath();
                    mapcanvasctx.fill();
                    didLeft = true;
                }
                if (j > 0 && !tiles[i + j * widthInTiles - widthInTiles]) {
                    mapcanvasctx.beginPath();
                    mapcanvasctx.moveTo(i * tileSize, j * tileSize);
                    mapcanvasctx.lineTo(i * tileSize + shadeLen, j * tileSize + shadeLen);
                    mapcanvasctx.lineTo(i * tileSize + tileSize, j * tileSize + shadeLen);
                    mapcanvasctx.lineTo(i * tileSize + tileSize, j * tileSize);
                    mapcanvasctx.closePath();
                    mapcanvasctx.fill();
                    didTop = true;
                }
                if (j > 0 && i > 0 && !tiles[i - 1 + j * widthInTiles - widthInTiles] && (!didLeft || !didTop)) {
                    mapcanvasctx.beginPath();
                    mapcanvasctx.moveTo(i * tileSize, j * tileSize);
                    if (!didTop) {
                        mapcanvasctx.lineTo(i * tileSize + shadeLen, j * tileSize);
                    }
                    mapcanvasctx.lineTo(i * tileSize + shadeLen, j * tileSize + shadeLen);
                    if (!didLeft) {
                        mapcanvasctx.lineTo(i * tileSize, j * tileSize + shadeLen);
                    }
                    mapcanvasctx.closePath();
                    mapcanvasctx.fill();
                }
                mapcanvasctx.fillStyle = backgroundColor;
            } else {
                // wall
                if (i < widthInTiles - 1 && tiles[i + 1 + j * widthInTiles]) {
                    for (let d = 0; d < wallDotDensity; d++) {
                        let dotl = 0;
                        let dotp = Math.floor(Math.random() * tileSize);
                        for (let w = 0; w < wallDotBias; w++) {
                            let dotr = Math.floor(Math.random() * tileSize);
                            if (dotr > dotl) { dotl = dotr }
                        }
                        mapcanvasctx.strokeRect(i * tileSize + dotl, j * tileSize + dotp, 1, 1);
                    }
                }
                if (i > 0 && tiles[i - 1 + j * widthInTiles]) {
                    for (let d = 0; d < wallDotDensity; d++) {
                        let dotl = tileSize;
                        let dotp = Math.floor(Math.random() * tileSize);
                        for (let w = 0; w < wallDotBias; w++) {
                            let dotr = Math.floor(Math.random() * tileSize);
                            if (dotr < dotl) { dotl = dotr }
                        }
                        mapcanvasctx.strokeRect(i * tileSize + dotl, j * tileSize + dotp, 1, 1);
                    }
                }
                if (j > 0 && tiles[i + j * widthInTiles - widthInTiles]) {
                    for (let d = 0; d < wallDotDensity; d++) {
                        let dotl = tileSize;
                        let dotp = Math.floor(Math.random() * tileSize);
                        for (let w = 0; w < wallDotBias; w++) {
                            let dotr = Math.floor(Math.random() * tileSize);
                            if (dotr < dotl) { dotl = dotr }
                        }
                        mapcanvasctx.strokeRect(i * tileSize + dotp, j * tileSize + dotl, 1, 1);
                    }
                }
                if (j < heightInTiles && tiles[i + j * widthInTiles + widthInTiles]) {
                    for (let d = 0; d < wallDotDensity; d++) {
                        let dotl = 0;
                        let dotp = Math.floor(Math.random() * tileSize);
                        for (let w = 0; w < wallDotBias; w++) {
                            let dotr = Math.floor(Math.random() * tileSize);
                            if (dotr > dotl) { dotl = dotr }
                        }
                        mapcanvasctx.strokeRect(i * tileSize + dotp, j * tileSize + dotl, 1, 1);
                    }
                }
            }
        }
    }

    //mapcanvasctx.shadowColor = shadecolor;
    //mapcanvasctx.shadowOffsetX = 8;
    //mapcanvasctx.shadowOffsetY = 8;

    // draw rocks
    rocks.forEach(rock => {
        let startAng = Math.random() * Math.PI * 2;
        let rockDist = 0.5;

        mapcanvasctx.beginPath();
        mapcanvasctx.moveTo(rock.x * tileSize + Math.cos(startAng) * rockDist * tileSize + tileSize / 2, 
                            rock.y * tileSize + Math.sin(startAng) * rockDist * tileSize + tileSize / 2);

        for (let a = 0; a < Math.PI * 2; a += Math.PI * 2 * rockIter) {
            mapcanvasctx.lineTo(rock.x * tileSize + Math.cos(startAng + a) * rockDist * tileSize + tileSize / 2, 
                                rock.y * tileSize + Math.sin(startAng + a) * rockDist * tileSize + tileSize / 2);
            rockDist += Math.random() * rockFlex * 2 - rockFlex;
            if (rockDist > 0.75) { rockDist = 0.75; }
            if (rockDist < 0.25) { rockDist = 0.25; }
            console.log("rock width " + rockDist);
        }

        mapcanvasctx.closePath();
        mapcanvasctx.stroke();
        mapcanvasctx.fill();
    });

    // mapcanvasctx.shadowColor = "transparent";
}

drawTiles();
//window.setInterval(drawTiles, 100);