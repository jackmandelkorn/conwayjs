//Conway.js
//Made originally by Jack Mandelkorn
//Email: jacman444@gmail.com

var version = "1.2.4";
document.getElementById("version").innerHTML = "v" + version;

Array.prototype.max = function(){
    return Math.max.apply( Math, this );
};

Array.prototype.min = function(){
    return Math.min.apply( Math, this );
};

window.onkeydown = function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
        return false;
    }
};

$(document).ready(function(){
    $(this).scrollTop(0);
});

var file;
var blob;
var controls = true;
var arraySave = [];
var grid = [];
var initGrid = [];
var colors = [];
var initColors = [];
var sprite = "./dot.png";
var generations = 0;
var paused = false;
var rewind = false;
var worldnumber = 1;
var currentName = "Untitled 0";

var blur = 1;

var canvas = document.getElementById("canvas");
canvas.width = canvas.offsetWidth * 1.001 * (1 / blur);
canvas.height = canvas.offsetHeight * 1.001 * (1 / blur);
var ctx = canvas.getContext("2d");

var shapes = [];

var scale = 4;
var scaleInt = (scale / blur);
var dimX = Math.floor(canvas.width / scaleInt);
var dimY = Math.floor(canvas.height / scaleInt);

var maxPop = 3;
var minPop = 2;
var reproductionPoint = 3;

var fps = 30;
var stepMode = true;
var inversion = false;
var slip = true;
var instability = false;
var initSteps = 3;
var saveTip = 1000;

var colorSet = ["red","orange","yellow","green","blue","purple"];
var birthColor = "black";
var background = "black";
var softness = 0;
var grayscale = false;

//var lifeForm = shapes[0];
var lifeForm = false;

for (i = 0; i < (dimX * dimY); i++) {
  grid.push(0);
  colors.push(birthColor);
}

if (lifeForm === false) {
  seed(2);
}
else {
  drawBeing();
}

function drawBeing() {
  var offX = Math.floor((dimX / 2) - (lifeForm[0] / 2));
  var offY = Math.floor((dimY / 2) - (lifeForm[1] / 2));
  var temp = 0;
  for(a = 0; a < lifeForm[1]; a++) {
    for (b = 0; b < lifeForm[0]; b++) {
      grid[offX + b + ((offY + a) * dimX)] = JSON.parse(lifeForm[2].charAt((a * lifeForm[0]) + b));
      if (grid[offX + b + ((offY + a) * dimX)] === 1) {
        colors[offX + b + ((offY + a) * dimX)] = lifeForm[3][temp];
        temp++;
      }
    }
  }
}

if (fps === 0) {
  blob = setInterval(function(){
    if (rewind) {
      reverseStep();
    }
    else {
      step();
    }
  },0);
}
else {
  blob = setInterval(function(){
    if (rewind) {
      reverseStep();
    }
    else {
      step();
    }
  },1000/fps);
}
onKey(32, function(){
  if (controls) {
    if (stepMode) {
      if (paused) {
        if (fps === 0) {
          blob = setInterval(function(){
            if (rewind) {
              reverseStep();
            }
            else {
              step();
            }
          },0);
        }
        else {
          blob = setInterval(function(){
            if (rewind) {
              reverseStep();
            }
            else {
              step();
            }
          },1000/fps);
        }
        paused = false;
      }
      else {
        clearInterval(blob);
        paused = true;
      }
    }
    else {
      step();
    }
  }
});
onKey(16, function(){
  if (controls) {
    if (stepMode === false || paused === true) {
      reverseStep();
    }
  }
});

render();

initGrid = grid;
initColors = colors;

if (lifeForm === false) {
  for (var t = 0; t < initSteps; t++) {
    step();
  }
}

reGrid(document.getElementById("gridInput").value);

//Functions

