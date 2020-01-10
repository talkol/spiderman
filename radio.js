AFRAME.registerComponent("radio", {
  schema: {
    tracks: { type: "array", default: [] },
    weights: { type: "array", default: [] }
  },

  init: function() {
    try {
      if (typeof SC !== "undefined") {
        SC.client_id = "9fac4561902d4ea62413392ed74aa2b0";
        SC.initialize({
          client_id: SC.client_id
        });
      } else {
        SC = null;
      }
    } catch (e) {
      SC = null;
    }

    this.lastTrack = -1;
  },

  chooseTrack: function() {
    let totalWeight = 0;
    for (let i = 0; i < this.data.weights.length; i++) {
      totalWeight += Number(this.data.weights[i]);
    }

    // try several times to randomize a new track
    for (let attempts = 0; attempts < 5; attempts++) {
      let chosen = Math.floor(Math.random() * totalWeight);
      let weightSoFar = 0;
      for (let i = 0; i < this.data.weights.length; i++) {
        weightSoFar += Number(this.data.weights[i]);
        if (weightSoFar > chosen) {
          if (i != this.lastTrack) {
            this.lastTrack = i;
            return this.data.tracks[i];
          } else break;
        }
      }
    }

    // default
    return this.data.tracks[0];
  },

  play: function() {
    let self = this;
    if (SC == null) return;
    let playing = false;
    let button = document.getElementsByClassName("a-enter-vr-button")[0];
    button.addEventListener("click", function() {
      if (playing) return;
      playing = true;
      function playSound() {
        SC.stream(`/tracks/${self.chooseTrack()}`).then(function(player) {
          player.setVolume(0.5);
          player.play();
          player.on("finish", playSound);
        });
      }
      playSound();
    });
  }
});
