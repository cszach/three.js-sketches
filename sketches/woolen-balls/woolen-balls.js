import { WEBGL } from "../../libm/WebGL.js";
import * as THREE from "../../libm/three.module.js";
import { OrbitControls } from "../../libm/OrbitControls.js";

var scene, camera, renderer, controls; // Scene, camera, renderer, and controls
var ground, WoolenBall, balls; // Meshes
var loader, porcelainWhite, wool01, wool02, wool03; // Textures
var ambient, spotLight01, spotLight02; // Lights
var helper01, helper02;

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
	camera = new THREE.PerspectiveCamera( 75, aspect, 0.001, 100 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	controls = new OrbitControls( camera, renderer.domElement );

	scene.background = new THREE.Color( 0xdddddd );
	camera.position.set( - 0.03, 0.1, 0.2 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	controls.minDistance = 0.15;
	controls.maxDistance = 0.5;
	controls.enablePan = false;
	controls.maxPolarAngle = Math.PI / 2 - 0.05;

	document.body.appendChild( renderer.domElement );

	// Create the ground

	let geometry, material;

	loader = new THREE.TextureLoader();

	loader.setPath( "../../assets/textures/" );

	porcelainWhite = loader.load( "porcelain-white/matcap-porcelain-white.jpg" );
	material = new THREE.MeshMatcapMaterial( { matcap: porcelainWhite } );
	geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );

	ground = new THREE.Mesh( geometry, material );
	ground.rotation.x = - Math.PI / 2;

	scene.add( ground );

	// Woolen balls

	wool01 = new THREE.MeshStandardMaterial( {
		roughness: 1,
		metalness: 0,
		map: loader.load( "wool-01/color.jpg" ),
		aoMap: loader.load( "wool-01/ao.jpg" ),
		bumpMap: loader.load( "wool-01/height.jpg" ),
		normalMap: loader.load( "wool-01/normal.jpg" ),
		roughnessMap: loader.load( "wool-01/roughness.jpg" )
	} );

	wool02 = wool01.clone();
	wool02.setValues( {
		map: loader.load( "wool-02/color.jpg" ),
		aoMap: loader.load( "wool-02/ao.jpg" ),
		bumpMap: loader.load( "wool-02/height.jpg" ),
		normalMap: loader.load( "wool-02/normal.jpg" ),
		roughnessMap: loader.load( "wool-02/roughness.jpg" )
	} );

	wool03 = wool02.clone();
	wool03.setValues( {
		map: loader.load( "wool-03/color.jpg" ),
		aoMap: loader.load( "wool-03/ao.jpg" ),
		bumpMap: loader.load( "wool-03/height.jpg" ),
		normalMap: loader.load( "wool-03/normal.jpg" ),
		roughnessMap: loader.load( "wool-03/roughness.jpg" )
	} );

	let wools = [ wool01, wool02, wool03 ];
	let woolenBallRadius = 0.05;
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

	balls.add( new WoolenBall( - 0.05, 0, wool01 ) );
	balls.add( new WoolenBall( 0.05, - 0.06, wool02 ) );
	balls.add( new WoolenBall( 0.05, 0.06, wool03 ) );

	scene.add( balls );

	// Add lights

	ambient = new THREE.AmbientLight( 0x333333 );
	spotLight01 = new THREE.SpotLight( 0xffffff, 1 );
	spotLight02 = new THREE.SpotLight( 0xffffff, 1 );

	// Lights' transforms

	spotLight01.position.set( - 0.3, 0.5, 0.3 );
	spotLight02.position.set( 0.3, 0.35, 0.3 );
	spotLight01.angle = spotLight02.angle = 0.35;
	spotLight01.target = spotLight02.target = balls;

	// Physically correct lights

	spotLight01.distance = spotLight02.distance = Infinity;
	spotLight01.decay = spotLight02.decay = 2;
	spotLight01.power = spotLight02.power = 10;

	helper01 = new THREE.SpotLightHelper( spotLight01 );
	helper02 = new THREE.SpotLightHelper( spotLight02 );

	scene.add( ambient, spotLight01, spotLight02, helper01, helper02 );

	// Event listeners

	window.addEventListener( "resize", onWindowResize );

}

function render() {

	requestAnimationFrame( render );

	controls.update();
	helper01.update();
	helper02.update();
	camera.lookAt( 0, 0.05, 0 ); // Look at the balls' center

	renderer.render( scene, camera );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}
