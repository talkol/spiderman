// This file is largely from A-Frame (https://github.com/aframevr/aframe)
// Copyright © 2015-2017 A-Frame authors.
// Licensed MIT, see https://github.com/aframevr/aframe/blob/master/LICENSE

var MODEL_URLS = {
  left: "assets/leftHand.glb",
  right: "assets/rightHand.glb"
};

// Poses.
var ANIMATIONS = {
  open: "Open",
  // point: grip active, trackpad surface active, trigger inactive.
  point: "Grip",
  // pointThumb: grip active, trigger inactive, trackpad surface inactive.
  pointThumb: "Point+Thumb",
  // fist: grip active, trigger active, trackpad surface active.
  fist: "Grip",
  // hold: trigger active, grip inactive.
  hold: "Web",
  // thumbUp: grip active, trigger active, trackpad surface inactive.
  thumbUp: "Grip"
};

// Map animation to public events for the API.
var EVENTS = {};
EVENTS[ANIMATIONS.fist] = "grip";
EVENTS[ANIMATIONS.thumbUp] = "pistol";
EVENTS[ANIMATIONS.point] = "pointing";

/**
 * Hand controls component that abstracts 6DoF controls:
 *   oculus-touch-controls, vive-controls, windows-motion-controls.
 *
 * Originally meant to be a sample implementation of applications-specific controls that
 * abstracts multiple types of controllers.
 *
 * Auto-detect appropriate controller.
 * Handle common events coming from the detected vendor-specific controls.
 * Translate button events to semantic hand-related event names:
 *   (gripclose, gripopen, thumbup, thumbdown, pointup, pointdown)
 * Load hand model with gestures that are applied based on the button pressed.
 *
 * @property {string} Hand mapping (`left`, `right`).
 */