function seed(probability) {
  for (i = 0; i < (dimX * dimY); i++) {
    if (Math.floor(Math.random() * probability) === 0) {
      grid[i] = 1;
    }
    else {
      grid[i] = 0;
    }
    colors[i] = colorSet[Math.floor(Math.random() * colorSet.length)];
  }
  arraySave = [[grid,colors]];
}

function step() {
  if (arraySave.length === saveTip) {
    arraySave.shift();
  }
  arraySave.push([grid,colors]);
  var testArray = [];
  for (i = 0; i < (dimX * dimY); i++) {
    testArray.push(grid[i]);
    if (grid[i] === 0 && getNeighbors(i).length === 3) {
      if (inversion) {
        testArray[i] = 0;
      }
      else {
        testArray[i] = 1;
        colors[i] = getBirthColor(getNeighbors(i));
      }
    }
    else if (grid[i] === 1 && (getNeighbors(i).length > maxPop || getNeighbors(i).length < minPop)) {
      if (inversion) {
        testArray[i] = 1;
        colors[i] = getBirthColor(getNeighbors(i));
      }
      else {
        testArray[i] = 0;
      }
    }
  }
  grid = testArray;
  generations++;
  render();
}

function reverseStep() {
  if (arraySave.length > 0) {
    grid = arraySave[arraySave.length - 1][0];
    colors = arraySave[arraySave.length - 1][1];
    arraySave.pop();
    generations--;
    render();
  }
}

function getNeighbors(num) {
  var res = [];
  if (slip) {
    if (grid[num - 1] === 1) {
      res.push(num - 1);
    }
    if (grid[num + 1] === 1) {
      res.push(num + 1);
    }
    if (grid[num - dimX - 1] === 1) {
      res.push(num - dimX - 1);
    }
    if (grid[num - dimX] === 1) {
      res.push(num - dimX);
    }
    if (grid[num - dimX + 1] === 1) {
      res.push(num - dimX + 1);
    }
    if (grid[num + dimX - 1] === 1) {
      res.push(num + dimX - 1);
    }
    if (grid[num + dimX] === 1) {
      res.push(num + dimX);
    }
    if (grid[num + dimX + 1] === 1) {
      res.push(num + dimX + 1);
    }
  }
  else {
    if (grid[num - 1] === 1) {
      res.push(num - 1);
    }
    if (grid[num + 1] === 1) {
      res.push(num + 1);
    }
    if (grid[num - dimX] === 1) {
      res.push(num - dimX);
    }
    if (grid[num + dimX] === 1) {
      res.push(num + dimX);
    }
  }
  if (instability) {
    var testNum = Math.floor(Math.random() * instability);
    if (testNum === 0) {
      res.push(-1);
    }
    else if (testNum === 1) {
      res.pop();
    }
  }
  return res;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (a = 0; a < dimY; a++) {
    for (b = 0; b < dimX; b++) {
      var testNum = (a * dimX) + b;
      if (grid[testNum] === 1) {
        putImage(((canvas.width / dimX) * b),((canvas.height / dimY) * a),colors[testNum]);
      }
    }
  }
  updateRead();
  document.getElementById("worldName").innerHTML = currentName;
  document.getElementById("fileNameInput").placeholder = currentName;
}

function putImage(x,y,color) {
  var entwidth = canvas.width / dimX;
  var entheight = canvas.height / dimY;
  ctx.shadowBlur = softness;
  if (grayscale) {
    ctx.shadowColor = "#C0C0C0";
    ctx.fillStyle = "#C0C0C0";
  }
  else {
    ctx.shadowColor = color;
    ctx.fillStyle = color;
  }
  ctx.fillRect(x,y,entwidth,entheight);
}

function generateBeing(x,y) {
  var test = "";
  for (var i = 0; i < (x*y); i++) {
    test = test + JSON.stringify(Math.floor(Math.random() + 0.5));
  }
  console.log(test);
  return test;
}

