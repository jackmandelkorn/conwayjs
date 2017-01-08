//Conway.js
//Made originally by Jack Mandelkorn
//Email: jacman444@gmail.com

var version = "1.3.2";
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

$("input[type=text]").focus(function(){
  testControls = controls;
  controls = false;
});
$("input[type=text]").blur(function(){
  controls = testControls;
});

$("input[type=checkbox]").click(function(){
  $("input[type=checkbox]").blur();
});

//Extensions
$("button").click(function(){
  update(this);
});
$("input").change(function(){
  update(this);
});
$("select").change(function(){
  update(this);
});

onKey(65,function(){
  if (controls) {
    if (document.getElementById("stepToggle").checked) {
      document.getElementById("stepToggle").checked = false;
    }
    else {
      document.getElementById("stepToggle").checked = true;
    }
    update(document.getElementById("stepToggle"));
  }
});

document.getElementById("canvas").addEventListener("click", clicked, false);

var music;
var file;
var blob;
var controls = true;
var testControls = true;
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
var showColorComp = false;
var fillMode = false;
var globalFill = "#FF0000";
var phantomGenerations = 100;

var blur = 1;

var canvas = document.getElementById("canvas");
canvas.width = canvas.offsetWidth * 1.001 * (1 / blur);
canvas.height = canvas.offsetHeight * 1.001 * (1 / blur);
var ctx = canvas.getContext("2d");

var shapes = [];

var scale = 2.5;
var scaleInt = (scale / blur);
var dimX = Math.floor(canvas.width / scaleInt);
var dimY = Math.floor(canvas.height / scaleInt);

var lifeRules = [3];
var surviveRules = [2,3];

var fps = 30;
var stepMode = true;
var inversion = false;
var slip = true;
var instability = false;
var initSteps = 3;
var saveTip = 1000;
var rounding = false;

var colorSet = ["#FF0000","#FFA500","#FFFF00","#008000","#0000FF","#800080"];
var birthColor = "#000000";
var background = "#000000";
var softness = 0;
var grayscale = false;

var presets = ["B36/S125","2x2","B34/S34","34 Life","B357/S1358","Amoeba","B0123478/S01234678","AntiLife","B345/S4567","Assimilation","B34/S456","Bacteria","B345/S2","Blinkers","B3567/S15678","Bugs","B378/S235678","Coagulations","B3/S23","Conway's Life","B3/S45678","Coral","B3/S124","Corrosion of Conformity","B3678/S34678","Day & Night","B35678/S5678","Diamoeba","B3/S023","DotLife","B3/S238","EightLife","B45/S12345","Electrified Maze","B318254/S48","Fiery Islands","B3/S12","Flock","B1357/S02468","Fredkin","B3457/S4568","Gems","B1/S1","Gnarl","B1/S012345678","H-trees","B36/S23","HighLife","B35678/S4678","Holstein","B38/S238","HoneyLife","B25678/S5678","Iceballs","B012345678/S34678","InverseLife","B35/S234578","Land Rush","B3/S012345678","Life without death","B2/S0","Live Free or Die","B345/S5","Long Life","B368/S238","LowDeath","B3/S13","LowLife","B3/S12345","Maze","B37/S12345","Maze with Mice","B3/S1234","Mazectric","B37/S1234","Mazectric with Mice","B368/S245","Move","B43218/S48","Old English","B35712/S8","Palms","B63514278/S3","Pastures","B38/S23","Pedestrian Life","B83751462/S45","Peru","B378/S012345678","Plow World","B1357/S1357","Replicator","B123478/S167","Royal","B2/S","Seeds","B234/S","Serviettes","B367/S125678","Slow Blob","B3/S1237","SnowLife","B3678/S235678","Stains","B71/S1458726","Triangle Infinity","B5678/S45678","Vote","B4678/S35678","Vote 4/5","B45678/S2345","Walled cities","B84237156/S3182","Zelda"];

//var lifeForm = shapes[0];
var lifeForm = false;

for (a = 0; a < presets.length; a+=2) {
  var parent = document.getElementById("presetSelect");
  var element = document.createElement("option");
  element.innerHTML = presets[a + 1];
  element.value = presets[a];
  parent.appendChild(element);
}

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

onKey(82, function(){
  if (controls) {
    grid = initGrid;
    colors = initColors;
    generations = 0;
    arraySave = [];
    render();
  }
});

