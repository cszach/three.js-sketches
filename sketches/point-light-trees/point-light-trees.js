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
	render();

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

	addPlane( scene ); // eslint-disable-line no-undef
	tree = new PLTree(); // eslint-disable-line no-undef

	tree.computeHeight();
	tree.position.y = tree.height / 2;
	tree.setAnimation( function () {

		let time = clock.getElapsedTime();

		this.forEachBranch( function ( i, branch, leaf, light ) {

			light.visible = ( ( i - Math.trunc( time ) % 12 ) % 12 === 0 );
			leaf.material.setValues( {

				emissive: ( light.visible ) ? light.color.getHex() : 0x000000

			} );

		} );

	} );

	camera.lookAt( 0, tree.height / 2, 0 );

	scene.add( tree );

}

function animate() {

	tree.animate();

}

function render() {

	requestAnimationFrame( render );
	animate();

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