function getBirthColor(array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = colors[array[i]];
  }
  var events = [];
  for (var i = 0; i < array.length; i++) {
    events.push(0);
  }
  for (var i = 0; i < array.length; i++) {
    var testNum = 0;
    for (var a = 0; a < array.length; a++) {
      if (array[a] === array[i]) {
        testNum++;
      }
    }
    events[i] = testNum;
  }
  if (events.max() === events.min()) {
    return array[Math.floor(Math.random() * array.length)];
  }
  else {
    return array[events.indexOf(events.max())];
  }
}

function update(obj) {
  obj.blur();
  if (obj.id === "blur") {
    blur = obj.value;
    canvas.width = canvas.offsetWidth * 1.001 * (1 / blur);
    canvas.height = canvas.offsetHeight * 1.001 * (1 / blur);
    scaleInt = (scale / blur);
    dimX = Math.floor(canvas.width / scaleInt);
    dimY = Math.floor(canvas.height / scaleInt);
    render();
  }
  else if (obj.id === "backgroundCol") {
    background = obj.value;
    render();
  }
  else if (obj.id === "keyControls") {
    if (obj.checked) {
      controls = true;
    }
    else {
      controls = false;
    }
  }
  else if (obj.id === "stepToggle") {
    if (obj.checked) {
      stepMode = true;
      if (fps === 0) {
        blob = setInterval(function(){
          if (rewind) {
            reverseStep();
          }
          else {
            step();
          }
        },0);
      }
      else {
        blob = setInterval(function(){
          if (rewind) {
            reverseStep();
          }
          else {
            step();
          }
        },1000/fps);
      }
      paused = false;
    }
    else {
      clearInterval(blob);
      stepMode = false;
    }
  }
  else if (obj.id === "rewindToggle") {
    if (obj.checked) {
      rewind = true;
      newBlob();
    }
    else {
      rewind = false;
      newBlob();
    }
  }
  else if (obj.id === "glowToggle") {
    if (obj.checked) {
      softness = document.getElementById("glowRadius").value;
      render();
    }
    else {
      softness = 0;
      render();
    }
  }
  else if (obj.id === "color1") {
    replaceColor(colorSet[0],obj.value);
    colorSet[0] = obj.value;
    render();
  }
  else if (obj.id === "color2") {
    replaceColor(colorSet[1],obj.value);
    colorSet[1] = obj.value;
    render();
  }
  else if (obj.id === "color3") {
    replaceColor(colorSet[2],obj.value);
    colorSet[2] = obj.value;
    render();
  }
  else if (obj.id === "color4") {
    replaceColor(colorSet[3],obj.value);
    colorSet[3] = obj.value;
    render();
  }
  else if (obj.id === "color5") {
    replaceColor(colorSet[4],obj.value);
    colorSet[4] = obj.value;
    render();
  }
  else if (obj.id === "color6") {
    replaceColor(colorSet[5],obj.value);
    colorSet[5] = obj.value;
    render();
  }
  else if (obj.id === "glowRadius") {
    if (softness !== 0) {
      softness = obj.value;
    }
  }
  else if (obj.id === "playButton") {
    console.log("memed");
    if (paused) {
      if (fps === 0) {
        blob = setInterval(function(){
          if (rewind) {
            reverseStep();
          }
          else {
            step();
          }
        },0);
      }
      else {
        blob = setInterval(function(){
          if (rewind) {
            reverseStep();
          }
          else {
            step();
          }
        },1000/fps);
      }
      paused = false;
    }
  }
  else if (obj.id === "pauseButton") {
    if (paused === false) {
      clearInterval(blob);
      paused = true;
    }
  }
  else if (obj.id === "stepButton") {
    step();
  }
  else if (obj.id === "rewindButton") {
    reverseStep();
  }
  else if (obj.id === "grayscaleToggle") {
    if (obj.checked) {
      grayscale = true;
      render();
    }
    else {
      grayscale = false;
      render();
    }
  }
  else if (obj.id === "newWorld") {
    if (paused === false) {
      clearInterval(blob);
      paused = true;
    }
    if (document.getElementById("nameInput").value === "") {
      currentName = "Untitled " + worldnumber;
    }
    else {
      currentName = document.getElementById("nameInput").value;
    }
    generations = 0;
    lifeForm = false;
    grid = [];
    colors = [];
    arraySave = [];
    scale = document.getElementById("scaleInput").value;
    scaleInt = (scale / blur);
    dimX = Math.floor(canvas.width / scaleInt);
    dimY = Math.floor(canvas.height / scaleInt);
    initSteps = document.getElementById("startGenInput").value;
    for (i = 0; i < (dimX * dimY); i++) {
      grid.push(0);
      colors.push(birthColor);
    }
    seed(Math.floor(100 / document.getElementById("seedInput").value));
    render();
    initGrid = grid;
    initColors = colors;
    if (lifeForm === false) {
      for (var t = 0; t < initSteps; t++) {
        step();
      }
    }
    newBlob();
    worldnumber++;
    document.getElementById("nameInput").placeholder = "Untitled " + worldnumber;
    document.getElementById("nameInputCustom").placeholder = "Untitled " + worldnumber;
    document.getElementById("nameInput").value = "";
  }
  else if (obj.id === "fpsInput") {
    fps = obj.value;
    clearInterval(blob);
    paused = true;
    newBlob();
  }
  else if (obj.id === "worldNameToggle") {
    if (obj.checked) {
      document.getElementById("worldName").style.display = "inline";
    }
    else {
      document.getElementById("worldName").style.display = "none";
    }
  }
  else if (obj.id === "gridInput") {
    reGrid(obj.value);
  }
  else if (obj.id === "newBeing") {
    if (paused === false) {
      clearInterval(blob);
      paused = true;
    }
    if (document.getElementById("nameInputCustom").value === "") {
      currentName = "Untitled " + worldnumber;
    }
    else {
      currentName = document.getElementById("nameInputCustom").value;
    }
    generations = 0;
    grid = [];
    colors = [];
    arraySave = [];
    scale = document.getElementById("scaleInputCustom").value;
    scaleInt = (scale / blur);
    dimX = Math.floor(canvas.width / scaleInt);
    dimY = Math.floor(canvas.height / scaleInt);
    initSteps = document.getElementById("startGenInputCustom").value;
    for (i = 0; i < (dimX * dimY); i++) {
      grid.push(0);
      colors.push(birthColor);
    }
      shapes[0] = document.getElementById("gridInput").value;
      shapes[1] = document.getElementById("gridInput").value;
      var text = "";
      var tempColors = [];
      for (var i = 0; i < (shapes[0] * shapes[1]); i++) {
        if (document.getElementById("grid" + i).className === "gridBlock-clicked") {
          text = text + "1";
          tempColors.push(document.getElementById("grid" + i).style.backgroundColor);
        }
        else {
          text = text + "0";
        }
      }
      shapes[2] = text;
      shapes[3] = tempColors;
      lifeForm = shapes;
      drawBeing();
    render();
    initGrid = grid;
    initColors = colors;
    if (lifeForm === false) {
      for (var t = 0; t < initSteps; t++) {
        step();
      }
    }
    newBlob();
    worldnumber++;
    document.getElementById("nameInput").placeholder = "Untitled " + worldnumber;
    document.getElementById("nameInputCustom").placeholder = "Untitled " + worldnumber;
    document.getElementById("nameInputCustom").value = "";
  }
  else if (obj.id === "exportButton") {
    var temp;
    if (document.getElementById("currentToggle").checked) {
      temp = JSON.stringify([grid,colors,colorSet,canvas.width,canvas.height,dimX,dimY,scale,scaleInt]);
    }
    else {
      temp = JSON.stringify([initGrid,initColors,colorSet,canvas.width,canvas.height,dimX,dimY,scale,scaleInt]);
    }
    console.log(initColors);
    if (document.getElementById("fileNameInput").value === "") {
      saveFile(temp,currentName,document.getElementById("conwayjsFileType").checked);
    }
    else {
      saveFile(temp,document.getElementById("fileNameInput").value,document.getElementById("conwayjsFileType").checked);
    }
  }
  else if (obj.id === "fileImport") {
    fileLoad();
  }
  else if (obj.id === "importButton") {
    importWorld();
  }
}

