function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function hitTest(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
}

const colorStr = '0123456789ABCDEF'
function randomColor() {
    let n = 6,
        result = ''
    while (n--) {
        result += colorStr[randomRange(0, 15)]
    }
    return '#' + result
}

window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(a) {
    window.setTimeout(a, 1e3 / 60);
  };

export default class EFireWorks {
  constructor(container, width, height) {
    this.cw = width || window.innerWidth;
    this.ch = height || window.innerHeight;
    this.partCount = 30;

    this.init(container);
    let initialLaunchCount = 1;
    while (initialLaunchCount--) {
      setTimeout(() => {
        this.fireworks.push(
          new EFireWork(
            this.cw / 2,
            this.ch,
            randomRange(50, this.cw - 50),
            randomRange(50, this.ch / 2) - 50,
            this
          )
        );
      }, initialLaunchCount * 200);
    }
  }
  init(container) {
    this.dt = 0;
    this.oldTime = Date.now();
    this.canvas = document.createElement("canvas");
	this.canvasContainer = container || document.createElement("div");

	this.canvasContainer.style.position = 'fixed';
	this.canvasContainer.style.zIndex = 10000;
	this.canvasContainer.style.pointerEvents = 'none';
	this.canvasContainer.style.left = 0;
	this.canvasContainer.style.top = 0;

    this.containerRect = this.canvasContainer.getBoundingClientRect()
    this.canvas.onselectstart = () => false;
    // 设置 canvas 大小
    this.canvas.width = this.cw;
    this.canvas.height = this.ch;
    // 初始化一个装粒子的列表
    this.particles = [];
    this.fireworks = [];
    // 初始化位置
    this.mx = this.cw / 2;
    this.my = this.ch / 2;
    this.currentHue = 170;
    this.partSpeed = 5;
    this.partSpeedVariance = 10;
    this.partWind = 80;
    this.partFriction = 5;
    this.partGravity = 1;
    this.hueMin = 150;
    this.hueMax = 200;
    this.fworkSpeed = 2;
    this.fworkAccel = 4;
    this.hueVariance = 30;
    this.flickerDensity = 20;
    this.showShockwave = false;
    this.showTarget = true;
    this.clearAlpha = 25;

    this.canvasContainer.appendChild(this.canvas);

    // 获取 canvas 2d上下文
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.lineWidth = 1;
    this.bindEvents();
    this.canvasLoop();
  }
  update() {
    (this.ctx.lineWidth = this.lineWidth(
      (vx = Math.cos(this.angle) * this.speed)
    )),
      (vy = Math.sin(this.angle) * this.speed);
    this.speed *= 1 + this.acceleration;
    this.coordLast[2].x = this.coordLast[1].x;
    this.coordLast[2].y = this.coordLast[1].y;
    this.coordLast[1].x = this.coordLast[0].x;
    this.coordLast[1].y = this.coordLast[0].y;
    this.coordLast[0].x = this.x;
    this.coordLast[0].y = this.y;

    if (this.showTarget) {
      if (this.targetRadius < 8) {
        this.targetRadius += 0.25 * this.dt;
      } else {
        this.targetRadius = 1 * this.dt;
      }
    }

    if (this.startX >= this.targetX) {
      if (this.x + vx <= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * this.dt;
      }
    } else {
      if (this.x + vx >= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * this.dt;
      }
    }

    if (this.startY >= this.targetY) {
      if (this.y + vy <= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * this.dt;
      }
    } else {
      if (this.y + vy >= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * this.dt;
      }
    }

    if (this.hitX && this.hitY) {
      var randExplosion = randomRange(0, 9);
      this.createParticles(this.targetX, this.targetY, this.hue);
      this.fireworks.splice(index, 1);
    }
  }
  draw() {
    this.ctx.lineWidth = this.lineWidth;

    var coordRand = randomRange(1, 3) - 1;
    this.ctx.beginPath();
    this.ctx.moveTo(
      Math.round(this.coordLast[coordRand].x),
      Math.round(this.coordLast[coordRand].y)
    );
    this.ctx.lineTo(Math.round(this.x), Math.round(this.y));
    this.ctx.closePath();
    this.ctx.strokeStyle = randomColor()
    //   "hsla(" +
    //   this.hue +
    //   ", 100%, " +
    //   this.brightness +
    //   "%, " +
    //   this.alpha +
    //   ")";
    this.ctx.stroke();

    if (this.showTarget) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(
        Math.round(this.targetX),
        Math.round(this.targetY),
        this.targetRadius,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.closePath();
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.restore();
    }

    if (this.showShockwave) {
      this.ctx.save();
      this.ctx.translate(Math.round(this.x), Math.round(this.y));
      this.ctx.rotate(this.shockwaveAngle);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 1 * (this.speed / 5), 0, Math.PI, true);
      this.ctx.strokeStyle = randomColor()
        // "hsla(" +
        // this.hue +
        // ", 100%, " +
        // this.brightness +
        // "%, " +
        // randomRange(25, 60) / 100 +
        // ")";
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  createFireworks(startX, startY, targetX, targetY) {
    this.fireworks.push(new EFireWork(startX, startY, targetX, targetY, this));
  }
  createParticles(x, y, hue) {
    var countdown = this.partCount;
    while (countdown--) {
      this.particles.push(new Particle(x, y, hue, this));
    }
  }
  updateParticles() {
    var i = this.particles.length;
    while (i--) {
      var p = this.particles[i];
      p.update(i);
    }
  }
  drawParticles() {
    var i = this.particles.length;
    while (i--) {
      var p = this.particles[i];
      p.draw();
    }
  }
  updateFireworks() {
    var i = this.fireworks.length;
    while (i--) {
      var f = this.fireworks[i];
      f.update(i);
    }
  }
  drawFireworks() {
    var i = this.fireworks.length;
    while (i--) {
      var f = this.fireworks[i];
      f.draw();
    }
  }
  customFireWork (e) {
    this.mx = e.clientX - this.containerRect.left;
    this.my = e.clientY - this.containerRect.top;
    this.currentHue = randomRange(this.hueMin, this.hueMax);
    this.createFireworks(this.cw / 2, this.ch, this.mx, this.my);
  }
  bindEvents() {
    window.onresize = () => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
      }, 100);
    };

    this.canvas.onmousedown = this.customFireWork.bind(this)
  }
  clear() {
    this.particles = [];
    this.fireworks = [];
    this.ctx.clearRect(0, 0, this.cw, this.ch);
  }
  updateDelta() {
    var newTime = Date.now();
    this.dt = (newTime - this.oldTime) / 16;
    // 两帧动画之间的时间差 最大值 5
    this.dt = this.dt > 5 ? 5 : this.dt;
    this.oldTime = newTime;
  }
  canvasLoop() {
    requestAnimFrame(this.canvasLoop.bind(this), this.canvas);
    this.updateDelta();
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = "rgba(0,0,0," + this.clearAlpha / 100 + ")";
    this.ctx.fillRect(0, 0, this.cw, this.ch);
    this.ctx.globalCompositeOperation = "lighter";
    this.updateFireworks();
    this.updateParticles();
    this.drawFireworks();
    this.drawParticles();
  }
}

