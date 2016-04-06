var BreedSelector, Breeder, Canvas, ColonyParameters, breedColonies, breedSelector, breeder, canvas, colonyParameters, currentColony, draw, drawLoop, frameCount, mode, socket, start, switchTab;

colonyParameters = null;

drawLoop = null;

mode = "grow";

currentColony = null;

canvas = null;

socket = null;

breedColonies = {};

breedSelector = null;

breeder = null;

frameCount = 0;

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
      color: 'rgb(' + Math.round(Math.random() * 205) + ',' + Math.round(Math.random() * 205) + ',' + Math.round(Math.random() * 205) + ')'
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
    red = Math.round(red);
    green = Math.round(green);
    blue = Math.round(blue);
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

Breeder = (function() {
  function Breeder() {
    this.source = new Colony();
    this.dest = new Colony();
    this.emphasis = 0.0;
    this.globalOpacityMod = 1.0;
  }

  Breeder.prototype.setup = function(colony, op, emp) {
    colony.deathSize = (this.source.deathSize + this.dest.deathSize) / 2;
    colony.startingBranches = this.source.startingBranches;
    colony.startingSize = this.source.startingSize;
    this.globalOpacityMod = op * 0.008 + 0.2;
    return this.emphasis = emp * 0.02 - 1.0;
  };

  Breeder.prototype.setSource = function(c) {
    return this.source = breedColonies[c];
  };

  Breeder.prototype.setDest = function(c) {
    return this.dest = breedColonies[c];
  };

  Breeder.prototype.interpolate = function(source, destination) {
    var aswitch, rate, result, step, time;
    time = 150;
    rate = -this.emphasis;
    result = source;
    aswitch = 150 * -this.emphasis;
    if (this.emphasis >= 0.0) {
      if (frameCount < aswitch) {
        result = source;
      } else {
        step = (destination - source) / time;
        result = source + (step * (frameCount - (time * rate)));
      }
    } else {
      rate = 1.0 + rate;
      if (frameCount < aswitch) {
        step = (destination - source) / (time * rate);
        result = source + (step * frameCount);
      } else {
        result = destination;
      }
    }
    return result;
  };

  Breeder.prototype.interpolateSettings = function(colony) {
    colony.branchFactor = this.interpolate(this.source.branchFactor, this.dest.branchFactor);
    colony.branchDirectionMod = this.interpolate(this.source.branchDirectionMod, this.dest.branchDirectionMod);
    colony.solidness = this.interpolate(this.source.solidness, this.dest.solidness);
    colony.fatness = this.interpolate(this.source.fatness, this.dest.fatness);
    colony.childPointSize = this.interpolate(this.source.childPointSize, this.dest.childPointSize);
    colony.childPointSizeRandom = this.interpolate(this.source.childPointSizeRandom, this.dest.childPointSizeRandom);
    colony.red = this.interpolate(this.source.red, this.dest.red) + random(-10, 10);
    colony.green = this.interpolate(this.source.green, this.dest.green) + random(-10, 10);
    colony.blue = this.interpolate(this.source.blue, this.dest.blue) + random(-10, 10);
    colony.opacity = this.interpolate(this.source.opacity, this.dest.opacity);
    colony.opacity *= this.globalOpacityMod;
    colony.gapSize = this.interpolate(this.source.gapSize, this.dest.gapSize);
    colony.sineMod = this.interpolate(this.source.sineMod, this.dest.sineMod);
    colony.curveMod = this.interpolate(this.source.curveMod, this.dest.curveMod);
    colony.curveRandom = this.interpolate(this.source.curveRandom, this.dest.curveRandom);
    return colony;
  };

  return Breeder;

})();

start = function() {
  frameCount = 0;
  window.clearInterval(drawLoop);
  canvas.clear();
  if (mode === "breed") {
    if (!breedSelector.ableToBreed()) {
      return;
    } else {
      breeder.setup(currentColony, document.getElementById('opacity-mod').value, document.getElementById('emphasis').value);
    }
  } else {
    colonyParameters.setupColonyFromInputs(currentColony);
  }
  currentColony.initSeeds($("input:radio[name ='startpos']:checked").attr("id"));
  return drawLoop = setInterval(draw, 1000 / 60);
};

draw = function() {
  if (currentColony.numberOfBranches() > 0 && frameCount <= 200) {
    if (mode === "breed") {
      currentColony = breeder.interpolateSettings(currentColony);
    }
    currentColony.update();
    currentColony.draw(canvas);
    return frameCount++;
  } else {
    console.log(frameCount);
    frameCount = 0;
    return window.clearInterval(drawLoop);
  }
};

switchTab = function(m) {
  var g;
  if (m !== mode) {
    g = m === "grow";
    $("#controls-wrapper").css("display", g === true ? "inline-block" : "none");
    $("#gallery").css("display", g === true ? "none" : "inline-block");
    if (g) {
      $("#grow-tab").removeClass("selected");
      $("#breed-tab").addClass("selected");
    } else {
      $("#grow-tab").addClass("selected");
      $("#breed-tab").removeClass("selected");
    }
    return mode = m;
  }
};

window.onload = function() {
  currentColony = new Colony();
  colonyParameters = new ColonyParameters();
  canvas = new Canvas();
  breedSelector = new BreedSelector();
  breeder = new Breeder();
  $('#drawCanvas').click(start);
  $('#randomButton').click(function() {
    colonyParameters.randomise();
    return start();
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
    return switchTab("grow");
  });
  $('#breed-tab').click(function() {
    return switchTab("breed");
  });
  socket = null;
  socket = io.connect('http://localhost:8080');
  socket.emit('getColonyCollection');
  socket.on('setColonyCollection', function(colonies) {
    var col, colony, i, len, n;
    console.log('colony collection: ', colonies);
    document.getElementById("grid").innerHTML = "";
    col = null;
    for (i = 0, len = colonies.length; i < len; i++) {
      colony = colonies[i];
      breedColonies["" + colony.id] = colony;
      console.log("adding colony", colony.id);
      n = document.createElement("div");
      n.addEventListener("click", breedSelector.clickImage, false);
      n.setAttribute('id', colony.id);
      n.setAttribute('class', 'gimg');
      n.style.backgroundImage = "url(gallery/colony" + colony.id + ".png)";
      document.getElementById("grid").appendChild(n);
    }
    return console.log(breedColonies);
  });
  colonyParameters.randomise();
  return start();
};

BreedSelector = (function() {
  var deselect, select, selectedColonies, updateSourceDest;

  function BreedSelector() {
    $("#swap-source-dest").click(function() {
      var p0, p1;
      p1 = selectedColonies[1];
      p0 = selectedColonies[0];
      selectedColonies[0] = p1;
      selectedColonies[1] = p0;
      return updateSourceDest();
    });
  }

  selectedColonies = [null, null];

  BreedSelector.prototype.ableToBreed = function() {
    return selectedColonies[0] !== null && selectedColonies[1] !== null;
  };

  updateSourceDest = function() {
    if (selectedColonies[0] !== null) {
      $("#source").css("background-image", "url(gallery/colony" + selectedColonies[0] + ".png)");
      breeder.setSource(selectedColonies[0]);
    } else {
      $("#source").css("background-image", "none");
      breeder.setSource(null);
    }
    if (selectedColonies[1] !== null) {
      $("#dest").css("background-image", "url(gallery/colony" + selectedColonies[1] + ".png)");
      return breeder.setDest(selectedColonies[1]);
    } else {
      $("#dest").css("background-image", "none");
      return breeder.setDest(null);
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