function replaceColor(c1,c2) {
  for (var i = 0; i < colors.length; i++) {
    if (colors[i] === c1) {
      colors.splice(i,1,c2);
    }
  }
}

function getActiveCells(truth) {
  var res = 0;
  for (i = 0; i < grid.length; i++) {
    if (grid[i] === 1) {
      res++;
    }
  }
  if (truth) {
    for (i = 0; i < (JSON.stringify(grid.length).length - JSON.stringify(res).length); i++) {
      res = "0" + JSON.stringify(res);
    }
  }
  return res;
}

function updateRead() {
  var element = document.getElementById("readout");
  element.innerHTML = "<b>generations</b>: " + generations + ",  <b>active cells</b>: " + getActiveCells(true) + "/" + grid.length + " (<i>" + Math.floor(((getActiveCells(true) / grid.length) * 100) + 0.5) + "%</i>)";
}

function reGrid(num) {
  var container = document.getElementById("gridContainer");
  container.innerHTML = "";
  var dimunit = ((container.offsetWidth - (num * 2 * (1)) - 2) / num);
  for (var i = 0; i < (num * num); i++) {
    var element = document.createElement("DIV");
    element.className = "gridBlock";
    element.id = "grid" + i;
    element.style.width = dimunit + "px";
    element.style.height = dimunit + "px";
    element.onclick = function(){
      if (this.className === "gridBlock") {
        this.style.backgroundColor = document.getElementById("paintCol").value;
        this.className = "gridBlock-clicked";
      }
      else {
        this.style.backgroundColor = "#F0F0F0";
        this.className = "gridBlock";
      }
    };
    container.appendChild(element);
  }
}

