var Canvas, ColonyParameters, breedMode, canvas, colonyParameters, currentColony, drawGrow, drawLoop, emphasis, frameCount, globalOpacityMod, growing, radio, startGrowing, time;

colonyParameters = null;

frameCount = 0;

time = 200;

growing = false;

emphasis = 0.0;

globalOpacityMod = 1.0;

drawLoop = null;

breedMode = false;

currentColony = null;

radio = {};

canvas = null;

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
      sinemod: document.getElementById('sineMod'),
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
    colony.sineMod = this.sliders.sinemod.value * 0.01;
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
    this.drawcanvas = document.getElementById('drawCanvas');
    this.ctx = this.drawcanvas.getContext('2d');
    this.grd = this.ctx.createRadialGradient(300, 300, 1, 300, 300, 300);
    this.grd.addColorStop(0, '#16171A');
    this.grd.addColorStop(1, '#000000');
  }

  Canvas.prototype.clear = function() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle = 'rgba(255,255,255,1.0)';
    this.ctx.fillStyle = "#000";
    this.ctx.fillStyle = this.grd;
    this.ctx.fillRect(0, 0, 610, 610);
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

  Canvas.prototype.arc = function(x, y, r, dir, length) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, Math.PI / 2 + dir - length, Math.PI / 2 + dir + length, false);
    return this.ctx.stroke();
  };

  Canvas.prototype.line = function(x, y, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x2, y2);
    return this.ctx.stroke();
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
  var startPosition;
  startPosition = "center";
  if (radio.edge.checked === true) {
    startPosition = "edge";
  }
  if (radio.center.checked === true) {
    startPosition = "center";
  }
  if (radio.line.checked === true) {
    startPosition = "line";
  }
  colonyParameters.setupColonyFromInputs(currentColony);
  currentColony.initSeeds(startPosition);
  frameCount = 0;
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
  $('#drawCanvas').click(function() {
    canvas.clear();
    if (breedMode === false) {
      startGrowing();
    }
    if (breedMode === true) {
      startBreeding();
    }
    return growing = true;
  });
  $('#randomButton').click(function() {
    colonyParameters.randomise();
    canvas.clear();
    startGrowing();
    return growing = true;
  });
  radio.center = document.getElementById('center');
  radio.edge = document.getElementById('edge');
  radio.line = document.getElementById('line');
  colonyParameters.randomise();
  return canvas.clear();
};
