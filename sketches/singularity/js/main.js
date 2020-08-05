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

// Other lib

import TWEEN from '../../../lib/tween.js/tween.esm.js';

// App

import { SINGULARITY_NAME, MONOLITHS_NAME, SOME, INVISIBLES, BLACK, WHITE, AMBER } from './constants.js';
import { Singularity } from './entities/Singularity.js';
import { Monolith } from './entities/Monolith.js';
import { MonolithGenerator } from './facilities/MonolithGenerator.js';
import { MonolithAnimator } from './facilities/MonolithAnimator.js';
import { Particles } from './entities/Particles.js';
import { CanvasHelper } from '../../../lib/misc/CanvasHelper.js';

let scene, camera, renderer, controls, raycaster, mouse;
let generator, animator; // Monoliths generator and animator
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
	intro( 3000, 800 );

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

// ===============================

function init() {

	// CANVAS

	canvasHelper = new CanvasHelper( canvas );

	// SCENE, CAMERA, RENDERER, CONTROLS

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, canvasHelper.aspect, 0.1, 1000 );
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
	renderer.setSize( canvas.clientWidth, canvas.clientHeight );

	// Physically correct lighting settings

	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );

	canvasHelper.bind( camera, renderer );

	// MESHES

	// Monoliths

	let monoliths = new THREE.Group();
	let monolithMaterial = new THREE.MeshStandardMaterial( {
		metalness: 0.8,
		roughness: 0.5,
		color: 0x000000
	} );
	let monolith = new Monolith( 0, 0, 0, 5, 5, 5, monolithMaterial, true );

	monoliths.name = MONOLITHS_NAME;
	scene.add( monoliths );

	// Singularity's light

	let light = new THREE.PointLight( WHITE, 1, Infinity, 2 );
	light.power = 120000;

	light.castShadow = true;
	light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

	// Singularity

	let singularityMaterial = new THREE.MeshStandardMaterial( {
		emissive: WHITE,
		emissiveIntensity: light.intensity / Math.pow( 0.02, 2.0 ),
		color: BLACK
	} );

	let singularity = new Singularity(
		0.1,
		0xffffff,
		50,
		50,
		singularityMaterial,
		light,
		true
	);
	singularity.group.name = SINGULARITY_NAME;


	scene.add( singularity.group );

	let outerSphere = new THREE.Sphere( singularity.mesh.position, 12 );
	let innerSphere = new THREE.Sphere( singularity.mesh.position, 8 );

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
	generator.createHelpers( INVISIBLES, AMBER );

	// Background sphere

	let sphereGeo, sphereMat;

	sphereGeo = new THREE.SphereBufferGeometry( 20, 20, 20 );
	sphereMat = new THREE.MeshBasicMaterial( {
		color: 0xffffff,
		wireframe: true
	} );

	sphere = new THREE.Mesh( sphereGeo, sphereMat );
	scene.add( sphere );

	// Particles

	sphereGeo.computeBoundingSphere();

	particles = new Particles( 20000, 0.05, AMBER );
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
	window.light = light;

}

function render( time ) {

	requestAnimationFrame( render );
	TWEEN.update( time );

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

	sphere.rotation.x = Math.sin( time * 0.00006 );
	sphere.rotation.y = Math.sin( time * 0.00014 );
	sphere.rotation.z = Math.sin( time * 0.0001 );

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

function intro( length, wait ) {

	let sglrt = scene.getObjectByName( SINGULARITY_NAME );
	let sglrtLight = sglrt.getObjectByName( "Light" );
	let sglrtMaterial = sglrt.getObjectByName( "Mesh" ).material;

	sglrtLight.power = 0;
	sglrtMaterial.transparent = true;
	sglrtMaterial.opacity = 0;

	new TWEEN.Tween( sglrtLight )
		.delay( wait )
		.to( { power: 120000 }, length )
		.easing( TWEEN.Easing.Linear.None )
		.start();

	new TWEEN.Tween( sglrtMaterial )
		.delay( wait )
		.to( { opacity: 1 }, length )
		.easing( TWEEN.Easing.Linear.None )
		.start();

}

function onMouseMove( event ) {

	let canvasRect = canvas.getBoundingClientRect();
	mouse.x = ( ( event.clientX - canvasRect.left ) / canvas.clientWidth ) * 2 - 1;
	mouse.y = - ( ( event.clientY - canvasRect.top ) / canvas.clientHeight ) * 2 + 1;

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