onKey(78, function(){
  if (controls) {
    update(document.getElementById("randRule"));
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
    if (getNeighbors(i).length > 0 || grid[i] !== 0) {
      if (grid[i] === 0) {
        var truth = false;
        for (var c = 0; c < lifeRules.length; c++) {
          if (getNeighbors(i).length === lifeRules[c]) {
            truth = true;
          }
        }
        if (truth) {
          if (inversion) {
            testArray[i] = 0;
          }
          else {
            testArray[i] = 1;
            colors[i] = getBirthColor(getNeighbors(i));
          }
        }
      }
      else {
        var truth = true;
        for (var c = 0; c < surviveRules.length; c++) {
          if (getNeighbors(i).length === surviveRules[c]) {
            truth = false;
          }
        }
        if (truth) {
          if (inversion) {
            testArray[i] = 1;
            colors[i] = getBirthColor(getNeighbors(i));
          }
          else {
            testArray[i] = 0;
          }
        }
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
  if (rounding) {
    ctx.fillRect(Math.floor(x),Math.floor(y),Math.floor(entwidth),Math.floor(entheight));
  }
  else {
    ctx.fillRect(x,y,entwidth,entheight);
  }
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
      temp = JSON.stringify([grid,colors,colorSet,canvas.width,canvas.height,lifeRules,surviveRules,dimX,dimY,scale,scaleInt]);
    }
    else {
      temp = JSON.stringify([initGrid,initColors,colorSet,canvas.width,canvas.height,lifeRules,surviveRules,dimX,dimY,scale,scaleInt]);
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
  else if (obj.id === "ruleInput") {
    document.getElementById("defaultOpt").selected = true;
  }
  else if (obj.id === "editRule" && document.getElementById("ruleInput").value) {
    replaceRules(document.getElementById("ruleInput").value);
  }
  else if (obj.id === "presetSelect") {
    document.getElementById("ruleInput").value = obj.value;
    if (document.getElementById("warningToggle").checked) {
      replaceRules(document.getElementById("ruleInput").value);
    }
  }
  else if (obj.id === "worldName") {
    obj.innerHTML = prompt("Change world name:",obj.innerHTML);
  }
  else if (obj.id === "imageButton") {
    var dataFeed = document.getElementById("imageUpload");
    if (dataFeed.files && dataFeed.files[0]) {
      var reader = new FileReader();
      reader.onload = imageLoad;
      reader.readAsDataURL(dataFeed.files[0]);
    }
  }
  else if (obj.id === "randRule") {
    document.getElementById("ruleInput").value = randomRule();
    document.getElementById("defaultOpt").selected = true;
    if (document.getElementById("warningToggle").checked) {
      replaceRules(document.getElementById("ruleInput").value);
    }
  }
  else if (obj.id === "compToggle") {
    if (showColorComp) {
      showColorComp = false;
    }
    else {
      showColorComp = true;
    }
    updateRead();
  }
  else if (obj.id === "fillCol") {
    globalFill = obj.value;
  }
  else if (obj.id === "clickFill") {
    fillMode = obj.checked;
  }
  else if (obj.id === "fillMax") {
    phantomGenerations = obj.value;
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
  if (showColorComp) {
    var cA = getColorComp();
    element.innerHTML = element.innerHTML + ", <b>color comp</b>: ("+"<span style='color:"+colorSet[0]+"'>"+cA[0]+"</span>, "+"<span style='color:"+colorSet[1]+"'>"+cA[1]+"</span>, "+"<span style='color:"+colorSet[2]+"'>"+cA[2]+"</span>, "+"<span style='color:"+colorSet[3]+"'>"+cA[3]+"</span>, "+"<span style='color:"+colorSet[4]+"'>"+cA[4]+"</span>, "+"<span style='color:"+colorSet[5]+"'>"+cA[5]+"</span>)";
  }
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
    currentName = file[11];
    generations = 0;
    lifeForm = false;
    grid = file[0];
    colors = file[1];
    colorSet = file[2];
    scale = file[9];
    scaleInt = file[10];
    lifeRules = file[5];
    surviveRules = file[6];
    dimX = file[7];
    dimY = file[8];
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

function replaceRules(rstring) {
  var testB = [];
  var testS = [];
  var truth = true;
  for (var i = 1; i < rstring.length; i++) {
    if (rstring.charAt(i) === "/") {
      truth = false;
    }
    else if (rstring.charAt(i) !== "S" && rstring.charAt(i) !== "s") {
      if (truth) {
        testB.push(JSON.parse(rstring.charAt(i)));
      }
      else {
        testS.push(JSON.parse(rstring.charAt(i)));
      }
    }
  }
  lifeRules = testB;
  surviveRules = testS;
}



function getImagePixels(image) {
  var ret1 = [];
  var ret2 = [];
  var testCanvas = document.createElement("CANVAS");
  var sensitivity = document.getElementById("lightSensitivity").value;
  testCanvas.width = image.width;
  testCanvas.height = image.height;
  testCanvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  for (y = 0; y < (Math.floor(image.height)); y++) {
    for (x = 0; x < image.width; x++) {
      var pixelData = testCanvas.getContext('2d').getImageData(x, (y * 1), 1, 1).data;
      ret1.push(lifeFill(pixelData[0],pixelData[1],pixelData[2],pixelData[3],sensitivity));
			ret2.push(roundColor(pixelData[0],pixelData[1],pixelData[2],true));
    }
  }
  return [ret1,ret2];
}

function roundColor(r,g,b,hexed) {
  var rgbSet = [];
  var testSet = [];
  for (var i = 0; i < colorSet.length; i++) {
    rgbSet.push(hexify(colorSet[i]));
    testSet.push(0);
  }
  for (var i = 0; i < testSet.length; i++) {
    testSet[i] = testSet[i] + Math.abs(rgbSet[i].r - r);
    testSet[i] = testSet[i] + Math.abs(rgbSet[i].g - g);
    testSet[i] = testSet[i] + Math.abs(rgbSet[i].b - b);
  }
  var ret = testSet.indexOf(testSet.min());
  if (hexed) {
    return colorSet[ret];
  }
  else {
    return ("rgb(" + rgbSet[ret].r + "," + rgbSet[ret].g + "," + rgbSet[ret].b + ")");
  }
}

function lifeFill(r,g,b,a,sens) {
  var tempInvert = document.getElementById("colorInversionToggle").checked;
  if (((r+g+b) * (a/255)) > Math.floor(765 * (sens / 100))) {
    if (tempInvert) {
      return 0;
    }
    else {
      return 1;
    }
  }
  if (tempInvert) {
    return 1;
  }
  else {
    return 0;
  }
}

function hexify(hex) {
  if (hex.charAt(0) === "#") {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }
  else {
    return hex;
  }
}

function imageLoad(e) {
  var image = new Image();
  image.src = e.target.result;
    var naturalHeight = image.height;
    var naturalWidth = image.width;
    var imgScale = JSON.parse(document.getElementById("renderHeight").value);
  image.height = imgScale;
  image.width = Math.floor((imgScale * naturalWidth) / naturalHeight);
  var testSet = getImagePixels(image);

  if (paused === false) {
    clearInterval(blob);
    paused = true;
  }

  scale = document.getElementById("scaleInputCustom2").value;
  scaleInt = (scale / blur);
  dimX = Math.floor(canvas.width / scaleInt);
  dimY = Math.floor(canvas.height / scaleInt);

  var ig = grid.length;
  grid = [];
  colors = [];
  for (var i = 0; i < ig; i++) {
    grid.push(0);
    colors.push(birthColor);
  }
  var offX = Math.floor((dimX / 2) - (JSON.parse(image.width) / 2));
  var offY = Math.floor((dimY / 2) - (JSON.parse(image.height) / 2));
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var posNumber = (((offY + y) * dimX) + offX + x);
      grid[posNumber] = testSet[0][(y * image.width) + x];
      colors[posNumber] = testSet[1][(y * image.width) + x];
    }
  }
  arraySave = [];
  initGrid = grid;
  initColors = colors;
  generations = 0;
  render();
  newBlob();
}

function randomRule(cutoff) {
  var chars = ["1","2","3","4","5","6","7","8"];
  var bNum = Math.floor(Math.random() * 8) + 1;
  var sNum = Math.floor(Math.random() * 8) + 1;
  var ret = "B";
  for (var i = 0; i < bNum; i++) {
    var test = Math.floor(Math.random() * chars.length);
    ret = ret + chars[test];
    chars.splice(test,1);
  }
  chars = ["1","2","3","4","5","6","7","8"];
  ret = ret + "/S";
  for (var i = 0; i < sNum; i++) {
    var test = Math.floor(Math.random() * chars.length);
    ret = ret + chars[test];
    chars.splice(test,1);
  }
  return ret;
}

function convertToNotes(truth) {
  //truth = false; often creates more dense melodies
  var startPoint;
  for (var i = 0; i < grid.length; i++) {
    if (grid[i] === 1) {
      startPoint = i;
      i = grid.length;
    }
  }
  startPoint = startPoint + dimX + 1;
  var startX = Math.floor(startPoint - (Math.floor(startPoint / dimX) * dimX) / 2);
  var startY = Math.floor(Math.floor(startPoint / dimX) / 2);
  var endY = Math.floor((dimY / 2) - startY);
  var noteArray = [];
  var a = startY;
  for (var b = startX; b < (dimX / 2); b++) {
    var temp = (a * 2 * dimX) + (b * 2);
    if (truth) {
      if (grid[temp] === 1) {
        noteArray.push(getNeighbors(temp).length);
      }
      else {
        noteArray.push(0);
      }
    }
    else {
      noteArray.push(getNeighbors(temp).length);
    }
  }
  for (var a = (startY + 1); a < endY; a++) {
    for (var b = 0; b < (dimX / 2); b++) {
      var temp = (a * 2 * dimX) + (b * 2);
      if (truth) {
        if (grid[temp] === 1) {
          noteArray.push(getNeighbors(temp).length);
        }
        else {
          noteArray.push(0);
        }
      }
      else {
        noteArray.push(getNeighbors(temp).length);
      }
    }
  }
  return noteArray;
}

function playMusic(bpm,startPercent,truth) {
  var notes = convertToNotes(truth);
  var timeSplit = Math.floor(60000 / bpm);
  var pos = Math.floor(notes.length * startPercent);
  music = setInterval(function(){
    if (pos === notes.length) {
      clearInterval(music);
    }
    if (notes[pos] !== 0) {
      var audioBox = document.getElementById(("sound" + notes[pos]));
      audioBox.play();
    }
    pos++;
  },timeSplit);
}

function getColorComp() {
  var resArray = [];
  for (var c = 0; c < colorSet.length; c++) {
    resArray.push(0);
  }
  for (var i = 0; i < colors.length; i++) {
    for (var c = 0; c < colorSet.length; c++) {
      if (colors[i] === colorSet[c] && grid[i] === 1) {
        resArray[c] = JSON.parse(resArray[c]) + 1;
      }
    }
  }
  var totalN = 0;
  for (var i = 0; i < resArray.length; i++) {
    totalN = totalN + resArray[i];
  }
  for (var i = 0; i < resArray.length; i++) {
    resArray[i] = (Math.floor((resArray[i] / totalN) * 10000) / 100) + "%";
  }
  return resArray;
}

function clicked(e) {
  if (fillMode) {
    var canvas = document.getElementById("canvas");
    var color = globalFill;
    var rGenerations = phantomGenerations;
    var x = e.clientX;
    var y = e.clientY;
    var xPerc = x / canvas.width;
    var yPerc = y / canvas.height;
    var focusCell = ((Math.floor(yPerc * dimY) * dimX) + Math.floor(xPerc * dimX));
    fill(focusCell,color,rGenerations);
    render();
  }
}

function fill(cell,fillColor,rGenerations,aFill) {
  if (aFill === undefined) {
    aFill = [];
  }
  if ((grid[cell] === 1) && (aFill.includes(cell) === false) && (rGenerations > 0)) {
    colors[cell] = fillColor;
    var neb = getNeighbors(cell);
    aFill.push(cell);
    for (var i = 0; i < neb.length; i++) {
      if (aFill.includes(neb[i]) === false) {
        fill(neb[i],fillColor,(rGenerations - 1),aFill);
      }
    }
  }
}

function radialFill(iterations,radius,offsetDeg,color,maxGenerations) {
  var pointsX = [];
  var pointsY = [];
  var canvas = document.getElementById("canvas");
  for (var i = 0; i < iterations; i++) {
    var initDeg = ((360 / iterations) * i) + offsetDeg;
    var posX = Math.cos(initDeg * (Math.PI / 180)) * radius;
    var posY = Math.sin(initDeg * (Math.PI / 180)) * radius;
    var resX = posX + (dimX / 2);
    var resY = posY + (dimY / 2);
    pointsX.push(Math.floor(resX));
    pointsY.push(Math.floor(resY));
  }
  for (var i = 0; i < iterations; i++) {
    var focusCell = (pointsY[i] * dimX) + pointsX[i];
    fill(focusCell,color,maxGenerations);
  }
  render();
}
