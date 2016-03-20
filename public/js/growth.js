var BreedSelector, Canvas, ColonyParameters, breedMode, breedSelector, canvas, colonyParameters, currentColony, drawGrow, drawLoop, emphasis, frameCount, globalOpacityMod, growing, socket, startGrowing, time;

colonyParameters = null;

frameCount = 0;

time = 200;

growing = false;

emphasis = 0.0;

globalOpacityMod = 1.0;

drawLoop = null;

breedMode = false;

currentColony = null;

canvas = null;

socket = null;

breedSelector = null;

ColonyParameters = (function() {
  function ColonyParameters() {
    var _this;
    this.sliders = {
      currentColor: {
        r: 34,
        g: 7,
        b: 63,
        a: 0.1
      },
      startingbranches: document.getElementById('startingBranches'),
      startsize: document.getElementById('startingSize'),
      branchfactor: document.getElementById('branchFactor'),
      branchdirection: document.getElementById('branchDirection'),
      solidness: document.getElementById('solidness'),
      fatness: document.getElementById('fatness'),
      pointsize: document.getElementById('pointSize'),
      pointsizerandom: document.getElementById('pointSizeRandom'),
      curverandom: document.getElementById('curveRandom'),
      curvemod: document.getElementById('curveMod'),
      gapsize: document.getElementById('gapSize'),
      deathsize: document.getElementById('deathSize')
    };
    _this = this;
    $('#color-picker').minicolors({
      change: function(value, opacity) {
        var a, i, len, result, results, s;
        s = value.substring(4, value.length - 1);
        s = s.split(",");
        result = [];
        results = [];
        for (i = 0, len = s.length; i < len; i++) {
          a = s[i];
          a = a.replace(/^\s+|\s+$/g, "");
          result.push(a);
          _this.sliders.currentColor.r = result[0];
          _this.sliders.currentColor.g = result[1];
          _this.sliders.currentColor.b = result[2];
          results.push(_this.sliders.currentColor.a = 0.1);
        }
        return results;
      },
      control: 'hue',
      defaultValue: '#22073f',
      format: 'rgb',
      inline: true,
      opacity: false,
      theme: 'picker'
    });
  }

  ColonyParameters.prototype.randomise = function() {
    var k, ref, val;
    ref = this.sliders;
    for (k in ref) {
      val = ref[k];
      if (val !== null) {
        val.value = Math.random() * 100.0;
      }
    }
    return $('#color-picker').minicolors('value', {
      color: 'rgb(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ')'
    });
  };

  ColonyParameters.prototype.setupColonyFromInputs = function(colony) {
    colony.startingBranches = Math.round((this.sliders.startingbranches.value * 0.2) * (this.sliders.startingbranches.value * 0.2));
    colony.startingSize = this.sliders.startsize.value * 0.3;
    colony.branchFactor = this.sliders.branchfactor.value * 0.0003;
    colony.branchDirectionMod = Math.PI + (this.sliders.branchdirection.value / 15.915);
    colony.gapSize = this.sliders.gapsize.value * 0.05 + 0.03;
    colony.curveRandom = this.sliders.curverandom.value * 0.01;
    colony.curveMod = this.sliders.curvemod.value * 0.001;
    colony.deathSize = this.sliders.deathsize.value * 0.01;
    colony.solidness = this.sliders.solidness.value * 0.01;
    colony.fatness = (this.sliders.fatness.value - 50.0) * 0.019;
    colony.childPointSize = this.sliders.pointsize.value * 0.001 + 0.89;
    colony.childPointSizeRandom = this.sliders.pointsizerandom.value * 0.02;
    colony.red = Math.round(this.sliders.currentColor.r);
    colony.green = Math.round(this.sliders.currentColor.g);
    colony.blue = Math.round(this.sliders.currentColor.b);
    return colony.opacity = this.sliders.currentColor.a;
  };

  return ColonyParameters;

})();

Canvas = (function() {
  function Canvas() {
    this.canvas = document.getElementById('drawCanvas');
    this.canvas.width = this.canvas.height = 500;
    this.ctx = this.canvas.getContext('2d');
    this.grd = this.ctx.createRadialGradient(250, 250, 1, 250, 250, 250);
    this.grd.addColorStop(0, '#16171A');
    this.grd.addColorStop(1, '#000000');
  }

  Canvas.prototype.clear = function() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle = 'rgba(255,255,255,1.0)';
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, 500, 500);
    return this.ctx.globalCompositeOperation = "lighter";
  };

  Canvas.prototype.strokedCircle = function(x, y, r) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    return this.ctx.stroke();
  };

  Canvas.prototype.solidCircle = function(x, y, r) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    return this.ctx.fill();
  };

  Canvas.prototype.drawPoint = function(red, green, blue, opacity, solidness, size, x, y, direction, fatness) {
    var centerop, edgeop;
    centerop = opacity * solidness;
    edgeop = opacity * (1.0 - solidness);
    this.ctx.fillStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + centerop + ')';
    this.ctx.strokeStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + edgeop + ')';
    this.ctx.lineWidth = 2.0;
    this.ctx.save();
    if (size < 0.1) {
      size = 0.1;
    }
    this.ctx.translate(x, y);
    this.ctx.rotate(-direction + Math.PI / 2);
    this.ctx.scale(1 - fatness, 1 + fatness);
    this.solidCircle(0, 0, size);
    this.strokedCircle(0, 0, size);
    return this.ctx.restore();
  };

  return Canvas;

})();

