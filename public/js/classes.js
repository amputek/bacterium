var Colony, distance, random;

random = function(low, high) {
  return Math.random() * (high - low) + low;
};

distance = function(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

Colony = (function() {
  var createPoint, getLastPointOfBranch, getSeedDirection;

  function Colony() {
    this.id = 0;
    this.startingBranches = 10;
    this.startingSize = 10.0;
    this.branchFactor = 0.001;
    this.branchDirectionMod = -Math.PI * 0.5;
    this.childPointSizeRandom = 2.0;
    this.solidness = 0.5;
    this.fatness = 0.02;
    this.childPointSize = 0.99;
    this.red = 40;
    this.green = 150;
    this.blue = 255;
    this.opacity = 0.1;
    this.sineMod = 0.0;
    this.gapSize = 1.0;
    this.curveRandom = 0.3;
    this.curveMod = 0.01;
    this.deathSize = 0.01;
    this.branches = [];
  }

  Colony.prototype.getAsObj = function() {
    return {
      startingBranches: this.startingBranches,
      startingSize: this.startingSize,
      branchFactor: this.branchFactor,
      branchDirectionMod: this.branchDirectionMod,
      childPointSizeRandom: this.childPointSizeRandom,
      solidness: this.solidness,
      fatness: this.fatness,
      childPointSize: this.childPointSize,
      red: this.red,
      green: this.green,
      blue: this.blue,
      opacity: this.opacity,
      sineMod: this.sineMod,
      gapSize: this.gapSize,
      curveRandom: this.curveRandom,
      curveMod: this.curveMod,
      deathSize: this.deathSize
    };
  };

  createPoint = function(x, y, angle, size) {
    return {
      x: x,
      y: y,
      dir: angle,
      si: size
    };
  };

  Colony.prototype.createBranch = function(point) {
    return this.branches.push([point]);
  };

  getLastPointOfBranch = function(branch) {
    return branch[branch.length - 1];
  };

  getSeedDirection = function(branch) {
    return branch[0].dir;
  };

  Colony.prototype.initSeeds = function(position) {
    var d, dir, facingangle, i, j, k, l, m, ref, ref1, ref2, ref3, results, startAngle, startx, starty;
    this.branches = [];
    if (position === "edge") {
      for (i = j = 0, ref = this.startingBranches; j <= ref; i = j += 1) {
        startAngle = random(0, Math.PI * 2);
        startx = 300 + Math.sin(startAngle) * 280;
        starty = 300 + Math.cos(startAngle) * 280;
        facingangle = Math.atan2(startx - 300, starty - 300);
        this.createBranch(createPoint(startx, starty, facingangle + Math.PI, this.startingSize));
      }
    }
    if (position === "center") {
      for (i = k = 0, ref1 = this.startingBranches; k <= ref1; i = k += 1) {
        startAngle = random(0, Math.PI * 2);
        d = random(0, 40);
        startx = 300 + Math.sin(startAngle) * d;
        starty = 300 + Math.cos(startAngle) * d;
        facingangle = Math.atan2(300 - startx, 300 - starty);
        this.createBranch(createPoint(startx, starty, facingangle + Math.PI, this.startingSize));
      }
    }
    if (position === "line") {
      for (i = l = 0, ref2 = this.startingBranches; l <= ref2; i = l += 1) {
        dir = Math.PI * Math.round(random(0, 2));
        this.createBranch(createPoint(random(0, 600), 300, dir, this.startingSize));
      }
    }
    if (position === "random") {
      results = [];
      for (i = m = 0, ref3 = this.startingBranches; m <= ref3; i = m += 1) {
        startAngle = random(0, Math.PI * 2);
        d = random(0, 280);
        startx = 300 + Math.sin(startAngle) * d;
        starty = 300 + Math.cos(startAngle) * d;
        facingangle = Math.atan2(300 - startx, 300 - starty);
        results.push(this.createBranch(createPoint(startx, starty, facingangle + Math.PI, this.startingSize)));
      }
      return results;
    }
  };

  Colony.prototype.update = function() {
    var a, angle, branch, curvepos, i, j, k, len, len1, newpoint, newsize, newx, newy, point, ref, results, toKill;
    toKill = [];
    i = 0;
    ref = this.branches;
    for (j = 0, len = ref.length; j < len; j++) {
      branch = ref[j];
      point = getLastPointOfBranch(branch);
      curvepos = point.dir + this.curveMod;
      angle = curvepos;
      angle += random(-this.curveRandom, this.curveRandom);
      newx = point.x + Math.sin(angle) * this.gapSize;
      newy = point.y + Math.cos(angle) * this.gapSize;
      newsize = point.si * this.childPointSize + random(-this.childPointSizeRandom, this.childPointSizeRandom);
      newpoint = createPoint(newx, newy, angle, newsize);
      if (distance(newx, newy, 300, 300) > 300 || (newpoint.si < this.deathSize)) {
        toKill.push(i);
      } else {
        branch.push(newpoint);
      }
      if (random(0.0, 1.0) < this.branchFactor) {
        this.createBranch(createPoint(point.x, point.y, point.dir + this.branchDirectionMod, point.si));
      }
      i++;
    }
    results = [];
    for (k = 0, len1 = toKill.length; k < len1; k++) {
      a = toKill[k];
      results.push(this.branches.splice(a, 1));
    }
    return results;
  };

  Colony.prototype.draw = function(canvas) {
    var blue, branch, green, j, len, point, red, ref, results;
    ref = this.branches;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      branch = ref[j];
      red = Math.round(this.red);
      green = Math.round(this.green);
      blue = Math.round(this.blue);
      point = getLastPointOfBranch(branch);
      results.push(canvas.drawPoint(red, green, blue, this.opacity, this.solidness, point.si, point.x, point.y, point.dir, this.fatness));
    }
    return results;
  };

  return Colony;

})();
