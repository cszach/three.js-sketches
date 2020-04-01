import { WEBGL } from "../../../three.js/examples/jsm/WebGL.js";
import * as THREE from "../../../three.js/build/three.module.js";
import { OrbitControls } from "../../../three.js/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls; // Scene, camera, renderer, and controls
let ground, WoolenBall, balls; // Meshes
let loader, wool01, wool02, wool03; // Textures
let spotLight01, spotLight02; // Lights

let canvas = document.getElementById( 'app' );
let aspect = canvas.clientWidth / canvas.clientHeight;
let context = canvas.getContext( 'webgl2', { alpha: false } );

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
		canvas,
		context,
		antialias: true
	} );
	controls = new OrbitControls( camera, renderer.domElement );

	camera.position.set( - 0.03, 0.1, 0.2 );
	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );
	renderer.outputEncoding = THREE.GammaEncoding;
	controls.minDistance = 0.15;
	controls.maxDistance = 0.5;
	controls.enablePan = false;
	controls.maxPolarAngle = Math.PI / 2 - 0.05;

	renderer.clear();

	// Create the ground

	let geometry, material;

	loader = new THREE.TextureLoader();

	loader.setPath( "../../assets/textures/" );

	geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );
	material = new THREE.MeshStandardMaterial( { color: 0xe0e0e0 } );

	ground = new THREE.Mesh( geometry, material );
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;

	scene.add( ground );

	// Woolen balls

	wool01 = new THREE.MeshStandardMaterial( {
		roughness: 1,
		metalness: 0,
		map: loadTexture( loader, "wool-01/color.jpg" ),
		aoMap: loadTexture( loader, "wool-01/ao.jpg" ),
		bumpMap: loadTexture( loader, "wool-01/height.jpg" ),
		normalMap: loadTexture( loader, "wool-01/normal.jpg" ),
		roughnessMap: loadTexture( loader, "wool-01/roughness.jpg" )
	} );

	wool02 = wool01.clone();
	wool02.setValues( {
		map: loadTexture( loader, "wool-02/color.jpg" ),
		aoMap: loadTexture( loader, "wool-02/ao.jpg" ),
		bumpMap: loadTexture( loader, "wool-02/height.jpg" ),
		normalMap: loadTexture( loader, "wool-02/normal.jpg" ),
		roughnessMap: loadTexture( loader, "wool-02/roughness.jpg" )
	} );

	wool03 = wool02.clone();
	wool03.setValues( {
		map: loadTexture( loader, "wool-03/color.jpg" ),
		aoMap: loadTexture( loader, "wool-03/ao.jpg" ),
		bumpMap: loadTexture( loader, "wool-03/height.jpg" ),
		normalMap: loadTexture( loader, "wool-03/normal.jpg" ),
		roughnessMap: loadTexture( loader, "wool-03/roughness.jpg" )
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
	balls.castShadow = balls.receiveShadow = true;

	balls.add( new WoolenBall( - 0.05, 0, wool01 ) );
	balls.add( new WoolenBall( 0.05, - 0.06, wool02 ) );
	balls.add( new WoolenBall( 0.05, 0.06, wool03 ) );

	scene.add( balls );

	// Add lights

	spotLight01 = new THREE.SpotLight( 0xffffff, 1, 0, 0.35, 0.2, 2 );
	spotLight02 = new THREE.SpotLight( 0xffffff, 1, 0, 0.35, 0.2, 2 );

	// Lights' transforms

	spotLight01.position.set( - 0.3, 0.5, 0.3 );
	spotLight02.position.set( 0.3, 0.35, 0.3 );
	spotLight01.target = spotLight02.target = balls;
	spotLight01.castShadow = true;
	spotLight02.castShadow = true;
	spotLight01.shadow.mapSize.width = spotLight01.shadow.mapSize.height = 2048;
	spotLight02.shadow.mapSize.width = spotLight02.shadow.mapSize.height = 2048;

	// Physically correct lights

	spotLight01.power = spotLight02.power = 150;

	scene.add( spotLight01, spotLight02 );

}

function render() {

	requestAnimationFrame( render );

	if ( canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight ) {

		aspect = canvas.clientWidth / canvas.clientHeight;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		renderer.setSize( canvas.clientWidth, canvas.clientHeight );

	}

	controls.update();
	camera.lookAt( 0, 0.05, 0 ); // Look at the balls' center

	renderer.render( scene, camera );

}

function loadTexture( loader, path ) {

	let texture = loader.load( path );
	texture.encoding = THREE.sRGBEncoding;

	return texture;

}