AFRAME.registerComponent("hand", {
  schema: { default: "left" },

  init: function() {
    var self = this;
    var el = this.el;
    // Current pose.
    this.gesture = ANIMATIONS.open;
    // Active buttons populated by events provided by the attached controls.
    this.pressedButtons = {};
    this.touchedButtons = {};
    this.loader = new THREE.GLTFLoader();
    this.loader.setCrossOrigin("anonymous");

    this.onGripDown = function(evt) {
      self.handleButton("grip", "down", evt.detail);
    };
    this.onGripUp = function(evt) {
      self.handleButton("grip", "up", evt.detail);
    };
    this.onTrackpadDown = function(evt) {
      self.handleButton("trackpad", "down", evt.detail);
    };
    this.onTrackpadUp = function(evt) {
      self.handleButton("trackpad", "up", evt.detail);
    };
    this.onTrackpadChanged = function(evt) {
      self.handleButton("trackpad", "changed", evt.detail);
    };
    this.onTrackpadTouchEnd = function(evt) {
      self.handleButton("trackpad", "touchend", evt.detail);
    };
    this.onTriggerDown = function(evt) {
      self.handleButton("trigger", "down", evt.detail);
    };
    this.onTriggerUp = function(evt) {
      self.handleButton("trigger", "up", evt.detail);
    };
    this.onTriggerChanged = function(evt) {
      self.handleButton("trigger", "changed", evt.detail);
    };
    this.onTriggerTouchEnd = function(evt) {
      self.handleButton("trigger", "touchend", evt.detail);
    };
    this.onGripChanged = function(evt) {
      self.handleButton("grip", "changed", evt.detail);
    };
    this.onGripTouchEnd = function(evt) {
      self.handleButton("grip", "touchend", evt.detail);
    };
    this.onThumbstickDown = function(evt) {
      self.handleButton("thumbstick", "down", evt.detail);
    };
    this.onThumbstickUp = function(evt) {
      self.handleButton("thumbstick", "up", evt.detail);
    };
    this.onAorXChanged = function(evt) {
      self.handleButton("AorX", "changed", evt.detail);
    };
    this.onAorXTouchEnd = function(evt) {
      self.handleButton("AorX", "touchend", evt.detail);
    };
    this.onBorYChanged = function(evt) {
      self.handleButton("BorY", "changed", evt.detail);
    };
    this.onBorYTouchEnd = function(evt) {
      self.handleButton("BorY", "touchend", evt.detail);
    };
    this.onSurfaceChanged = function(evt) {
      self.handleButton("surface", "changed", evt.detail);
    };
    this.onSurfaceTouchEnd = function(evt) {
      self.handleButton("surface", "touchend", evt.detail);
    };
    this.onControllerConnected = this.onControllerConnected.bind(this);
    this.onControllerDisconnected = this.onControllerDisconnected.bind(this);

    el.addEventListener("controllerconnected", this.onControllerConnected);
    el.addEventListener("controllerdisconnected", this.onControllerDisconnected);

    // Hidden by default.
    el.object3D.visible = false;
  },

  play: function() {
    this.addEventListeners();
  },

  pause: function() {
    this.removeEventListeners();
  },

  tick: function(time, delta) {
    var mesh = this.el.getObject3D("mesh");

    if (!mesh || !mesh.mixer) {
      return;
    }

    mesh.mixer.update(delta / 1000);
  },

  onControllerConnected: function() {
    this.el.object3D.visible = true;
  },

  onControllerDisconnected: function() {
    this.el.object3D.visible = false;
  },

  addEventListeners: function() {
    var el = this.el;
    el.addEventListener("gripdown", this.onGripDown);
    el.addEventListener("gripup", this.onGripUp);
    el.addEventListener("trackpaddown", this.onTrackpadDown);
    el.addEventListener("trackpadup", this.onTrackpadUp);
    el.addEventListener("trackpadchanged", this.onTrackpadChanged);
    el.addEventListener("trackpadtouchend", this.onTrackpadTouchEnd);
    el.addEventListener("triggerdown", this.onTriggerDown);
    el.addEventListener("triggerup", this.onTriggerUp);
    el.addEventListener("triggerchanged", this.onTriggerChanged);
    el.addEventListener("triggertouchend", this.onTriggerTouchEnd);
    el.addEventListener("gripchanged", this.onGripChanged);
    el.addEventListener("griptouchend", this.onGripTouchEnd);
    el.addEventListener("thumbstickdown", this.onThumbstickDown);
    el.addEventListener("thumbstickup", this.onThumbstickUp);
    el.addEventListener("abuttonchanged", this.onAorXChanged);
    el.addEventListener("abuttontouchend", this.onAorXTouchEnd);
    el.addEventListener("bbuttonchanged", this.onBorYChanged);
    el.addEventListener("bbuttontouchend", this.onBorYTouchEnd);
    el.addEventListener("xbuttonchanged", this.onAorXChanged);
    el.addEventListener("xbuttontouchend", this.onAorXTouchEnd);
    el.addEventListener("ybuttonchanged", this.onBorYChanged);
    el.addEventListener("ybuttontouchend", this.onBorYTouchEnd);
    el.addEventListener("surfacechanged", this.onSurfaceChanged);
    el.addEventListener("surfacetouchend", this.onSurfaceTouchEnd);
  },

  removeEventListeners: function() {
    var el = this.el;
    el.removeEventListener("gripdown", this.onGripDown);
    el.removeEventListener("gripup", this.onGripUp);
    el.removeEventListener("trackpaddown", this.onTrackpadDown);
    el.removeEventListener("trackpadup", this.onTrackpadUp);
    el.removeEventListener("trackpadchanged", this.onTrackpadChanged);
    el.removeEventListener("trackpadtouchend", this.onTrackpadTouchEnd);
    el.removeEventListener("triggerdown", this.onTriggerDown);
    el.removeEventListener("triggerup", this.onTriggerUp);
    el.removeEventListener("triggerchanged", this.onTriggerChanged);
    el.removeEventListener("triggertouchend", this.onTriggerTouchEnd);
    el.removeEventListener("gripchanged", this.onGripChanged);
    el.removeEventListener("griptouchend", this.onGripTouchEnd);
    el.removeEventListener("thumbstickdown", this.onThumbstickDown);
    el.removeEventListener("thumbstickup", this.onThumbstickUp);
    el.removeEventListener("abuttonchanged", this.onAorXChanged);
    el.removeEventListener("abuttontouchend", this.onAorXTouchEnd);
    el.removeEventListener("bbuttonchanged", this.onBorYChanged);
    el.removeEventListener("bbuttontouchend", this.onBorYTouchEnd);
    el.removeEventListener("xbuttonchanged", this.onAorXChanged);
    el.removeEventListener("xbuttontouchend", this.onAorXTouchEnd);
    el.removeEventListener("ybuttonchanged", this.onBorYChanged);
    el.removeEventListener("ybuttontouchend", this.onBorYTouchEnd);
    el.removeEventListener("surfacechanged", this.onSurfaceChanged);
    el.removeEventListener("surfacetouchend", this.onSurfaceTouchEnd);
  },

  /**
   * Update handler. More like the `init` handler since the only property is the hand, and
   * that won't be changing much.
   */
  update: function(previousHand) {
    var controlConfiguration;
    var el = this.el;
    var hand = this.data;
    var self = this;

    // Get common configuration to abstract different vendor controls.
    controlConfiguration = {
      hand: hand,
      model: false,
      orientationOffset: { x: 0, y: 0, z: hand === "left" ? 90 : -90 }
    };

    // Set model.
    if (hand !== previousHand) {
      this.loader.load(MODEL_URLS[hand], function(gltf) {
        var mesh = gltf.scene.children[0];
        mesh.mixer = new THREE.AnimationMixer(mesh);
        self.clips = gltf.animations;
        el.setObject3D("mesh", mesh);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, hand === "left" ? 45 : -45);
        el.setAttribute("vive-controls", controlConfiguration);
        el.setAttribute("oculus-touch-controls", controlConfiguration);
        el.setAttribute("windows-motion-controls", controlConfiguration);
      });
    }
  },

  remove: function() {
    this.el.removeObject3D("mesh");
  },

  /**
   * Play model animation, based on which button was pressed and which kind of event.
   *
   * 1. Process buttons.
   * 2. Determine gesture (this.determineGesture()).
   * 3. Animation gesture (this.animationGesture()).
   * 4. Emit gesture events (this.emitGestureEvents()).
   *
   * @param {string} button - Name of the button.
   * @param {string} evt - Type of event for the button (i.e., down/up/touchstart/touchend).
   */
  handleButton: function(button, evt, detail) {
    var lastGesture;
    var isPressed = evt === "down";
    var isTouched = evt === "changed" && detail.value > 0;

    // Update objects.
    if (evt.indexOf("changed") === 0) {
      // Update touch object.
      if (isTouched === this.touchedButtons[button]) {
        return;
      }
      this.touchedButtons[button] = isTouched;
    } else {
      // Update button object.
      if (isPressed === this.pressedButtons[button]) {
        return;
      }
      this.pressedButtons[button] = isPressed;
    }

    // Determine the gesture.
    lastGesture = this.gesture;
    this.gesture = this.determineGesture();

    // Same gesture.
    if (this.gesture === lastGesture) {
      return;
    }
    // Animate gesture.
    this.animateGesture(this.gesture, lastGesture);

    // Emit events.
    this.emitGestureEvents(this.gesture, lastGesture);
  },

  /**
   * Determine which pose hand should be in considering active and touched buttons.
   */
  determineGesture: function() {
    var gesture;
    var isGripActive = this.pressedButtons["grip"];
    var isSurfaceActive = this.pressedButtons["surface"] || this.touchedButtons["surface"];
    var isTrackpadActive = this.pressedButtons["trackpad"] || this.touchedButtons["trackpad"];
    var isTriggerActive = this.pressedButtons["trigger"] || this.touchedButtons["trigger"];
    var isABXYActive = this.touchedButtons["AorX"] || this.touchedButtons["BorY"];
    var isVive = isViveController(this.el.components["tracked-controls"]);

    // Works well with Oculus Touch and Windows Motion Controls, but Vive needs tweaks.
    if (isVive) {
      if (isGripActive || isTriggerActive) {
        gesture = ANIMATIONS.fist;
      } else if (isTrackpadActive) {
        gesture = ANIMATIONS.point;
      }
    } else {
      if (isGripActive) {
        if (isSurfaceActive || isABXYActive || isTrackpadActive) {
          gesture = isTriggerActive ? ANIMATIONS.fist : ANIMATIONS.point;
        } else {
          gesture = isTriggerActive ? ANIMATIONS.thumbUp : ANIMATIONS.pointThumb;
        }
      } else if (isTriggerActive) {
        gesture = ANIMATIONS.hold;
      }
    }

    return gesture;
  },

  /**
   * Play corresponding clip to a gesture
   */
  getClip: function(gesture) {
    var clip;
    var i;
    for (i = 0; i < this.clips.length; i++) {
      clip = this.clips[i];
      if (clip.name !== gesture) {
        continue;
      }
      return clip;
    }
  },

  /**
   * Play gesture animation.
   *
   * @param {string} gesture - Which pose to animate to. If absent, then animate to open.
   * @param {string} lastGesture - Previous gesture, to reverse back to open if needed.
   */
  animateGesture: function(gesture, lastGesture) {
    if (gesture) {
      this.playAnimation(gesture || ANIMATIONS.open, lastGesture, false);
      return;
    }

    // If no gesture, then reverse the current gesture back to open pose.
    this.playAnimation(lastGesture, lastGesture, true);
  },

  /**
   * Emit `hand-controls`-specific events.
   */
  emitGestureEvents: function(gesture, lastGesture) {
    var el = this.el;
    var eventName;

    if (lastGesture === gesture) {
      return;
    }

    // Emit event for lastGesture not inactive.
    eventName = getGestureEventName(lastGesture, false);
    if (eventName) {
      el.emit(eventName);
    }

    // Emit event for current gesture now active.
    eventName = getGestureEventName(gesture, true);
    if (eventName) {
      el.emit(eventName);
    }
  },

  /**
   * Play hand animation based on button state.
   *
   * @param {string} gesture - Name of the animation as specified by the model.
   * @param {string} lastGesture - Previous pose.
   * @param {boolean} reverse - Whether animation should play in reverse.
   */
  playAnimation: function(gesture, lastGesture, reverse) {
    var clip;
    var fromAction;
    var mesh = this.el.getObject3D("mesh");
    var toAction;

    if (!mesh) {
      return;
    }

    // Stop all current animations.
    mesh.mixer.stopAllAction();

    // Grab clip action.
    clip = this.getClip(gesture);
    toAction = mesh.mixer.clipAction(clip);
    toAction.clampWhenFinished = true;
    toAction.loop = THREE.LoopRepeat;
    toAction.repetitions = 0;
    toAction.timeScale = reverse ? -1 : 1;
    toAction.time = reverse ? clip.duration : 0;
    toAction.weight = 1;

    // No gesture to gesture or gesture to no gesture.
    if (!lastGesture || gesture === lastGesture) {
      // Stop all current animations.
      mesh.mixer.stopAllAction();
      // Play animation.
      toAction.play();
      return;
    }

    // Animate or crossfade from gesture to gesture.
    clip = this.getClip(lastGesture);
    fromAction = mesh.mixer.clipAction(clip);
    fromAction.weight = 0.15;
    fromAction.play();
    toAction.play();
    fromAction.crossFadeTo(toAction, 0.15, true);
  }
});

/**
 * Suffix gestures based on toggle state (e.g., open/close, up/down, start/end).
 *
 * @param {string} gesture
 * @param {boolean} active
 */
function getGestureEventName(gesture, active) {
  var eventName;

  if (!gesture) {
    return;
  }

  eventName = EVENTS[gesture];
  if (eventName === "grip") {
    return eventName + (active ? "close" : "open");
  }
  if (eventName === "point") {
    return eventName + (active ? "up" : "down");
  }
  if (eventName === "pointing" || eventName === "pistol") {
    return eventName + (active ? "start" : "end");
  }
  return;
}

function isViveController(trackedControls) {
  var controller = trackedControls && trackedControls.controller;
  var isVive =
    controller &&
    ((controller.id && controller.id.indexOf("OpenVR ") === 0) ||
      (controller.profiles && controller.profiles[0] && controller.profiles[0] === "htc-vive-controller-mv"));
  return isVive;
}
