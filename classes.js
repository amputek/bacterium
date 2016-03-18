var Branch, Point, arc, distance;

window.strokedCircle = function(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  return ctx.stroke();
};

window.solidCircle = function(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  return ctx.fill();
};

arc = function(ctx, x, y, r, dir, length) {
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI / 2 + dir - length, Math.PI / 2 + dir + length, false);
  return ctx.stroke();
};

window.line = function(ctx, x, y, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  return ctx.stroke();
};

window.random = function(low, high) {
  return Math.random() * (high - low) + low;
};

distance = function(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

window.Bacteria = (function() {
  function Bacteria(ctx1) {
    this.ctx = ctx1;
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

  Bacteria.prototype.start = function(position) {
    var dir, facingangle, i, j, k, l, p, ref, ref1, ref2, results, startAngle, startx, starty;
    this.branches = [];
    if (position === "edge") {
      for (i = j = 0, ref = this.startingBranches; j <= ref; i = j += 1) {
        startAngle = random(0, Math.PI * 2);
        startx = 300 + Math.sin(startAngle) * 280;
        starty = 300 + Math.cos(startAngle) * 280;
        facingangle = Math.atan2(startx - 300, starty - 300);
        p = new Point(startx, starty, facingangle + Math.PI, this.startingSize, this);
        this.branches.push(new Branch(p));
      }
    }
    if (position === "center") {
      for (i = k = 0, ref1 = this.startingBranches; k <= ref1; i = k += 1) {
        p = new Point(300, 300, Math.random() * Math.PI * 2, this.startingSize, this);
        this.branches.push(new Branch(p));
      }
    }
    if (position === "line") {
      results = [];
      for (i = l = 0, ref2 = this.startingBranches; l <= ref2; i = l += 1) {
        dir = Math.PI * Math.round(random(0, 2));
        p = new Point(random(0, 600), 300, dir, this.startingSize, this);
        results.push(this.branches.push(new Branch(p)));
      }
      return results;
    }
  };

  Bacteria.prototype.draw = function() {
    var angle, curvepos, i, j, newpoint, newsize, newx, newy, p, point, ref, results, sinepos, t;
    results = [];
    for (i = j = 0, ref = this.branches.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      if (this.branches[i].dead === false) {
        point = this.branches[i].lastPoint();
        t = (0 + distance(point.x, point.y, 300, 300)) * 0.001;
        sinepos = this.branches[i].direction() + Math.sin(this.branches[i].points.length * t) * (10.0 - point.si) * this.curveMod * 4.0;
        curvepos = point.dir + this.curveMod;
        angle = (this.sineMod * sinepos) + ((1.0 - this.sineMod) * curvepos);
        angle += random(-this.curveRandom, this.curveRandom);
        newx = point.x + Math.sin(angle) * this.gapSize;
        newy = point.y + Math.cos(angle) * this.gapSize;
        newsize = point.si * this.childPointSize + random(-this.childPointSizeRandom, this.childPointSizeRandom);
        newpoint = new Point(newx, newy, angle, newsize, this);
        if (distance(newx, newy, 300, 300) > 300 || (newpoint.si < this.deathSize)) {
          this.branches[i].dead = true;
        } else {
          this.branches[i].addPoint(newpoint);
        }
        if (random(0.0, 1.0) < this.branchFactor) {
          p = new Point(point.x, point.y, point.dir + this.branchDirectionMod, point.si, this);
          this.branches.push(new Branch(p));
        }
        results.push(point.draw());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Bacteria;

})();

Branch = (function() {
  function Branch(point) {
    this.points = [];
    this.points.push(point);
    this.dead = false;
  }

  Branch.prototype.lastPoint = function() {
    return this.points[this.points.length - 1];
  };

  Branch.prototype.direction = function() {
    return this.points[0].dir;
  };

  Branch.prototype.addPoint = function(p) {
    return this.points.push(p);
  };

  return Branch;

})();

Point = (function() {
  function Point(x3, y3, dir1, si, parent) {
    this.x = x3;
    this.y = y3;
    this.dir = dir1;
    this.si = si;
    this.parent = parent;
  }

  Point.prototype.draw = function() {
    var blue, centerop, ctx, edgeop, green, red, size;
    ctx = this.parent.ctx;
    red = Math.round(this.parent.red);
    green = Math.round(this.parent.green);
    blue = Math.round(this.parent.blue);
    centerop = this.parent.opacity * this.parent.solidness;
    edgeop = this.parent.opacity * (1.0 - this.parent.solidness);
    ctx.fillStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + centerop + ')';
    ctx.strokeStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + edgeop + ')';
    ctx.lineWidth = 2.0;
    ctx.save();
    size = this.si;
    if (size < 0.1) {
      size = 0.1;
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.dir + Math.PI / 2);
    ctx.scale(1 - this.parent.fatness, 1 + this.parent.fatness);
    solidCircle(ctx, 0, 0, size);
    strokedCircle(ctx, 0, 0, size);
    return ctx.restore();
  };

  return Point;

})();
