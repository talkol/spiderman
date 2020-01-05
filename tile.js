let TILE_COUNTER = 1;

AFRAME.registerComponent("tile", {
  schema: {
    tileSize: { type: "number", default: 160 },
    sidewalkHeight: { type: "number", default: 0.2 },
    buildingTextures: { type: "array", default: [] },
    buildingColors: { type: "array", default: [] },
    groundTextures: { type: "array", default: [] },
    groundColors: { type: "array", default: [] },
    roadTextures: { type: "array", default: [] },
    roadColors: { type: "array", default: [] }
  },

  init: function() {
    this.randState = TILE_COUNTER++;

    this.addGround1();

    let buildings = [this.addBuildings1.bind(this), this.addBuildings2.bind(this)];
    buildings[this.nextRandElement(buildings)]();
  },

  nextRand: function() {
    this.randState = (1103515245 * this.randState + 12345) % 0x80000000;
    return Math.abs(this.randState / (0x80000000 - 1));
  },

  nextRandElement: function(arr) {
    return Math.floor(this.nextRand() * arr.length);
  },

  addGround1: function() {
    let plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: -1 * this.data.sidewalkHeight, z: 0 });
    plane.setAttribute("width", this.data.tileSize);
    plane.setAttribute("height", this.data.tileSize);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("material", {
      src: this.data.roadTextures[0],
      repeat: { x: 60, y: 60 },
      shader: "flat"
    });
    this.el.appendChild(plane);

    // sidewalk
    plane = document.createElement("a-box");
    plane.setAttribute("position", { x: 0, y: (-1 * this.data.sidewalkHeight) / 2, z: 0 });
    plane.setAttribute("width", this.data.tileSize - 11);
    plane.setAttribute("depth", this.data.tileSize - 11);
    plane.setAttribute("height", this.data.sidewalkHeight);
    plane.setAttribute("material", {
      src: this.data.groundTextures[0],
      repeat: { x: 44, y: 55 }
    });
    this.el.appendChild(plane);
  },

  addBuilding: function(width, depth, height, x, z) {
    let texture = this.nextRandElement(this.data.buildingTextures);
    let box = document.createElement("a-box");
    box.setAttribute("position", { x: x, y: height / 2, z: z });
    box.setAttribute("width", width);
    box.setAttribute("depth", depth);
    box.setAttribute("height", height);
    box.setAttribute("class", "collidable");
    box.setAttribute("material", {
      src: this.data.buildingTextures[texture],
      repeat: { x: width / 10, y: height / 10 }
    });
    this.el.appendChild(box);

    let roof = document.createElement("a-plane");
    roof.setAttribute("position", { x: x, y: height + 0.1, z: z });
    roof.setAttribute("width", width - 0.2);
    roof.setAttribute("height", depth - 0.2);
    roof.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    roof.setAttribute("color", this.data.buildingColors[texture]);
    this.el.appendChild(roof);
  },

  addBuildings1: function() {
    this.addBuilding(90, 90, 50 + 150 * this.nextRand(), 20 * this.nextRand() - 10, 20 * this.nextRand() - 10);
  },

  addBuildings2: function() {
    this.addBuilding(50, 50, 40 + 100 * this.nextRand(), -35 - this.nextRand() * 8, -35 - this.nextRand() * 8);
    this.addBuilding(50, 50, 60 + 90 * this.nextRand(), 35 + this.nextRand() * 8, -35 - this.nextRand() * 8);
    this.addBuilding(50, 50, 40 + 180 * this.nextRand(), -35 - this.nextRand() * 8, 35 + this.nextRand() * 8);
    this.addBuilding(50, 50, 50 + 70 * this.nextRand(), 35 + this.nextRand() * 8, 35 + this.nextRand() * 8);
  }

  /*
  addGroundDebug: function() {
    let plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: 0, z: 0 });
    plane.setAttribute("width", 150);
    plane.setAttribute("height", 150);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("color", "#" + Math.round(0xffffff * this.nextRand()).toString(16));
    this.el.appendChild(plane);
  },
  */

  /*
  addBuilding: function(width, depth, height, x, z) {
    let texture = this.nextRandElement(this.data.buildingTextures);
    let bottomHeight = 0.3;
    
    // four sides
    
    let plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x, y: bottomHeight + height / 2, z: z + depth / 2 });
    plane.setAttribute("width", width);
    plane.setAttribute("height", height);
    plane.setAttribute("rotation", { x: 0, y: 0, z: 0 });
    plane.setAttribute("class", "collidable");
    plane.setAttribute("material", {
      src: this.data.buildingTextures[texture],
      repeat: { x: width / 10, y: height / 10 }
    });
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x, y: bottomHeight + height / 2, z: z - depth / 2 });
    plane.setAttribute("width", width);
    plane.setAttribute("height", height);
    plane.setAttribute("rotation", { x: 0, y: 180, z: 0 });
    plane.setAttribute("class", "collidable");
    plane.setAttribute("material", {
      src: this.data.buildingTextures[texture],
      repeat: { x: width / 10, y: height / 10 }
    });
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x + width / 2, y: bottomHeight + height / 2, z: z });
    plane.setAttribute("width", depth);
    plane.setAttribute("height", height);
    plane.setAttribute("rotation", { x: 0, y: 90, z: 0 });
    plane.setAttribute("class", "collidable");
    plane.setAttribute("material", {
      src: this.data.buildingTextures[texture],
      repeat: { x: depth / 10, y: height / 10 }
    });
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x - width / 2, y: bottomHeight + height / 2, z: z });
    plane.setAttribute("width", depth);
    plane.setAttribute("height", height);
    plane.setAttribute("rotation", { x: 0, y: 270, z: 0 });
    plane.setAttribute("class", "collidable");
    plane.setAttribute("material", {
      src: this.data.buildingTextures[texture],
      repeat: { x: depth / 10, y: height / 10 }
    });
    this.el.appendChild(plane);
    
    // roof
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x, y: bottomHeight + height, z: z });
    plane.setAttribute("width", width);
    plane.setAttribute("height", depth);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("class", "collidable");
    plane.setAttribute("color", this.data.buildingColors[texture]);
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);
    
    // bottom sides
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x, y: bottomHeight / 2, z: z + depth / 2 });
    plane.setAttribute("width", width);
    plane.setAttribute("height", bottomHeight);
    plane.setAttribute("rotation", { x: 0, y: 0, z: 0 });
    plane.setAttribute("color", this.data.buildingColors[texture]);
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x, y: bottomHeight / 2, z: z - depth / 2 });
    plane.setAttribute("width", width);
    plane.setAttribute("height", bottomHeight);
    plane.setAttribute("rotation", { x: 0, y: 180, z: 0 });
    plane.setAttribute("color", this.data.buildingColors[texture]);
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x + width / 2, y: bottomHeight / 2, z: z });
    plane.setAttribute("width", depth);
    plane.setAttribute("height", bottomHeight);
    plane.setAttribute("rotation", { x: 0, y: 90, z: 0 });
    plane.setAttribute("color", this.data.buildingColors[texture]);
    this.el.appendChild(plane);
    
    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: x - width / 2, y: bottomHeight / 2, z: z });
    plane.setAttribute("width", depth);
    plane.setAttribute("height", bottomHeight);
    plane.setAttribute("rotation", { x: 0, y: 270, z: 0 });
    plane.setAttribute("color", this.data.buildingColors[texture]);
    this.el.appendChild(plane);
  },
  */

  /*
  addGround1: function() {
    let plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: 0, z: 73.25 });
    plane.setAttribute("width", 150);
    plane.setAttribute("height", 3.5);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("color", "#333");
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);

    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: 0, z: -73.25 });
    plane.setAttribute("width", 150);
    plane.setAttribute("height", 3.5);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("color", "#333");
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);

    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 73.25, y: 0, z: 0 });
    plane.setAttribute("width", 3.5);
    plane.setAttribute("height", 143);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("color", "#333");
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);

    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: -73.25, y: 0, z: 0 });
    plane.setAttribute("width", 3.5);
    plane.setAttribute("height", 143);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("color", "#333");
    plane.setAttribute("material", {
      shader: "flat"
    });
    this.el.appendChild(plane);

    plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: 0, z: 0 });
    plane.setAttribute("width", 143);
    plane.setAttribute("height", 143);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("material", {
      src: this.data.groundTextures[0],
      repeat: { x: 40, y: 50 },
      shader: "flat"
    });
    this.el.appendChild(plane);
  },
  */
});
