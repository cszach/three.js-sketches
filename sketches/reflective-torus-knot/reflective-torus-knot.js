import { WEBGL } from "../../three.js/examples/jsm/WebGL.js";
import * as THREE from "../../three.js/build/three.module.js";
import { OrbitControls } from "../../three.js/examples/jsm/controls/OrbitControls.js";

var scene, camera, renderer, controls; // Scene, camera, renderer, and controls
var path, format, urls, loader, reflectionCube, refractionCube; // Cube mapping
var torusKnotGeometry,
	sphereGeometry,
	reflectiveMaterial,
	refractiveMaterial,
	torusKnot,
	sphere; // Meshes
var ambient; // Light
var info; // Information div

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
	camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 100 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	controls = new OrbitControls( camera, renderer.domElement );

	camera.position.z = 12;
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.autoRotate = true;

	document.body.appendChild( renderer.domElement );

	// Set up the cube map

	path = "../../assets/cube-maps/Yokohama/";
	format = ".jpg";
	urls = [
		path + "posx" + format,
		path + "negx" + format,
		path + "posy" + format,
		path + "negy" + format,
		path + "posz" + format,
		path + "negz" + format
	];

	loader = new THREE.CubeTextureLoader();

	reflectionCube = loader.load( urls );
	reflectionCube.mapping = THREE.CubeReflectionMapping;
	reflectionCube.format = THREE.RGBFormat;

	refractionCube = loader.load( urls );
	refractionCube.mapping = THREE.CubeRefractionMapping;
	refractionCube.format = THREE.RGBFormat;

	scene.background = reflectionCube;

	// Create materials for the meshes

	reflectiveMaterial = new THREE.MeshLambertMaterial( {
		color: 0x999999,
		envMap: reflectionCube,
		combine: THREE.MixOperation,
		reflectivity: 0.8
	} );

	refractiveMaterial = new THREE.MeshLambertMaterial( {
		color: 0xffffff,
		envMap: refractionCube,
		refractionRatio: 0.95
	} );

	// Create meshes

	torusKnotGeometry = new THREE.TorusKnotBufferGeometry( 3, 1.2, 120, 120 );
	torusKnot = new THREE.Mesh( torusKnotGeometry, reflectiveMaterial );

	sphereGeometry = new THREE.SphereBufferGeometry( 5, 50, 50 );
	sphere = new THREE.Mesh( sphereGeometry, refractiveMaterial );

	torusKnot.matrixAutoUpdate = sphere.matrixAutoUpdate = false;

	scene.add( torusKnot );

	// Add lights

	ambient = new THREE.AmbientLight( 0xcccccc );

	scene.add( ambient );

	// Event handlers

	document.body.addEventListener( "keypress", onKeyPress );
	window.addEventListener( "resize", onWindowResize );

	// Informative overlay

	info = document.createElement( "div" );
	info.innerHTML = "Press space to toggle between meshes";
	document.body.appendChild( info );

}

function onKeyPress( event ) {

	if ( event.code == "Space" ) {

		if ( scene.children.includes( torusKnot ) ) {

			scene.remove( torusKnot );
			scene.add( sphere );

		} else {

			scene.remove( sphere );
			scene.add( torusKnot );

		}

	}

}

function render() {

	requestAnimationFrame( render );
	controls.update();
	renderer.render( scene, camera );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}
