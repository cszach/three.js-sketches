// GLOBALS

let scene, camera, renderer, controls, clock;
let tree;

// Scene, camera & renderer settings

const background = new THREE.Color( 0xdddddd );
const fog = new THREE.FogExp2( 0xdddddd, 0.08 );
let canvas = document.querySelector( '#app' );
let context = canvas.getContext( 'webgl2', { alpha: false } );
let antialias = true;
let fov = 75, aspect = canvas.clientWidth / canvas.clientHeight, near = 0.1, far = 1000;

if ( THREE.WEBGL.isWebGL2Available() ) {

	init();
	animate();

} else {

	document.body.appendChild( THREE.WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// SCENE, CAMERA, RENDERER, CONTROLS, CLOCK

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	renderer = new THREE.WebGLRenderer( {
		canvas,
		context,
		antialias
	} );
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	clock = new THREE.Clock();

	scene.background = background;
	scene.fog = fog;
	camera.position.set( 0, 3, 10 );
	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	controls.enableDamping = true;

	// ENVIRONMENT

	addPlane( scene ); // eslint-disable-line no-undef

	// TREES

	tree = new PLTree(); // eslint-disable-line no-undef

	tree.setAnimation( function () {

		let time = clock.getElapsedTime();

		this.forEachBranch( function ( i, branch, leaf, light ) {

			light.visible = ( ( i - Math.trunc( time ) % 12 ) % 12 === 0 );
			leaf.material.setValues( {

				emissive: ( light.visible ) ? light.color.getHex() : 0x000000

			} );

		} );

	} );

	tree.plant( 0, 0, 0, false );
	scene.add( tree );


	// CreateJS setup

	createjs.Ticker.timingMode = createjs.Ticker.RAF;

	renderer.setAnimationLoop( render );

}

function render() {

	// If the canvas is resized, adjust the renderer and the camera's settings

	if ( canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight ) {

		onCanvasResize();

	}

	// In-callback animations

	tree.animate();

	// Updates

	controls.update();

	// Render the scene

	renderer.render( scene, camera );

}

function animate() {

	tree.grow();

}

function onCanvasResize() {

	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();

}
