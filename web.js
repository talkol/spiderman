AFRAME.registerComponent("web", {
  schema: {
    length: { type: "number", default: 0 }, // m
    strength: { type: "number", default: 100 },
    lengthFactor: { type: "number", default: 0.4 },
    lengthFactorMaxBoost: { type: "number", default: 0.2 },
    maxLength: { type: "number", default: 250 }, // m
    shootingVelocity: { type: "number", default: 200 }, // m / s
    reduceWallDirForce: { type: "number", default: 0.5 }
  },

  init: function() {
    // model
    /*
    this.model = document.createElement("a-entity");
    this.model.setAttribute("line", "start: 0 0 0; color: red;");
    this.model.setAttribute("visible", false);
    */
    this.model = document.createElement("a-box");
    this.model.setAttribute("color", "#e2e1dd");
    this.model.setAttribute("opacity", 0.8);
    this.model.setAttribute("visible", false);
    this.model.setAttribute("width", 0.01);
    this.model.setAttribute("height", 0.01);
    this.model.setAttribute("material", { shader: "flat" });
    this.model.setAttribute("depth", 1);
    this.el.appendChild(this.model);

    // properties
    this.handLocalPosition1 = new THREE.Vector3();
    this.handLocalPosition2 = new THREE.Vector3();
    this.handLocalPosition = this.handLocalPosition1;
    this.handLocalDirection = new THREE.Vector3();
    this.shooterLocalPosition = new THREE.Vector3();
    this.forceResult = new THREE.Vector3();
    this.zeroResult = new THREE.Vector3(0, 0, 0);
    this.state = "off";
    this.shootingVelocityInPercent = 0;
    this.shootingCurrentPercent = 0;
    this.currentReduceWallDirForce = this.data.reduceWallDirForce;
    this.currentLengthFactor = this.data.lengthFactor;
  },

  toggleWeb: function(hand, value) {
    // let go of the web
    if ((this.state == "on" || this.state == "shooting") && value == 0) {
      this.model.object3D.visible = false;
      this.state = "off";
      return;
    }

    // shoot a new web
    if (this.state == "off" && value > 0) {
      let raycaster = hand.components.raycaster;
      raycaster.data.direction = new THREE.Vector3(0, 0, -1);
      raycaster.raycaster.far = this.data.maxLength;
      raycaster.checkIntersections();
      if (raycaster.intersections.length) {
        this.state = "shooting";
        this.data.length = raycaster.intersections[0].distance * this.currentLengthFactor;
        this.el.object3D.position.copy(raycaster.intersections[0].point);
        this.wallNormal = raycaster.intersections[0].face.normal;
        this.shootingVelocityInPercent = this.data.shootingVelocity / raycaster.intersections[0].distance;
        this.shootingCurrentPercent = 0;
        return "shoot-web";
      }
      if (value == 1) return "no-web";
      return;
    }
  },

  changeReduceWallDirForce: function(value) {
    this.currentReduceWallDirForce = this.data.reduceWallDirForce * (1 - value);
  },

  changeLengthFactor: function(value) {
    this.currentLengthFactor = this.data.lengthFactor - value * this.data.lengthFactorMaxBoost;
  },

  updateWeb: function(hand, rigLocalPosition, timeDeltaSec, offsetCamera) {
    // check if we have a web
    if (this.state == "off") {
      return this.zeroResult;
    }

    // get the hand position (in local coords)
    this.handLocalPosition =
      this.handLocalPosition == this.handLocalPosition1 ? this.handLocalPosition2 : this.handLocalPosition1; // silly, needed for line to update
    this.handLocalPosition.copy(hand.object3D.position);
    this.handLocalPosition.add(rigLocalPosition);
    this.handLocalPosition.sub(this.el.object3D.position);
    if (offsetCamera == "right") {
      this.shooterLocalPosition.set(-0.007, 0.021, 0.07);
      this.shooterLocalPosition.applyQuaternion(hand.object3D.quaternion);
      this.handLocalPosition.add(this.shooterLocalPosition);
    } else if (offsetCamera == "left") {
      this.shooterLocalPosition.set(0.0035, 0.0035, 0.075);
      this.shooterLocalPosition.applyQuaternion(hand.object3D.quaternion);
      this.handLocalPosition.add(this.shooterLocalPosition);
    } else if (offsetCamera == "camera") {
      this.handLocalPosition.x += 0.1;
      this.handLocalPosition.y -= 0.1;
    }
    this.handLocalDirection.copy(this.handLocalPosition);
    this.handLocalDirection.normalize();

    // shooting apply velocity
    if (this.state == "shooting") {
      this.shootingCurrentPercent += this.shootingVelocityInPercent * timeDeltaSec;
      if (this.shootingCurrentPercent >= 1) {
        this.state = "on";
        this.shootingCurrentPercent = 1;
      }
    }

    // draw
    this.drawWeb();

    // shooting no force
    if (this.state == "shooting") {
      return this.zeroResult;
    }

    // on state, calculate the force
    let deltaLength = this.handLocalPosition.length() - this.data.length;
    if (deltaLength > 0) {
      this.forceResult.copy(this.handLocalPosition);
      this.forceResult.setLength(-1 * this.data.strength * deltaLength);
      let p = this.forceResult.clone();
      p.projectOnVector(this.wallNormal);
      this.forceResult.addScaledVector(p, -1 * this.currentReduceWallDirForce);
    } else {
      this.forceResult.set(0, 0, 0);
    }
    return this.forceResult;
  },

  drawWeb: function() {
    /*
    this.model.setAttribute("line", {end: this.handLocalPosition});
    */
    let obj = this.model.object3D;
    obj.position.copy(this.handLocalPosition);
    obj.position.multiplyScalar(1 - 0.5 * this.shootingCurrentPercent * this.shootingCurrentPercent);
    obj.scale.z = this.handLocalPosition.length() * this.shootingCurrentPercent * this.shootingCurrentPercent;
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.handLocalDirection);
    if (!this.model.object3D.visible) {
      this.model.object3D.visible = true;
    }
  }
});
