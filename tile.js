let TILE_COUNTER = 1;
let treebuildingTextures = [];
let roadTexture = undefined;
let groundTexture = undefined;
let groundPlane = undefined;

AFRAME.registerComponent("tile", {
  schema: {
    tileSize: { type: "number", default: 160 },
    sidewalkHeight: { type: "number", default: 0.2 },
    buildingTextures: { type: "array", default: [] },
    buildingColors: { type: "array", default: [] },
    groundTextures: { type: "array", default: [] },
    groundColors: { type: "array", default: [] },
    roadTextures: { type: "array", default: [] },
    roadColors: { type: "array", default: [] },
  },

  createThreeTexture: function(textureLoader, id, repeatx, repeaty) {
    let src = document.querySelector(id).src;
    let texture = textureLoader.load(src);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( repeatx, repeaty );

    return texture;
  },

  init: function() {
    if (treebuildingTextures.length === 0) {
      let textureLoader = new THREE.TextureLoader();
      roadTexture = this.createThreeTexture(textureLoader, this.data.roadTextures[0], 60, 60);
      roadTexture.depthWrite = false; 
      groundTexture = this.createThreeTexture(textureLoader, this.data.groundTextures[0], 44, 55);
      groundTexture.depthWrite = false; 

      for (const item of this.data.buildingTextures) {
        treebuildingTextures.push(this.createThreeTexture(textureLoader, item, 20, 20));
      }
/*
      groundPlane = document.createElement("a-plane");
      //plane.setAttribute("position", { x: 0, y: -1 * this.data.sidewalkHeight, z: 0 });
      groundPlane.setAttribute("id", groundPlane);
      groundPlane.setAttribute("width", this.data.tileSize);
      groundPlane.setAttribute("height", this.data.tileSize);
      groundPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
      groundPlane.setAttribute("material", {
        src: roadTexture,
        repeat: { x: 60, y: 60 },
        shader: "flat",
        depthWrite: false,
        side: "front"
      });
      groundPlane.setAttribute("instanced-mesh", "");
      this.el.appendChild(groundPlane);
      */
    }

    this.randState = TILE_COUNTER++;

    this.addGround1();

    this.__proto__.play = function emitChange () {};
  },

  nextRand: function() {
    this.randState = (1103515245 * this.randState + 12345) % 0x80000000;
    return Math.abs(this.randState / (0x80000000 - 1));
  },

  nextRandElement: function(arr) {
    return Math.floor(this.nextRand() * arr.length);
  },

  addGround1: function() {
    /*
    let plane = document.createElement("a-plane");
    plane.setAttribute("position", { x: 0, y: -1 * this.data.sidewalkHeight, z: 0 });
    plane.setAttribute("width", this.data.tileSize);
    plane.setAttribute("height", this.data.tileSize);
    plane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    plane.setAttribute("material", {
      src: roadTexture,
      repeat: { x: 60, y: 60 },
      shader: "flat",
      depthWrite: false,
      side: "front"
    });*/

    let plane = document.createElement("a-entity");
    plane.setAttribute("position", { x: 0, y: -1 * this.data.sidewalkHeight, z: 0 });
    plane.setAttribute("instanced-mesh-member", "mesh:#groundPlane");
    this.el.appendChild(plane);

    // sidewalk
    plane = document.createElement("a-box");
    plane.setAttribute("position", { x: 0, y: (-1 * this.data.sidewalkHeight) / 2, z: 0 });
    plane.setAttribute("width", this.data.tileSize - 11);
    plane.setAttribute("depth", this.data.tileSize - 11);
    plane.setAttribute("height", this.data.sidewalkHeight);
    plane.setAttribute("material", {
      src: groundTexture,
      repeat: { x: 44, y: 55 },
      depthWrite: false,
      side: "front"
    });
    this.el.appendChild(plane);
  },

  addBuilding: function(width, depth, height, x, z) {
    let texture = this.nextRandElement(this.data.buildingTextures);

    let box = document.createElement('a-cylinder');
    box.setAttribute("position", { x: x, y: height / 2, z: z });
    box.setAttribute("rotation", { x: 0, y: 45, z: 0 });
    box.setAttribute("height", height);
    box.setAttribute("radius", depth / 2 *  Math.sqrt(2));
    box.setAttribute("segments-height", 1);
    box.setAttribute("segments-radial", 4);
    box.setAttribute("open-ended", true);
    box.setAttribute("class", "collidable");
    box.setAttribute("part", "wall");
    let clonedTexture = treebuildingTextures[texture].clone();
    clonedTexture.repeat = { x: width / 10 * Math.sqrt(2), y: height / 10 * Math.sqrt(2) };
    box.setAttribute("material", {
      src: clonedTexture,
      shader: "flat",
      repeat: { x: width / 10 * Math.sqrt(2), y: height / 10 * Math.sqrt(2) },
      side: "front"
    });
    this.el.appendChild(box);

    let roof = document.createElement("a-plane");
    roof.setAttribute("position", { x: x, y: height, z: z });
    roof.setAttribute("width", width - 0.2);
    roof.setAttribute("height", depth - 0.2);
    roof.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    roof.setAttribute("class", "collidable");
    roof.setAttribute("part", "roof");
    roof.setAttribute("color", this.data.buildingColors[texture]);
    this.el.appendChild(roof);
  },

  addBuildings2: function() {
    this.addBuilding(50, 50, 40 + 100 * this.nextRand(), -35 - this.nextRand() * 8, -35 - this.nextRand() * 8);
    this.addBuilding(50, 50, 60 + 90 * this.nextRand(), 35 + this.nextRand() * 8, -35 - this.nextRand() * 8);
    this.addBuilding(50, 50, 40 + 180 * this.nextRand(), -35 - this.nextRand() * 8, 35 + this.nextRand() * 8);
    this.addBuilding(50, 50, 50 + 70 * this.nextRand(), 35 + this.nextRand() * 8, 35 + this.nextRand() * 8);
  }
});
