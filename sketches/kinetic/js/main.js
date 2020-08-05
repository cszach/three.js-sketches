import { WEBGL } from "../../../three.js/examples/jsm/WebGL.js";
import * as THREE from "../../../three.js/build/three.module.js";
import { CanvasHelper } from "../../../lib/misc/CanvasHelper.js";
import { PointerLockControls } from "../../../three.js/examples/jsm/controls/PointerLockControls.js";
import { Room } from "./Room.js";
import { KineticBall } from "./KineticBall.js";
import { PointLightingSystem } from "./PointLightingSystem.js";

import { constrain } from "../../../lib/misc/MathExtras.js";

let scene, camera, cubeCamera, renderer, controls, clock;
let movingSpeed, movingLeft, movingRight, movingForward, movingBackward, movingDirection;
let room, matrix;
let light, lighting;

let canvas = document.getElementById( 'app' );
let context = canvas.getContext( 'webgl2', { alpha: false } );
let canvasHelper = new CanvasHelper( canvas );

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// Scene, cameras, renderer

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 60, canvasHelper.aspectRatio, 0.1, 100 );
	cubeCamera = new THREE.CubeCamera( 0.001, 1000, 512 );
	renderer = new THREE.WebGLRenderer( {
		canvas,
		context,
		antialias: true
	} );
	clock = new THREE.Clock( false );

	scene.add( cubeCamera );
	camera.position.set( 9, 1.6, - 7 );
	camera.lookAt( 0, 0, 0 );
	renderer.setSize( ...canvasHelper.dimension );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );
	renderer.outputEncoding = THREE.sRGBEncoding;

	// Controls

	controls = new PointerLockControls( camera, renderer.domElement );
	canvas.addEventListener( 'click', () => {

		controls.lock();

	} );

	movingLeft = movingRight = movingForward = movingBackward = false;

	document.addEventListener( 'keydown', ( event ) => {

		switch ( event.keyCode ) {

			case 37: // Left arrow
			case 65: // A
				movingLeft = true;
				break;

			case 39: // Right arrow
			case 68: // D
				movingRight = true;
				break;

			case 38: // Up arrow
			case 87: // W
				movingForward = true;
				break;

			case 40: // Down arrow
			case 83: // S
				movingBackward = true;
				break;

		}

	} );

	document.addEventListener( 'keyup', ( event ) => {

		switch ( event.keyCode ) {

			case 37: // Left arrow
			case 65: // A
				movingLeft = false;
				break;

			case 39: // Right arrow
			case 68: // D
				movingRight = false;
				break;

			case 38: // Up arrow
			case 87: // W
				movingForward = false;
				break;

			case 40: // Down arrow
			case 83: // S
				movingBackward = false;
				break;

		}

	} );

	movingDirection = new THREE.Vector3();
	movingSpeed = 1.5; // In meters per second

	// Room

	room = new Room( new THREE.Vector3( 20, 7, 15 ), 0xeeeeee );
	room.position.y = room.dimension.y / 2;
	scene.add( room );

	// Lighting

	light = new THREE.PointLight( 0xffffff, 1, Infinity, 2 );

	light.power = 11000;
	light.position.y = room.dimension.y / 2;
	light.castShadow = true;
	light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

	lighting = new PointLightingSystem( light, 5, 5, 2.5, 2.5 );
	// lighting.buildHelpers();

	scene.add( lighting.mesh );
	scene.add( new THREE.AmbientLight( 0xdddddd, 0.2 ) );

	// Balls

	let testingKineticBall = new KineticBall( 0.1, 50, 50, cubeCamera );
	testingKineticBall.mesh.position.y = 1.5;
	scene.add( testingKineticBall.mesh );

	clock.start();

}

function render() {

	requestAnimationFrame( render );

	canvasHelper.update();
	cubeCamera.update( renderer, scene );

	if ( controls.isLocked ) {

		movingDirection.x = Number( movingRight ) - Number( movingLeft );
		movingDirection.z = Number( movingForward ) - Number( movingBackward );
		movingDirection.normalize();

		let distance = movingSpeed * clock.getDelta();

		controls.moveForward( distance * movingDirection.z );
		controls.moveRight( distance * movingDirection.x );

	}

	camera.position.x = constrain( camera.position.x, - room.dimension.x / 2, room.dimension.x / 2 );
	camera.position.z = constrain( camera.position.z, - room.dimension.z / 2, room.dimension.z / 2 );

	renderer.render( scene, camera );

}