function saveFile(text, filename, type) {
  var output = new Blob([text], {type: "text/plain;charset=utf-8"});
  if (type) {
    saveAs(output, (filename + ".conwayjs"));
  }
  else {
    saveAs(output, (filename + ".txt"));
  }
}

function fileLoad() {
  var input = document.getElementById("fileImport");
  var reader = new FileReader();
  if (input.files.length) {
    var textFile = input.files[0];
    reader.readAsText(textFile);
    reader.onload = function(data) {
      var testFile = data.target.result;
      if (testFile && testFile.length) {
        file = JSON.parse(testFile);
        file.push(data.target.fileName);
      }
    }
  }
}

function importWorld() {
  if (file) {
    if (paused === false) {
      clearInterval(blob);
      paused = true;
    }
    currentName = file[9];
    generations = 0;
    lifeForm = false;
    grid = file[0];
    colors = file[1];
    colorSet = file[2];
    scale = file[7];
    scaleInt = file[8];
    dimX = file[5];
    dimY = file[6];
    if (canvas.width !== file[3] || canvas.height !== file[4]) {
      alert("The dimensions of the current canvas differ from the dimensions of the world you are attempting to load. Rendering the world might result in distortion.");
    }
    updateColorSet();
    arraySave = [];
    render();
    initGrid = grid;
    initColors = colors;
    newBlob();
    file = [];
  }
}

function updateColorSet() {

}

function newBlob() {
  if (stepMode) {
    stepMode = true;
    if (fps === 0) {
      blob = setInterval(function(){
        if (rewind) {
          reverseStep();
        }
        else {
          step();
        }
      },0);
    }
    else {
      blob = setInterval(function(){
        if (rewind) {
          reverseStep();
        }
        else {
          step();
        }
      },1000/fps);
    }
    paused = false;
  }
}
