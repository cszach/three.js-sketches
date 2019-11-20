import { WEBGL } from "../libm/WebGL.js";
import * as THREE from "../libm/three.module.js";
import { OrbitControls } from "../libm/OrbitControls.js";

var scene, camera, renderer, controls; // Scene, camera, renderer, and controls
var ground, WoolenBall, balls; // Meshes
var loader, porcelainWhite, wool01, wool02, wool03; // Textures
var ambient, spotLight01, spotLight02; // Lights

var aspect = window.innerWidth / window.innerHeight;
var canvas = document.createElement( "canvas" );
var context = canvas.getContext( "webgl2", { alpha: false } );

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// Set up the scene, the camera, the renderer, and the controls

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 2000 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	controls = new OrbitControls( camera, renderer.domElement );

	scene.background = new THREE.Color( 0xdddddd );
	camera.position.set( 4, 8, 14 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	controls.minDistance = 15;
	controls.maxDistance = 25;
	controls.enablePan = false;
	controls.maxPolarAngle = Math.PI / 2 - 0.05;

	document.body.appendChild( renderer.domElement );

	// Create the ground

	let geometry, material;

	loader = new THREE.TextureLoader();

	porcelainWhite = loader.load(
		"textures/porcelain-white/matcap-porcelain-white.jpg"
	);
	material = new THREE.MeshMatcapMaterial( { matcap: porcelainWhite } );
	geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );

	ground = new THREE.Mesh( geometry, material );
	ground.rotation.x = - Math.PI / 2;

	scene.add( ground );

	// Woolen balls

	wool01 = new THREE.MeshStandardMaterial( {
		roughness: 1,
		metalness: 0,
		map: loader.load( "textures/wool-01/color.jpg" ),
		aoMap: loader.load( "textures/wool-01/ao.jpg" ),
		bumpMap: loader.load( "textures/wool-01/height.jpg" ),
		normalMap: loader.load( "textures/wool-01/normal.jpg" ),
		roughnessMap: loader.load( "textures/wool-01/roughness.jpg" )
	} );

	wool02 = wool01.clone();
	wool02.setValues( {
		map: loader.load( "textures/wool-02/color.jpg" ),
		aoMap: loader.load( "textures/wool-02/ao.jpg" ),
		bumpMap: loader.load( "textures/wool-02/height.jpg" ),
		normalMap: loader.load( "textures/wool-02/normal.jpg" ),
		roughnessMap: loader.load( "textures/wool-02/roughness.jpg" )
	} );

	wool03 = wool02.clone();
	wool03.setValues( {
		map: loader.load( "textures/wool-03/color.jpg" ),
		aoMap: loader.load( "textures/wool-03/ao.jpg" ),
		bumpMap: loader.load( "textures/wool-03/height.jpg" ),
		normalMap: loader.load( "textures/wool-03/normal.jpg" ),
		roughnessMap: loader.load( "textures/wool-03/roughness.jpg" )
	} );

	let wools = [ wool01, wool02, wool03 ];
	let woolenBallRadius = 4;
	geometry = new THREE.SphereBufferGeometry( woolenBallRadius, 50, 50 );

	WoolenBall = function (
		posX,
		posZ,
		wool = wools[ Math.floor( Math.random() * 3 ) ].clone()
	) {

		THREE.Mesh.apply( this, arguments );

		this.geometry = geometry;
		this.material = wool;
		this.position.set( posX, woolenBallRadius, posZ );
		this.castShadow = this.receiveShadow = true;

	};

	WoolenBall.prototype = Object.create( THREE.Mesh.prototype );
	WoolenBall.prototype.constructor = WoolenBall;

	balls = new THREE.Group();
	balls.name = "Woolen balls";

	balls.add( new WoolenBall( 0, - 4, wool01 ) );
	balls.add( new WoolenBall( - 4.5, 4, wool02 ) );
	balls.add( new WoolenBall( 4.5, 4, wool03 ) );

	scene.add( balls );

	// Add lights

	ambient = new THREE.AmbientLight( 0x333333 );
	spotLight01 = new THREE.SpotLight( 0xffffff, 150 );
	spotLight02 = new THREE.SpotLight( 0xffffff, 150 );

	spotLight01.position.set( - 30, 50, 30 );
	spotLight02.position.set( 30, 35, 30 );
	spotLight01.angle = spotLight02.angle = 0.35;
	spotLight01.target = spotLight02.target = balls;

	scene.add( ambient, spotLight01, spotLight02 );

	// Event listeners

	window.addEventListener( "resize", onWindowResize );

}

function render() {

	requestAnimationFrame( render );

	controls.update();
	camera.lookAt( balls.position );

	renderer.render( scene, camera );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}
