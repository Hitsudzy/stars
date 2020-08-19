"use strict";

const {
  abs,
  acos,
  asin,
  atan,
  atan2,
  ceil,
  cos,
  max,
  min,
  PI,
  pow,
  random,
  round,
  sin,
  sqrt,
  tan } =
Math;
const HALF_PI = 0.5 * PI;
const QUART_PI = 0.25 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const G = 6.67 * pow(10, -11);
const EPSILON = 2.220446049250313e-16;
const rand = n => n * random();
const randIn = (_min, _max) => rand(_max - _min) + _min;
const randRange = n => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
  let hm = 0.5 * m;
  return abs((t + hm) % m - hm) / hm;
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (a, b, t) => (1 - t) * a + t * b;
const clamp = (n, _min, _max) => min(max(n, _min), _max);
const norm = (n, _min, _max) => (n - _min) / (_max - _min);
const floor = n => n | 0;
const fract = n => n - floor(n);
const vh = p => p * window.innerHeight * 0.01;
const vw = p => p * window.innerWidth * 0.01;
const vmin = p => min(vh(p), vw(p));
const vmax = p => max(vh(p), vw(p));
const intToRGBA = n => {
  let r, g, b, a;

  n >>>= 0;

  r = (n & 0xff000000) >>> 24;
  g = (n & 0xff0000) >>> 16;
  b = (n & 0xff00) >>> 8;
  a = (n & 0xff) / 255;

  return `rgba(${[r, g, b, a].join()})`;
};
const drawTypes = {
  FILL: 'fill',
  STROKE: 'stroke' };




Array.prototype.lerp = function (t = [], a = 0) {
  this.forEach((n, i) => this[i] = lerp(n, t[i], a));
};

Float32Array.prototype.get = function (i = 0, n = 0) {
  const t = i + n;

  let r = [];

  for (; i < t; i++) {
    r.push(this[i]);
  }

  return r;
};

class PropsArray {
  constructor(count = 0, props = [], type = 'float') {
    this.count = count;
    this.props = props;
    this.spread = props.length;
    this.values = type === 'float' ?
    new Float32Array(count * props.length) :
    new Uint32Array(count * props.length);
  }
  get length() {
    return this.values.length;
  }
  set(a = [], i = 0) {
    this.values.set(a, i);
  }
  setMap(o = {}, i = 0) {
    this.set(Object.values(o), i);
  }
  get(i = 0) {
    return this.values.get(i, this.spread);
  }
  getMap(i = 0) {
    return this.get(i).reduce(
    (r, v, i) => ({
      ...r,
      ...{ [this.props[i]]: v } }),

    {});

  }
  forEach(cb) {
    let i = 0;

    for (; i < this.length; i += this.spread) {
      cb(this.get(i), i, this);
    }
  }
  map(cb) {
    let i = 0;

    for (; i < this.length; i += this.spread) {
      this.set(cb(this.get(i), i, this), i);
    }
  }
  async *read() {
    let i = 0;

    for (; i < this.length; i += this.spread) {
      yield { index: i, value: this.get(i) };
    }
  }}


function createOffscreenCanvas(width, height) {
  let _canvas;

  if (typeof OffscreenCanvas !== undefined) {
    _canvas = new OffscreenCanvas(parseFloat(width), parseFloat(height));
  } else {
    _canvas = createCanvas(width, height);
  }
  return _canvas;
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function createContext2D(width = innerWidth, height = innerHeight, contextAttributes) {
  return createCanvas(width, height).getContext('2d', contextAttributes);
}

function createOffscreenContext2D(width = innerWidth, height = innerHeight, contextAttributes) {
  return createOffscreenCanvas(width, height).getContext('2d', contextAttributes);
}

function createRenderingContext(width, height) {
  const contextAttributes = {
    desynchronized: true,
    willReadFrequently: true };


  const ctx = createContext2D(width, height, contextAttributes);
  const buffer = createOffscreenContext2D(width, height, contextAttributes);

  ctx.canvas.style.position = 'absolute';
  document.body.appendChild(ctx.canvas);

  return {
    buffer,
    ctx };

}

const particleCount = 100000;
const radius = 400;
const positionProps = ['x', 'y', 'z'];
const colorProps = ['r', 'g', 'b'];
const ageProps = ['age', 'life'];

let scene;
let camera;
let renderer;
let time;
let sphereGeom;
let sphereMat;
let sphere;
let pointsGeom;
let pointsMat;
let points;
let positions;
let colors;
let ages;
let controls;

addEventListener('DOMContentLoaded', start);
addEventListener('resize', resize);

function start() {
  time = 0;
  scene = new THREE.Scene();
  createCamera();
  createParticles();
  createPoints();
  createSphere();
  createRenderer();
  render();
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
  50,
  innerWidth / innerHeight,
  1,
  10000);

  camera.position.z = 2000; // приближение к объекту
}

