import { WEBGL } from '../../three.js/examples/jsm/WebGL.js';
import * as THREE from '../../three.js/build/three.module.js';
import { OrbitControls } from '../../three.js/examples/jsm/controls/OrbitControls.js';

import { Singularity } from './js/Singularity.js';
import { Monolith } from './js/Monolith.js';
import { MonolithGenerator } from './js/MonolithGenerator.js';
import { MonolithAnimator } from './js/MonolithAnimator.js';
import { CanvasHelper } from '../../lib/misc/CanvasHelper.js';

let scene, camera, renderer, controls;
let animator;

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

	camera.position.z = - 2;

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( ...canvasHelper.dimension );
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );

	canvasHelper.bind( camera, renderer );

	// MESHES

	let monoliths = new THREE.Group();
	scene.add( monoliths );

	let singularity = new Singularity( 0.1, 0xffffff, 50, 50, 100000, true );
	let monolith = new Monolith( 0, 0, 0, 5, 5, 5, 0x000000, true );
	let outerSphere = new THREE.Sphere( singularity.position, 12 );
	let innerSphere = new THREE.Sphere( singularity.position, 8 );
	let generator = new MonolithGenerator( monolith, {
		quantity: 15,
		boundingSphere: outerSphere,
		maxNumberOfIterations: 50,
		singularity,
		object: monoliths
	} );

	generator.generate();
	generator.addMonolithsToScene();
	generator.removeMonolithsWithinThisSphere( innerSphere );
	generator.createHelpers();

	scene.add( singularity.mesh.clone() );
	camera.lookAt( singularity.mesh );

	// console.log( "Initiation finished with " + monoliths.children.length + " monoliths." );

	// Animation setup

	animator = new MonolithAnimator( generator.monoliths );
	animator.assign( MonolithAnimator.SOME );

	// Debugging purposes

	window.scene = scene;
	window.generator = generator;
	window.animator = animator;

}

function render( time ) {

	requestAnimationFrame( render );

	animateCamera(
		time * 0.0003,
		Math.sin( time * 0.0001 ) * Math.sin( time * 0.0001 ) * 3 + 1.5,
		2,
		2
	);

	animator.animate( time, 0.0005 );

	canvasHelper.update();
	controls.update();

	renderer.render( scene, camera );

}

function animateCamera( time, multiplier, heightMultiplier, advance ) {

	camera.position.set(

		Math.cos( time * advance ) * multiplier,
		Math.sin( time ) * heightMultiplier * Math.cos( time ),
		Math.sin( time * advance ) * multiplier

	);

}
