/* global createjs */

// GLOBALS

let scene, camera, renderer, controls;
let numberOfTrees = 1;

// Scene, camera & renderer settings

const background = new THREE.Color( 0xdddddd );
const fog = new THREE.FogExp2( 0xdddddd, 0.08 );
let canvas = document.querySelector( '#app' );
let canvasWidth = canvas.clientWidth, canvasHeight = canvas.clientHeight;
const context = canvas.getContext( 'webgl2', { alpha: false } );
const antialias = true;
let fov = 75, aspect = canvasWidth / canvasHeight, near = 0.1, far = 1000;

if ( THREE.WEBGL.isWebGL2Available() ) {

	init();
	animate();

} else {

	document.body.appendChild( THREE.WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// SCENE, CAMERA, RENDERER, CONTROLS, CLOCK

	scene = new THREE.Scene();
	scene.background = background;
	scene.fog = fog;

	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 3, 10 );

	renderer = new THREE.WebGLRenderer( {
		canvas,
		context,
		antialias
	} );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setPixelRatio( window.devicePixelRatio );

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;

	// ENVIRONMENT

	addPlane( scene ); // eslint-disable-line no-undef

	// TREES

	// CreateJS setup

	createjs.Ticker.framerate = 60;
	renderer.setAnimationLoop( render );

}

function render() {

	// If the canvas is resized, adjust the renderer and the camera's settings

	if ( canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight ) {

		canvasWidth = canvas.clientWidth;
		canvasHeight = canvas.clientHeight;
		onCanvasResize();

	}

	// Updates

	controls.update();

	// Render the scene

	renderer.render( scene, camera );

}

function animate() { }

function onCanvasResize() {

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( canvasWidth, canvasHeight );

}
