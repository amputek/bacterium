window.onload = function() {
  var breedMode, button_breed, button_grow, button_random, button_stop, clickImage, ctx, currentBacteria, deselect, destinationBacteria, drawBreed, drawGrow, drawLoop, drawcanvas, emphasis, frameCount, globalOpacityMod, growing, initialiseInputs, interpolate, radio_center, radio_edge, radio_line, select, selectedBacteria, setInputs, setupCanvas, slider_blue, slider_branchdirection, slider_branchfactor, slider_curvemod, slider_curverandom, slider_deathsize, slider_emphasis, slider_fatness, slider_gapsize, slider_globalopacity, slider_green, slider_growTime, slider_opacity, slider_pointsize, slider_pointsizerandom, slider_red, slider_sinemod, slider_solidness, slider_startingbranches, slider_startsize, sliders, sourceBacteria, startBreeding, startGrowing, startPosition, time;
  drawcanvas = document.getElementById('drawCanvas');
  ctx = drawcanvas.getContext('2d');
  button_grow = document.getElementById('growButton');
  button_breed = document.getElementById('breedButton');
  button_stop = document.getElementById('stopButton');
  button_random = document.getElementById('randomButton');
  slider_growTime = document.getElementById('growTime');
  radio_center = document.getElementById('center');
  radio_edge = document.getElementById('edge');
  radio_line = document.getElementById('line');
  slider_startingbranches = document.getElementById('startingBranches');
  slider_startsize = document.getElementById('startingSize');
  slider_branchfactor = document.getElementById('branchFactor');
  slider_branchdirection = document.getElementById('branchDirection');
  slider_solidness = document.getElementById('solidness');
  slider_fatness = document.getElementById('fatness');
  slider_pointsize = document.getElementById('pointSize');
  slider_pointsizerandom = document.getElementById('pointSizeRandom');
  slider_red = document.getElementById('red');
  slider_green = document.getElementById('green');
  slider_blue = document.getElementById('blue');
  slider_opacity = document.getElementById('opacity');
  slider_curverandom = document.getElementById('curveRandom');
  slider_curvemod = document.getElementById('curveMod');
  slider_gapsize = document.getElementById('gapSize');
  slider_sinemod = document.getElementById('sineMod');
  slider_deathsize = document.getElementById('deathSize');
  slider_emphasis = document.getElementById('emphasis');
  slider_globalopacity = document.getElementById('globalopacity');
  sliders = [slider_startingbranches, slider_branchfactor, slider_branchdirection, slider_solidness, slider_fatness, slider_pointsize, slider_pointsizerandom, slider_red, slider_blue, slider_green, slider_opacity, slider_curvemod, slider_curverandom, slider_gapsize, slider_sinemod, slider_deathsize];
  startPosition = "center";
  frameCount = 0;
  time = 200;
  growing = false;
  emphasis = 0.0;
  globalOpacityMod = 1.0;
  drawLoop = null;
  breedMode = false;
  currentBacteria = null;
  selectedBacteria = [];
  destinationBacteria = new Bacteria(ctx);
  sourceBacteria = new Bacteria(ctx);
  initialiseInputs = function() {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = sliders.length - 1; j <= ref; i = j += 1) {
      results.push(sliders[i].value = Math.random() * 100.0);
    }
    return results;
  };
  setupCanvas = function() {
    var grd;
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = 'rgba(255,255,255,1.0)';
    ctx.fillStyle = "#000";
    grd = ctx.createRadialGradient(300, 300, 1, 300, 300, 300);
    grd.addColorStop(0, '#16171A');
    grd.addColorStop(1, '#000000');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 610, 610);
    return ctx.globalCompositeOperation = "lighter";
  };
  startGrowing = function() {
    currentBacteria = new window.Bacteria(ctx);
    setInputs(currentBacteria);
    frameCount = 0;
    if (radio_edge.checked === true) {
      startPosition = "edge";
    }
    if (radio_center.checked === true) {
      startPosition = "center";
    }
    if (radio_line.checked === true) {
      startPosition = "line";
    }
    currentBacteria.start(startPosition);
    window.clearInterval(drawLoop);
    return drawLoop = setInterval(drawGrow, 1000 / 60);
  };
  startBreeding = function() {
    currentBacteria = new window.Bacteria(ctx);
    if (radio_edge.checked === true) {
      startPosition = "edge";
    }
    if (radio_center.checked === true) {
      startPosition = "center";
    }
    if (radio_line.checked === true) {
      startPosition = "line";
    }
    currentBacteria.deathSize = (sourceBacteria.deathSize + destinationBacteria.deathSize) / 2;
    currentBacteria.startingBranches = sourceBacteria.startingBranches;
    currentBacteria.startingSize = sourceBacteria.startingSize;
    globalOpacityMod = slider_globalopacity.value * 0.008 + 0.2;
    emphasis = slider_emphasis.value * 0.02 - 1.0;
    frameCount = 0;
    currentBacteria.start(startPosition);
    window.clearInterval(drawLoop);
    return drawLoop = setInterval(drawBreed, 1000 / 60);
  };
  setInputs = function(aBacteria) {
    aBacteria.startingBranches = Math.round((slider_startingbranches.value * 0.2) * (slider_startingbranches.value * 0.2));
    aBacteria.startingSize = slider_startsize.value * 0.3;
    aBacteria.branchFactor = slider_branchfactor.value * 0.0003;
    aBacteria.branchDirectionMod = slider_branchdirection.value / 15.915;
    aBacteria.gapSize = slider_gapsize.value * 0.05 + 0.03;
    aBacteria.sineMod = slider_sinemod.value * 0.01;
    aBacteria.curveRandom = slider_curverandom.value * 0.01;
    aBacteria.curveMod = slider_curvemod.value * 0.001;
    aBacteria.deathSize = slider_deathsize.value * 0.01;
    aBacteria.solidness = slider_solidness.value * 0.01;
    aBacteria.fatness = (slider_fatness.value - 50.0) * 0.019;
    aBacteria.childPointSize = slider_pointsize.value * 0.001 + 0.89;
    aBacteria.childPointSizeRandom = slider_pointsizerandom.value * 0.02;
    aBacteria.red = Math.round(slider_red.value * 2.55);
    aBacteria.green = Math.round(slider_green.value * 2.55);
    aBacteria.blue = Math.round(slider_blue.value * 2.55);
    return aBacteria.opacity = slider_opacity.value * 0.0015 + 0.002;
  };
  drawGrow = function() {
    if (growing === true) {
      if (frameCount < time) {
        frameCount++;
        return currentBacteria.draw();
      }
    }
  };
  interpolate = function(source, destination) {
    var rate, step;
    rate = -emphasis;
    if (emphasis >= 0.0) {
      if (frameCount < time * rate) {
        return source;
      } else {
        step = (destination - source) / time;
        return source + (step * (frameCount - (time * rate)));
      }
    } else {
      rate = 1.0 + rate;
      if (frameCount < time * rate) {
        step = (destination - source) / (time * rate);
        return source + (step * frameCount);
      } else {
        return destination;
      }
    }
  };
  drawBreed = function() {
    if (growing === true) {
      if (frameCount < time) {
        frameCount++;
        currentBacteria.branchFactor = interpolate(sourceBacteria.branchFactor, destinationBacteria.branchFactor);
        currentBacteria.branchDirectionMod = interpolate(sourceBacteria.branchDirectionMod, destinationBacteria.branchDirectionMod);
        currentBacteria.solidness = interpolate(sourceBacteria.solidness, destinationBacteria.solidness);
        currentBacteria.fatness = interpolate(sourceBacteria.fatness, destinationBacteria.fatness);
        currentBacteria.childPointSize = interpolate(sourceBacteria.childPointSize, destinationBacteria.childPointSize);
        currentBacteria.childPointSizeRandom = interpolate(sourceBacteria.childPointSizeRandom, destinationBacteria.childPointSizeRandom);
        currentBacteria.red = interpolate(sourceBacteria.red, destinationBacteria.red) + random(-10, 10);
        currentBacteria.green = interpolate(sourceBacteria.green, destinationBacteria.green) + random(-10, 10);
        currentBacteria.blue = interpolate(sourceBacteria.blue, destinationBacteria.blue) + random(-10, 10);
        currentBacteria.opacity = interpolate(sourceBacteria.opacity, destinationBacteria.opacity);
        currentBacteria.opacity *= globalOpacityMod;
        currentBacteria.gapSize = interpolate(sourceBacteria.gapSize, destinationBacteria.gapSize);
        currentBacteria.sineMod = interpolate(sourceBacteria.sineMod, destinationBacteria.sineMod);
        currentBacteria.curveMod = interpolate(sourceBacteria.curveMod, destinationBacteria.curveMod);
        currentBacteria.curveRandom = interpolate(sourceBacteria.curveRandom, destinationBacteria.curveRandom);
        return currentBacteria.draw();
      }
    }
  };
  select = function(element) {
    element.style.opacity = 1.0;
    element.style.backgroundSize = 100 + "%";
    element.style.borderColor = 'rgba(255,255,255,1.0)';
    element.selected = true;
    return selectedBacteria.push(element);
  };
  deselect = function(element, index) {
    element.style.opacity = 0.6;
    element.style.backgroundSize = 80 + "%";
    element.style.borderColor = 'rgba(255,255,255,0.0)';
    element.selected = false;
    return selectedBacteria.splice(index, 1);
  };
  clickImage = function(event) {
    var element;
    element = event.toElement;
    if (element.selected === false) {
      if (selectedBacteria.length < 2) {
        return select(element);
      }
    } else {
      if (element === selectedBacteria[1]) {
        deselect(element, selectedBacteria.length - 1);
      }
      if (element === selectedBacteria[0]) {
        return deselect(element, 0);
      }
    }
  };
  $(drawCanvas).click(function() {
    time = slider_growTime.value * 5.0;
    setupCanvas();
    if (breedMode === false) {
      startGrowing();
    }
    if (breedMode === true) {
      startBreeding();
    }
    return growing = true;
  });
  $(growButton).click(function() {
    time = slider_growTime.value * 5.0;
    setupCanvas();
    if (breedMode === false) {
      startGrowing();
    }
    if (breedMode === true) {
      startBreeding();
    }
    return growing = true;
  });
  $(breedButton).click(function() {
    var send, st;
    console.log("adding bacteria...", currentBacteria);
    st = drawcanvas.toDataURL();
    send = jQuery.extend({}, currentBacteria);
    send.ctx = null;
    send.branches = null;
    return socket.emit('addBacteria', send, st);
  });
  $(randomButton).click(function() {
    initialiseInputs();
    setupCanvas();
    startGrowing();
    return growing = true;
  });
  $(growTab).click(function() {
    console.log("growtab");
    breedMode = false;
    $(this).css('z-index', 2);
    return $(breedTab).css('z-index', 1);
  });
  $(stopButton).click(function() {
    return growing = false;
  });
  initialiseInputs();
  return setupCanvas();
};