startGrowing = function() {
  canvas.clear();
  colonyParameters.setupColonyFromInputs(currentColony);
  currentColony.initSeeds($("input:radio[name ='startpos']:checked").attr("id"));
  frameCount = 0;
  growing = true;
  window.clearInterval(drawLoop);
  return drawLoop = setInterval(drawGrow, 1000 / 60);
};

drawGrow = function() {
  if (growing === true && frameCount < 500) {
    frameCount++;
    currentColony.update();
    return currentColony.draw(canvas);
  }
};

window.onload = function() {
  currentColony = new Colony();
  colonyParameters = new ColonyParameters();
  canvas = new Canvas();
  breedSelector = new BreedSelector();
  $('#drawCanvas').click(function() {
    if (breedMode === false) {
      startGrowing();
    }
    if (breedMode === true) {
      return startBreeding();
    }
  });
  $('#randomButton').click(function() {
    colonyParameters.randomise();
    return startGrowing();
  });
  $('#upload-colony').click(function() {
    var obj, send, st;
    console.log("adding colony: ", currentColony);
    st = canvas.canvas.toDataURL();
    obj = currentColony.getAsObj();
    send = jQuery.extend({}, obj);
    return socket.emit('addBacteria', send, st);
  });
  $('#grow-tab').click(function() {
    $("#controls-wrapper").css("display", "inline-block");
    $("#gallery").css("display", "none");
    $("#breed-tab").removeClass("selected");
    return $("#grow-tab").addClass("selected");
  });
  $('#breed-tab').click(function() {
    $("#controls-wrapper").css("display", "none");
    $("#gallery").css("display", "inline-block");
    $("#breed-tab").addClass("selected");
    return $("#grow-tab").removeClass("selected");
  });
  socket = io.connect('http://192.168.1.198:8080');
  socket.emit('getColonyCollection');
  colonyParameters.randomise();
  return startGrowing();
};

socket.on('setColonyCollection', function(colonies) {
  var col, colony, i, len, n, results;
  console.log('colony collection: ', colonies);
  document.getElementById("grid").innerHTML = "";
  col = null;
  results = [];
  for (i = 0, len = colonies.length; i < len; i++) {
    colony = colonies[i];
    n = document.createElement("div");
    n.addEventListener("click", breedSelector.clickImage, false);
    n.setAttribute('id', colony.id);
    n.setAttribute('class', 'gimg');
    n.style.backgroundImage = "url(gallery/colony" + colony.id + ".png)";
    results.push(document.getElementById("grid").appendChild(n));
  }
  return results;
});

BreedSelector = (function() {
  var deselect, select, selectedColonies, updateSourceDest;

  function BreedSelector() {}

  selectedColonies = [null, null];

  updateSourceDest = function() {
    if (selectedColonies[0] !== null) {
      $("#source").css("background-image", "url(gallery/colony" + selectedColonies[0] + ".png)");
    } else {
      $("#source").css("background-image", "none");
    }
    if (selectedColonies[1] !== null) {
      return $("#dest").css("background-image", "url(gallery/colony" + selectedColonies[1] + ".png)");
    } else {
      return $("#dest").css("background-image", "none");
    }
  };

  select = function(element) {
    if (selectedColonies[0] === null) {
      selectedColonies[0] = element.id;
    } else if (selectedColonies[1] === null) {
      selectedColonies[1] = element.id;
    }
    $(element).addClass("selected");
    return updateSourceDest();
  };

  deselect = function(element, index) {
    $(element).removeClass("selected");
    selectedColonies[index] = null;
    return updateSourceDest();
  };

  BreedSelector.prototype.clickImage = function(e) {
    if (selectedColonies[0] !== e.target.id && selectedColonies[1] !== e.target.id) {
      if (selectedColonies[0] === null || selectedColonies[1] === null) {
        return select(e.target);
      }
    } else {
      if (e.target.id === selectedColonies[1]) {
        deselect(e.target, selectedColonies.length - 1);
      }
      if (e.target.id === selectedColonies[0]) {
        return deselect(e.target, 0);
      }
    }
  };

  return BreedSelector;

})();
