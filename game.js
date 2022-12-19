// by Frederik Holfeld

"use strict";
function startGame() {
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  let game = new Game();
  game.init();
  game.run(context, 1000/60, 0);
}
function makeBlobs(blobNumber) {
  let blobs = Array(blobNumber);
  for (let i = 0; i < blobs.length; i++) {
    blobs[i] = new Blob(Math.random() * 1920, Math.random() * 1080, 4, randomColor("blob"), 100, blobs, i);
  }
  return blobs;
}
function makeWorld(foodNumber) {
  let world = new World;
  world.food = Array(foodNumber);
  for (let i = 0; i < world.food.length; i++) {
    world.food[i] = new Food(Math.random() * 1920, Math.random() * 1080, Math.random() * 8, world.food, i, randomColor("food"));
  }
  return world;
}
function randomColor(object) {
  let h;
  if (object === "blob") {
    h = Math.floor(Math.random() * 121 + 180);
  } else if (object === "food") {
    h = Math.floor(Math.random() * 21);
  }
  let s = 100;
  let l = 50;
  let a = 50;
  return 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + '%)';
}
class Game {
  constructor() {
    this.blobs;
    this.world;
    this.drawInterval;
    this.updateInterval;
  }
  init() {
    this.blobs = makeBlobs(10);
    this.world = makeWorld(1000);
    console.log("Initiated game");
  }
  run(context, drawInterval, updateInterval) {
    this.draw(context);
    this.drawInterval = setInterval(this.draw.bind(this), drawInterval, context);
    this.updateInterval = setInterval(this.update.bind(this), updateInterval);
  }
  draw(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    this.drawBlobs(context);
    this.drawWorld(context);
  }
  drawBlobs(context) {
    for (let i = 0; i < this.blobs.length; i++) {
      let blob = this.blobs[i];
      context.beginPath();
      context.arc(blob.x, blob.y, 2 * (Math.sqrt(blob.health) / 2 * Math.PI), 0, Math.PI * 2);
      context.fillStyle = blob.color;
      context.fill();
    }
  }
  drawWorld(context) {
    for (let i = 0; i < this.world.food.length; i++) {
      let food = this.world.food[i]
      context.beginPath();
      context.arc(food.x, food.y, 2 * (Math.sqrt(food.size) / 2 * Math.PI), 0, Math.PI * 2);
      context.fillStyle = food.color;
      context.fill();
    }
  }
  update() {
    for (let i = 0; i < this.blobs.length; i++) {
      this.blobs[i].update(this);
    }
    if (this.blobs.length == 0 || this.world.food.length == 0) {
      clearInterval(this.drawInterval);
      clearInterval(this.updateInterval);
      if (this.blobs.length == 0) {
        console.log("All blobs have died! :(");
      } else if (this.world.food.length == 0) {
        console.log("All food has been eaten!");
      }
    }
  }
}
class Blob {
  constructor(x, y, rad, color, health, arr, arrPos) {
    this.x = x;
    this.y = y;
    this.velX;
    this.velY;
    this.color = color;
    this.health = health;
    this.arr = arr;
    this.arrPos = arrPos;
    this.speed;
    this.updateSpeed();
  }
  update(game) {
    let nearestFood = this.searchNearestFood(game);
    if (nearestFood != undefined) {
      this.goToCoordinate(nearestFood.x, nearestFood.y);
      this.eatFood(nearestFood);
      this.updateSpeed();
      this.consumeEnergy();
    }
  }
  searchNearestFood(game) {
    let minDistance = Number.MAX_SAFE_INTEGER;
    let nearestFood;
    let foods = game.world.food;
    for (let i = 0; i < foods.length; i++) {
      let food = foods[i];
      let distanceX = Math.abs(food.x - this.x);
      let distanceY = Math.abs(food.y - this.y);
      let distance = distanceX + distanceY;
      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = food;
      }
    }
    return nearestFood;
  }
  goToCoordinate(x, y) {
    let difX = Math.abs(x - this.x);
    let difY = Math.abs(y - this.y);
    let dif = Math.sqrt(difX * difX + difY * difY);
    if (x < this.x) {
      this.x -= difX / dif * this.speed;
    } else {
      this.x += difX / dif * this.speed;
    }
    if (y < this.y) {
      this.y -= difY / dif * this.speed;
    } else {
      this.y += difY / dif * this.speed;
    }
  }
  eatFood(food) {
    let difX = Math.abs(food.x - this.x);
    let difY = Math.abs(food.y - this.y);
    let dif = Math.sqrt(difX * difX + difY * difY);
    if (dif < (2 * (Math.sqrt(this.health) / 2 * Math.PI) + (Math.sqrt(food.size) / 2 * Math.PI)) / 2) {
      this.health += food.size;
      food.arr.splice(food.arrPos, 1);
      for (let i = 0; i < food.arr.length; i++) {
        food.arr[i].arrPos = i;
      }
    }
  }
  consumeEnergy() {
    this.health -= 0.1;
    if (this.health <= 0) this.die();
  }
  die() {
    this.arr.splice(this.arrPos, 1);
    for (let i = 0; i < this.arr.length; i++) {
      this.arr[i].arrPos = i;
    }
  }
  updateSpeed() {
    this.speed = 100 / this.health;
  }
}
class Food {
  constructor(x, y, size, arr, arrPos, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.arr = arr;
    this.arrPos = arrPos;
    this.color = color;
  }
}
class World {
  constructor() {
    this.food;
  }
}