export class EFireWork {
  constructor(
    startX,
    startY,
    targetX,
    targetY,
    fireworks
  ) {
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.fireworks = fireworks
    this.ctx = fireworks.ctx;
    this.hitX = false;
    this.hitY = false;
    this.coordLast = [
      { x: startX, y: startY },
      { x: startX, y: startY },
      { x: startX, y: startY }
    ];
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = fireworks.fworkSpeed;
    this.angle = Math.atan2(targetY - startY, targetX - startX);
    this.shockwaveAngle =
      Math.atan2(targetY - startY, targetX - startX) + 90 * (Math.PI / 180);
    this.acceleration = fireworks.fworkAccel / 100;
    this.hue = fireworks.currentHue;
    this.brightness = randomRange(50, 80);
    this.alpha = randomRange(50, 100) / 100;
    this.lineWidth = fireworks.lineWidth;
    this.targetRadius = 1;
  }
  update(index) {
    this.ctx.lineWidth = this.lineWidth;

    let vx = Math.cos(this.angle) * this.speed,
      vy = Math.sin(this.angle) * this.speed;
    this.speed *= 1 + this.acceleration;
    this.coordLast[2].x = this.coordLast[1].x;
    this.coordLast[2].y = this.coordLast[1].y;
    this.coordLast[1].x = this.coordLast[0].x;
    this.coordLast[1].y = this.coordLast[0].y;
    this.coordLast[0].x = this.x;
    this.coordLast[0].y = this.y;

    if (this.fireworks.showTarget) {
      if (this.targetRadius < 8) {
        this.targetRadius += 0.25 * this.fireworks.dt;
      } else {
        this.targetRadius = 1 * this.fireworks.dt;
      }
    }

    if (this.startX >= this.targetX) {
      if (this.x + vx <= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * this.fireworks.dt;
      }
    } else {
      if (this.x + vx >= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * this.fireworks.dt;
      }
    }

    if (this.startY >= this.targetY) {
      if (this.y + vy <= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * this.fireworks.dt;
      }
    } else {
      if (this.y + vy >= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * this.fireworks.dt;
      }
    }

    if (this.hitX && this.hitY) {
      var randExplosion = randomRange(0, 9);
      this.fireworks.createParticles(this.targetX, this.targetY, this.hue);
      this.fireworks.fireworks.splice(index, 1);
    }
  }
  draw() {
    this.ctx.lineWidth = this.lineWidth;

    var coordRand = randomRange(1, 3) - 1;
    this.ctx.beginPath();
    this.ctx.moveTo(
      Math.round(this.coordLast[coordRand].x),
      Math.round(this.coordLast[coordRand].y)
    );
    this.ctx.lineTo(Math.round(this.x), Math.round(this.y));
    this.ctx.closePath();
    this.ctx.strokeStyle = randomColor()
    //   "hsla(" +
    //   this.hue +
    //   ", 100%, " +
    //   this.brightness +
    //   "%, " +
    //   this.alpha +
    //   ")";
    this.ctx.stroke();

    if (this.fireworks.showTarget) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(
        Math.round(this.targetX),
        Math.round(this.targetY),
        this.targetRadius,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.closePath();
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.restore();
    }

    if (this.fireworks.showShockwave) {
      this.ctx.save();
      this.ctx.translate(Math.round(this.x), Math.round(this.y));
      this.ctx.rotate(this.shockwaveAngle);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 1 * (this.speed / 5), 0, Math.PI, true);
      this.ctx.strokeStyle = randomColor()
        // "hsla(" +
        // this.hue +
        // ", 100%, " +
        // this.brightness +
        // "%, " +
        // randomRange(25, 60) / 100 +
        // ")";
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
}

export class Particle {
  constructor(x, y, hue, fireworks) {
    this.x = x;
    this.y = y;
    this.fireworks = fireworks
    this.coordLast = [{ x: x, y: y }, { x: x, y: y }, { x: x, y: y }];
    this.angle = randomRange(0, 360);
    this.speed = randomRange(
      this.fireworks.partSpeed - this.fireworks.partSpeedVariance <= 0
        ? 1
        : this.fireworks.partSpeed - this.fireworks.partSpeedVariance,
      this.fireworks.partSpeed + this.fireworks.partSpeedVariance
    );
    this.friction = 1 - this.fireworks.partFriction / 100;
    this.gravity = this.fireworks.partGravity / 2;
    this.hue = randomRange(hue - this.fireworks.hueVariance, hue + this.fireworks.hueVariance);
    this.brightness = randomRange(50, 80);
    this.alpha = randomRange(40, 100) / 100;
    this.decay = randomRange(10, 50) / 1000;
    this.wind = (randomRange(0, this.fireworks.partWind) - this.fireworks.partWind / 2) / 25;
    this.lineWidth = this.fireworks.lineWidth;
  }
  update(index) {
    var radians = (this.angle * Math.PI) / 180;
    var vx = Math.cos(radians) * this.speed;
    var vy = Math.sin(radians) * this.speed + this.gravity;
    this.speed *= this.friction;

    this.coordLast[2].x = this.coordLast[1].x;
    this.coordLast[2].y = this.coordLast[1].y;
    this.coordLast[1].x = this.coordLast[0].x;
    this.coordLast[1].y = this.coordLast[0].y;
    this.coordLast[0].x = this.x;
    this.coordLast[0].y = this.y;

    this.x += vx * this.fireworks.dt;
    this.y += vy * this.fireworks.dt;

    this.angle += this.wind;
    this.alpha -= this.decay;

    if (
      !hitTest(
        0,
        0,
        this.fireworks.cw,
        this.fireworks.ch,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      ) ||
      this.alpha < 0.05
    ) {
      this.fireworks.particles.splice(index, 1);
    }
  }
  draw() {
    var coordRand = randomRange(1, 3) - 1;
    this.fireworks.ctx.beginPath();
    this.fireworks.ctx.moveTo(
      Math.round(this.coordLast[coordRand].x),
      Math.round(this.coordLast[coordRand].y)
    );
    this.fireworks.ctx.lineTo(Math.round(this.x), Math.round(this.y));
    this.fireworks.ctx.closePath();
    this.fireworks.ctx.strokeStyle = randomColor()
    //   "hsla(" +
    //   this.hue +
    //   ", 100%, " +
    //   this.brightness +
    //   "%, " +
    //   this.alpha +
    //   ")";
    this.fireworks.ctx.stroke();

    if (this.fireworks.flickerDensity > 0) {
      var inverseDensity = 50 - this.fireworks.flickerDensity;
      if (randomRange(0, inverseDensity) === inverseDensity) {
        this.fireworks.ctx.beginPath();
        this.fireworks.ctx.arc(
          Math.round(this.x),
          Math.round(this.y),
          randomRange(this.lineWidth, this.lineWidth + 3) / 2,
          0,
          Math.PI * 2,
          false
        );
        this.fireworks.ctx.closePath();
        var randAlpha = randomRange(50, 100) / 100;
        this.fireworks.ctx.fillStyle = randomColor()
        //   "hsla(" +
        //   this.hue +
        //   ", 100%, " +
        //   this.brightness +
        //   "%, " +
        //   randAlpha +
        //   ")";
        this.fireworks.ctx.fill();
      }
    }
  }
}
