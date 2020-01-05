AFRAME.registerShader("gradientshader", {
  schema: {
    topColor: { type: "color", default: "1 0 0", is: "uniform" },
    bottomColor: { type: "color", default: "0 0 1", is: "uniform" }
  },

  vertexShader: [
    "varying vec3 vWorldPosition;",
    "void main() {",
    " vec4 worldPosition = vec4( position, 1.0 );",
    " vWorldPosition = worldPosition.xyz;",
    " gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform vec3 bottomColor;",
    "uniform vec3 topColor;",
    "uniform float offset;",
    "varying vec3 vWorldPosition;",
    "void main() {",
    " float h = normalize( vWorldPosition ).y;",
    " gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max(h, 0.0 ), 2.0 ), 0.0 ) ), 1.0 );",
    "}"
  ].join("\n")
});
