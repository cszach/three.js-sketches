// GLOBALS

let scene, camera, renderer, controls;

// Scene, camera & renderer settings

let background = new THREE.Color( 0xdddddd );
let canvas = document.querySelector( '#app' );
let context = canvas.getContext( 'webgl2', { alpha: false } );
let antialias = true;
let fov = 75, aspect = canvas.clientWidth / canvas.clientHeight, near = 1, far = 1000;

if ( THREE.WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( THREE.WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// SCENE, CAMERA, RENDERER, CONTROLS

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	renderer = new THREE.WebGLRenderer( {
		canvas,
		context,
		antialias
	} );
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	scene.background = background;
	camera.position.set( 0, 3, 15 );
	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	controls.enableDamping = true;

	addPlane( scene );
	addCube( scene );
	addPointLight( scene, { x: 5, y: 5, z: 5 } );

}

function render() {

	requestAnimationFrame( render );

	if ( canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight ) {

		onCanvasResize();

	}
	controls.update();

	renderer.render( scene, camera );

}

function onCanvasResize() {

	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();

}
