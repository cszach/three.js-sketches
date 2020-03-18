/**
 * singularity
 *
 * A three.js sketch.
 *
 * @author Nguyen Hoang Duong / you_create@protonmail.com
 */

// three.js

import { WEBGL } from '../../../three.js/examples/jsm/WebGL.js';
import * as THREE from '../../../three.js/build/three.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

// App

import { SINGULARITY_NAME, MONOLITHS_NAME, SOME, INVISIBLES, AMBER } from './constants.js';
import { Singularity } from './entities/Singularity.js';
import { Monolith } from './entities/Monolith.js';
import { MonolithGenerator } from './facilities/MonolithGenerator.js';
import { MonolithAnimator } from './facilities/MonolithAnimator.js';
import { Particles } from './entities/Particles.js';
import { CanvasHelper } from '../../../lib/misc/CanvasHelper.js';

let scene, camera, renderer, controls, raycaster, mouse;
let monoliths, generator, animator; // Monoliths generator and animator
let particles; // System of particles
let sphere; // Background sphere
let userLight, userLightTarget; // Interactive light

// Renderer's params

let canvas = document.getElementById( 'app' );
let context = canvas.getContext( 'webgl2', { alpha: false } );
let canvasHelper;

// ===============================

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

// ===============================

function init() {

	// CANVAS

	canvasHelper = new CanvasHelper( canvas );

	// SCENE, CAMERA, RENDERER, CONTROLS

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, canvasHelper.aspectRatio, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer( {
		canvas,
		context,
		antialias: true
	} );
	controls = new OrbitControls( camera, renderer.domElement );

	camera.position.z = 5;

	// Controls settings

	controls.enableZoom = false;
	controls.enableRotate = false;
	controls.enableKeys = false;

	// Renderer's must-set

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( ...canvasHelper.dimension );

	// Physically correct lighting settings

	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );

	canvasHelper.bind( camera, renderer );

	// MESHES

	// Monoliths

	monoliths = new THREE.Group();
	let monolithMaterial = new THREE.MeshStandardMaterial( {
		metalness: 0.8,
		roughness: 0.5,
		color: 0x000000
	} );
	let monolith = new Monolith( 0, 0, 0, 5, 5, 5, monolithMaterial, true );

	monoliths.name = MONOLITHS_NAME;
	scene.add( monoliths );

	// Singularity's light

	let light = new THREE.PointLight( 0xffffff, 1, Infinity, 2 );
	light.power = 120000;

	light.castShadow = true;
	light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

	// Singularity

	let singularityMaterial = new THREE.MeshStandardMaterial( {
		emissive: 0xffffff,
		emissiveIntensity: light.intensity / Math.pow( 0.02, 2.0 ),
		color: 0x000000
	} );

	let singularity = new Singularity(
		0.1,
		0xffffff,
		50,
		50,
		singularityMaterial,
		light
	);
	singularity.mesh.name = SINGULARITY_NAME;

	let outerSphere = new THREE.Sphere( singularity.position, 12 );
	let innerSphere = new THREE.Sphere( singularity.position, 8 );

	generator = new MonolithGenerator( monolith, {
		quantity: 15,
		boundingSphere: outerSphere,
		maxNumberOfIterations: 50,
		singularity,
		object: monoliths
	} );

	generator.generate();
	generator.addMonolithsToScene();
	generator.hideMonolithsWithinThisSphere( innerSphere );
	generator.createHelpers( INVISIBLES, AMBER.getHex() );

	scene.add( singularity.mesh );

	// Background sphere

	let sphereGeo, sphereMat;

	sphereGeo = new THREE.SphereBufferGeometry( 20, 20, 20 );
	sphereMat = new THREE.MeshBasicMaterial( {
		color: 0xffffff,
		transparent: true,
		opacity: 0.5,
		wireframe: true,
	} );

	sphere = new THREE.Mesh( sphereGeo, sphereMat );
	scene.add( sphere );

	// Particles

	sphereGeo.computeBoundingSphere();

	particles = new Particles( 20000, 0.05, AMBER.getHex() );
	particles.build( - sphereGeo.parameters.radius, sphereGeo.parameters.radius );

	scene.add( particles.points );

	// User's interactive light

	userLight = new THREE.SpotLight( 0xffffff, 1, Infinity, Math.PI / 8, 0.6, 2 );
	userLightTarget = new THREE.Object3D();

	userLight.power = 80000;
	userLight.target = userLightTarget;
	userLight.castShadow = true;
	userLight.shadow.mapSize.width = userLight.shadow.mapSize.height = 2048;
	userLight.visible = false;

	scene.add( userLight, userLightTarget );

	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();

	document.body.addEventListener( 'click', function () {

		singularity.toggleLight();
		userLight.visible = ! userLight.visible;

	} );
	document.body.addEventListener( 'mousemove', onMouseMove );

	// Animation setup

	animator = new MonolithAnimator( generator.monoliths );
	animator.assign( SOME );

	// Sound

	let listener = new THREE.AudioListener();
	let audio = new THREE.Audio( listener );
	let media = new Audio( "audio/ambient.mp3" );

	media.loop = true;
	media.play();
	audio.setMediaElementSource( media );

	// Debugging purposes

	window.scene = scene;
	window.generator = generator;
	window.animator = animator;

}

function render( time ) {

	requestAnimationFrame( render );

	// Animate the camera

	animateCamera(
		time * 0.0001,
		Math.sin( time * 0.0001 ) * Math.sin( time * 0.0001 ) * 3 + 1.5,
		2,
		2
	);

	// Animate the particles

	particles.points.geometry.verticesNeedUpdate = true;
	particles.animate( time, 0.0001 );

	// Animate the background sphere

	sphere.rotation.x = Math.sin( time * 0.0003 );
	sphere.rotation.y = Math.sin( time * 0.0007 );
	sphere.rotation.z = Math.sin( time * 0.0005 );

	// Animate the monoliths

	animator.animate( time, 0.0005 );

	// User's light

	updateUserLight();

	// Update things

	generator.helpers.forEach( ( helper ) => {

		helper.update();

	} );
	canvasHelper.update();
	controls.update();

	// Render things

	renderer.render( scene, camera );

}

function onMouseMove( event ) {

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function updateUserLight() {

	if ( ! userLight.visible ) return;

	userLight.position.copy( camera.position );

	raycaster.setFromCamera( mouse, camera );
	userLightTarget.position.copy( raycaster.ray.direction.add( raycaster.ray.origin ) );

}

/**
 * Animate the camera
 *
 * @param {number} time Time elapsed since the sketch started
 * @param {number} multiplier Multiplies with the trigonemtric results when computing the x and z indices
 * @param {number} heightMultiplier Multiplies with the trigonemtric result when computing the y index
 * @param {number} advance Multiplies with time
 */
function animateCamera( time, multiplier, heightMultiplier, advance ) {

	camera.position.set(

		Math.cos( time * advance ) * multiplier,
		Math.sin( time ) * heightMultiplier * Math.cos( time ),
		Math.sin( time * advance ) * multiplier

	);

}