function createParticles() {
  positions = new PropsArray(particleCount, positionProps);
  colors = new PropsArray(particleCount, colorProps);
  ages = new PropsArray(particleCount, ageProps);

  for (let i = 0; i < particleCount; i++) {
    resetParticle(i);
  }
}

function resetParticle(i) {
  positions.set(setPosition(), i * positions.spread);
  colors.set(setColor(), i * colors.spread);
  ages.set(setAge(), i * ages.spread);
}

function setPosition() {
  let r, p, t, x, y, z;

  r = radius + rand(10);

  t = rand(TAU);
  z = randRange(1);
  p = sqrt(1 - z * z);
  x = r * p * cos(t);
  y = r * p * sin(t);

  z *= r;

  return [x, y, z];
}

function setAge() {
  let age, life;

  age = 0;
  life = 50 + rand(100);

  return [age, life];
}

function setColor() {
  let r, g, b;

  r = fadeIn(60 + rand(100), 360);
  g = fadeIn(80 + rand(60), 360);
  b = fadeIn(180 + rand(60), 360);

  return [r, g, b];
}

function createPoints() {
  const uniforms = {
    u_time: {
      type: 'f',
      value: 0. },

    u_texture: {
      type: 'sampler2D',
      value: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/544318/particle-texture-2.png') } };



  pointsMat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('cnoise').textContent +
    document.getElementById('noise-util').textContent +
    document.getElementById('points-vert').textContent,
    fragmentShader: document.getElementById('points-frag').textContent,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    uniforms });


  pointsGeom = new THREE.BufferGeometry();

  pointsGeom.setAttribute(
  'position',
  new THREE.BufferAttribute(positions.values, positions.spread));

  pointsGeom.setAttribute(
  'color',
  new THREE.BufferAttribute(colors.values, colors.spread));

  pointsGeom.setAttribute(
  'age',
  new THREE.BufferAttribute(ages.values, ages.spread));


  points = new THREE.Points(pointsGeom, pointsMat);

  scene.add(points);
}

function createSphere() {
  const uniforms = {
    u_time: {
      type: 'f',
      value: 0. } };



  sphereMat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('cnoise').textContent +
    document.getElementById('noise-util').textContent +
    document.getElementById('sphere-vert').textContent,
    fragmentShader: document.getElementById('sphere-frag').textContent,
    uniforms });


  sphereGeom = new THREE.IcosahedronBufferGeometry(radius, 6);

  sphere = new THREE.Mesh(sphereGeom, sphereMat);

  scene.add(sphere);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: document.getElementById('canvas') });


  resize();
}

function updateParticles() {
  let i, age, life;

  for (i = 0; i < particleCount; i++) {
    [age, life] = ages.get(i * ages.spread);

    if (age > life) {
      resetParticle(i);
    } else {
      ages.set([++age], i * ages.spread);
    }
  }

  pointsGeom.attributes.position.needsUpdate = true;
  pointsGeom.attributes.color.needsUpdate = true;
  pointsGeom.attributes.age.needsUpdate = true;
}

function render() {
  requestAnimationFrame(render);

  updateParticles();

  time++;

  pointsMat.uniforms.u_time.value = time;
  sphereMat.uniforms.u_time.value = time;
  points.rotation.y += .0025;
  sphere.rotation.y += .0025;
  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
}