/**
 * singularity
 *
 * A three.js sketch.
 *
 * @author Nguyen Hoang Duong / you_create@protonmail.com
 */

// three.js

import { WEBGL } from '../../three.js/examples/jsm/WebGL.js';
import * as THREE from '../../three.js/build/three.module.js';
import { OrbitControls } from '../../three.js/examples/jsm/controls/OrbitControls.js';

// App

import { NONE, SOME, ALL, VISIBLES, INVISIBLES } from './js/constants.js';
import { Singularity } from './js/Singularity.js';
import { Monolith } from './js/Monolith.js';
import { MonolithGenerator } from './js/MonolithGenerator.js';
import { MonolithAnimator } from './js/MonolithAnimator.js';
import { CanvasHelper } from '../../lib/misc/CanvasHelper.js';

let scene, camera, renderer, controls;
let generator, animator; // Monoliths generator and animator
let sphere; // Background sphere

let canvas = document.getElementById( 'app' );
let context = canvas.getContext( 'webgl2', { alpha: false } );
let canvasHelper;

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

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

	// Monoliths & Singularity

	let monoliths = new THREE.Group();
	scene.add( monoliths );

	let singularity = new Singularity( 0.1, 0xffffff, 50, 50, 100000, true );
	let monolith = new Monolith( 0, 0, 0, 5, 5, 5, 0x000000, true );
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
	generator.createHelpers( INVISIBLES, 0xffca28 );

	scene.add( singularity.mesh.clone() );

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

	// Animation setup

	animator = new MonolithAnimator( generator.monoliths );
	animator.assign( SOME );

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

	// Animate the background sphere

	sphere.rotation.x = Math.sin( time * 0.0003 );
	sphere.rotation.y = Math.sin( time * 0.0007 );
	sphere.rotation.z = Math.sin( time * 0.0005 );

	// Animate the monoliths

	animator.animate( time, 0.0005 );

	// Update things

	generator.helpers.forEach( ( helper ) => {

		helper.update();

	} );
	canvasHelper.update();
	controls.update();

	// Render things

	renderer.render( scene, camera );

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
