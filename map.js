AFRAME.registerComponent("map", {
  schema: {
    tilesUpdateFrequency: { type: "int", default: 5 },
    skyUpdateFrequency: { type: "int", default: 59 },
    tileSize: { type: "number", default: 160 },
    viewDistance: { type: "int", default: 5 },
    crystalRespawnTiles: { type: "int", default: 2 },
    crystalHitDistance: { type: "number", default: 8 }
  },

  init: function() {
    this.frame = 0;
    this.playerTile = { x: 1000, y: 1000 };
    this.playerAdjacentTileIds = [];
    this.tileOffset = 0.5 * this.data.tileSize;
    this.existingTiles = {};
    this.tileToElement = {};

    this.crystal = document.createElement("a-entity");
    this.crystal.setAttribute("animation", "property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear;");
    this.crystal.setAttribute(
      "sound__proximity",
      "src: #sound-crystal; loop: true; autoplay: true; volume: 2; rolloffFactor: 0.1;"
    );
    this.crystal.setAttribute("sound__hit", "src: #sound-hit-crystal; positional: false;");
    this.crystal.setAttribute("position", "1000 1000 1000");
    let model = document.createElement("a-entity");
    model.setAttribute("gltf-model", "#crystal");
    model.setAttribute("scale", "1.5 1.5 1.5");
    this.crystal.appendChild(model);
    this.el.appendChild(this.crystal);
  },

  play: function() {
    this.sky = document.getElementById("sky");
    this.populateMap(0, 0);
  },

  distanceXZ: function(vec1, vec2) {
    let dx = vec1.x - vec2.x;
    let dz = vec1.z - vec2.z;
    return Math.sqrt(dx * dx + dz * dz);
  },

  playCollideSound: function() {
    this.crystal.components.sound__hit.playSound();
  },

  updateMap: function(playerWorldPosition, playerVelocity, velocityRaycaster, webRaycasters) {
    this.frame++;

    // see if we hit the crystal
    let hitCrystal = false;
    let crystalDistance = playerWorldPosition.distanceTo(this.crystal.object3D.position);
    if (crystalDistance < this.data.crystalHitDistance) {
      this.crystal.object3D.position.lerp(playerWorldPosition, 1 / (1 + crystalDistance));
      if (playerWorldPosition.distanceTo(this.crystal.object3D.position) < 1) {
        hitCrystal = true;
        this.playCollideSound();
        this.moveCrystal(playerWorldPosition, playerVelocity);
      }
    }

    // move the sky
    if (this.sky && this.frame % this.data.skyUpdateFrequency == 0) {
      this.sky.object3D.position.x = playerWorldPosition.x;
      this.sky.object3D.position.z = playerWorldPosition.z;
    }

    // update the tiles
    if (this.frame % this.data.tilesUpdateFrequency == 0) {
      // do we need to spawn a new crystal
      let crystalXZDistance = this.distanceXZ(playerWorldPosition, this.crystal.object3D.position);
      if (crystalXZDistance > this.data.crystalRespawnTiles * this.data.tileSize * 1.5) {
        this.moveCrystal(playerWorldPosition, playerVelocity);
      }

      // was there a change in player tile x,y
      let x = Math.floor(playerWorldPosition.x / this.data.tileSize);
      let y = Math.floor(playerWorldPosition.z / this.data.tileSize);
      if (x == this.playerTile.x && y == this.playerTile.y) return hitCrystal;
      this.playerTile.x = x;
      this.playerTile.y = y;

      // player tile changed
      this.populateMap(this.playerTile.x, this.playerTile.y);

      // update the velocity raycaster to collide inside current tile only
      velocityRaycaster.data.objects = `#${this.getTileId(this.playerTile.x, this.playerTile.y)} > .collidable`;
      velocityRaycaster.refreshObjects();

      // update the web raycasters
      let adjacentSelector = this.playerAdjacentTileIds.map(x => `#${x} > .collidable`).join(" , ");
      for (let i = 0; i < webRaycasters.length; i++) {
        webRaycasters[i].data.objects = adjacentSelector;
        webRaycasters[i].refreshObjects();
      }
    }

    return hitCrystal;
  },

  populateMap: function(x, y) {
    // calculate the needed tiles
    let neededTiles = {};
    for (let d = 0; d < this.data.viewDistance; d++) {
      for (let i = 0; i <= d; i++) {
        neededTiles[this.getTileId(x + i, y + d - i)] = {
          x: x + i,
          y: y + d - i
        };
        neededTiles[this.getTileId(x - i, y + d - i)] = {
          x: x - i,
          y: y + d - i
        };
        neededTiles[this.getTileId(x + i, y - d + i)] = {
          x: x + i,
          y: y - d + i
        };
        neededTiles[this.getTileId(x - i, y - d + i)] = {
          x: x - i,
          y: y - d + i
        };
      }
      if (d == 2) {
        this.playerAdjacentTileIds = Object.keys(neededTiles);
      }
    }

    // sync the needed list with the existing tiles
    for (let pos in neededTiles) {
      if (this.existingTiles[pos]) {
        delete this.existingTiles[pos];
      } else {
        this.tileToElement[pos] = this.addTile(neededTiles[pos].x, neededTiles[pos].y);
      }
    }
    for (let pos in this.existingTiles) {
      this.removeTile(this.tileToElement[pos]);
      delete this.tileToElement[pos];
    }
    this.existingTiles = neededTiles;
  },

  moveCrystal: function(playerWorldPosition, playerVelocity) {
    let newPosition = new THREE.Vector3(
      Math.round(playerWorldPosition.x / this.data.tileSize) * this.data.tileSize,
      0,
      Math.round(playerWorldPosition.z / this.data.tileSize) * this.data.tileSize
    );
    if (Math.abs(playerVelocity.x) > Math.abs(playerVelocity.z)) {
      newPosition.x += Math.sign(playerVelocity.x) * this.data.crystalRespawnTiles * this.data.tileSize;
    } else {
      newPosition.z += (Math.sign(playerVelocity.z) || 1) * this.data.crystalRespawnTiles * this.data.tileSize;
    }
    newPosition.x += Math.random() * 40 - 20;
    newPosition.y += Math.random() * 100 + 10;
    newPosition.z += Math.random() * 40 - 20;
    this.crystal.setAttribute("animation__appear", "enabled: false;");
    this.crystal.setAttribute(
      "animation__appear",
      "property: scale; from: 0 0 0; to: 1 1 1; dur: 2000; easing: easeInOutElastic; enabled: true;"
    );
    this.crystal.object3D.position.copy(newPosition);
  },

  addTile: function(x, y) {
    let tile = this.el.components.pool.requestEntity();
    tile.setAttribute("id", this.getTileId(x, y));
    tile.setAttribute("position", {
      x: this.tileOffset + x * this.data.tileSize,
      y: 0,
      z: this.tileOffset + y * this.data.tileSize
    });
    tile.play();
    return tile;
  },

  removeTile: function(tile) {
    this.el.components.pool.returnEntity(tile);
  },

  getTileId: function(x, y) {
    return `tile${x}_${y}`;
  }
});
