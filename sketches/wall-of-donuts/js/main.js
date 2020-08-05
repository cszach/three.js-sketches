/**
 * Wall of Donuts
 *
 * A room with donuts sticked on one wall and has some misc objects in it
 * (because why not?). This sketch also contains interaction.
 *
 * The position of the room, the door (& the doorview), the mirror, and the
 * light switch are dynamic i.e. they are calculated based on DIMENSION (see
 * 'Constants' below) and changing DIMENSION will also change their respective
 * position. Other objects' positions are not and have to be set manually.
 *
 * TODO:
 *   o Implement physically correct lights & shadows
 *     o Physically correct ambient lights, point lights, and external light
 *       from "outside" the door
 *     o Correct shadows
 *     o Correct dimension
 *  o Correct dimension (e.g. simulate first person view in real life)
 *  o Find better controls (i.e. just like FlyControls but no z-rotation)
 *
 * @author Nguyen Hoang Duong / https://github.com/you-create
 */

import { WEBGL } from "../../../three.js/examples/jsm/WebGL.js";
import * as THREE from "../../../three.js/build/three.module.js";
import { FlyControls } from "../../../three.js/examples/jsm/controls/FlyControls.mod.js";
import { OrbitControls } from "../../../three.js/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "../../../three.js/examples/jsm/objects/Reflector.js";
import { GLTFLoader } from "../../../three.js/examples/jsm/loaders/GLTFLoader.js";
import { CanvasHelper } from "../../../lib/misc/CanvasHelper.js";
import { Room } from "./Room.js";

// Everything inside the scene + variables used for raycasting, animation,
// and loaders

let scene, camera, first, third, renderer, fly, orbit;
let room; // Room
let mirror, mirrorSurface, mirrorMesh; // Mirror
let door, doorKnob01, doorKnob02, doorWithKnobs, doorView; // Room's door
let button, buttonLight; // Light switch
let cube, torus, stand, earth, planet, clouds; // Miscellaenous objects
let ambient, point, bulb; // Lights
let donut01, donut02, donut03, donut04, donut05, donut06, donut07; // Donuts
let buttonMaterial, bulbMaterial; // Materials that are not static
let raycaster, mouse, intersects; // Raycasting
let textureLoader, modelLoader; // Loaders
let firstView; // Helpers
let time, clock; // Animation
let debugging = false; // Is debugging?

// Variables used by the camera and the renderer

let canvas = document.getElementById( 'app' );
let context = canvas.getContext( "webgl2", { alpha: false } );
let canvasHelper;

// Constants

let RED = new THREE.Color( 0xff0000 );
let GREEN = new THREE.Color( 0x00ff00 );
let BLUE = new THREE.Color( 0x0000ff );
let OFFSET = 0.001; // The amount of translation used to avoid z-fighting
let DIMENSION = new THREE.Vector3( 30, 20, 20 ); // The dimension of the room
let DOORWIDTH = 9; // The width of the room's door
let DOORHEIGHT = 15; // The height of the room's door
let NORMALROOMAMBIENT = new THREE.Color( 0x222222 ); // Color of the ambient light when the room's door is closed
let OUTSIDELIGHTEDAMBIENT = new THREE.Color( 0x555555 ); // Color of the ambient light when the room's door is opened
let POINTLIGHTINTENSITY = 1.75; // The intensity of the room's point light when it is on

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	canvasHelper = new CanvasHelper( canvas );

	// Set up the scene, the camera, the renderer, and the controls

	scene = new THREE.Scene();
	first = new THREE.PerspectiveCamera( 75, canvasHelper.aspectRatio, 0.1, 100 );
	firstView = new THREE.CameraHelper( first );
	third = new THREE.PerspectiveCamera( 75, canvasHelper.aspectRatio, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	clock = new THREE.Clock();
	fly = new FlyControls( first, renderer.domElement );
	orbit = new OrbitControls( third, renderer.domElement );

	first.position.set( 0, 2, 3 );
	firstView.visible = debugging;
	third.position.set( 0, 20, 15 );
	camera = debugging ? third : first;
	renderer.setSize( canvas.clientWidth, canvas.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	fly.movementSpeed = 100;
	fly.rollSpeed = Math.PI / 48;
	fly.setMouseMoveOnly();
	orbit.autoRotate = true;

	scene.add( firstView );

	canvasHelper.bind( camera, renderer );

	// Create the room

	textureLoader = new THREE.TextureLoader();

	let wallMaterial = new THREE.MeshPhongMaterial( {
		shininess: 20,
		color: 0x9d1b3a
	} );
	let floorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xeeeeee,
		roughness: 0.8,
		metalness: 0.2
	} );
	let ceilingMaterial = wallMaterial.clone();

	room = new Room( DIMENSION, wallMaterial, floorMaterial, ceilingMaterial );
	room.name = "Room";

	scene.add( room );

	// Add a door

	let doorGeometry = new THREE.BoxGeometry( DOORWIDTH, DOORHEIGHT, 0.25 );
	let doorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xfb8c00,
		roughness: 0.8,
		metalness: 0.3
	} );

	door = new THREE.Mesh( doorGeometry, doorMaterial );

	let doorKnobGeometry = new THREE.SphereGeometry( 0.45, 45, 45 );
	let doorKnobMaterial = new THREE.MeshStandardMaterial( {
		color: 0xffeb3b,
		roughness: 0.8,
		metalness: 0.5
	} );

	doorKnob01 = new THREE.Mesh( doorKnobGeometry, doorKnobMaterial );
	doorKnob02 = doorKnob01.clone();

	doorKnob01.position.x = doorKnob02.position.x = 3;
	doorKnob01.position.z = 0.4;
	doorKnob02.position.z = - 0.4;
	doorKnob01.name = doorKnob02.name = "Door knob";

	door.castShadow = doorKnob01.castShadow = doorKnob02.castShadow = true;
	door.receiveShadow = doorKnob01.receiveShadow = doorKnob02.receiveShadow = true;

	doorWithKnobs = new THREE.Object3D();
	doorWithKnobs.name = "Door";
	doorWithKnobs.add( door, doorKnob01, doorKnob02 );

	doorWithKnobs.position.z = DIMENSION.z / 2;
	doorWithKnobs.position.y = DOORHEIGHT / 2 - DIMENSION.y / 2;
	doorWithKnobs.userData = { isClosed: true };

	room.add( doorWithKnobs );

	// Add a door view

	textureLoader.setPath( "textures/" );

	let doorViewImage = textureLoader.load( "doorview.png" );
	let doorViewGeometry = new THREE.PlaneBufferGeometry( DOORWIDTH, DOORHEIGHT );
	let doorViewMaterial = new THREE.MeshBasicMaterial( {
		map: doorViewImage
	} );

	doorView = new THREE.Mesh( doorViewGeometry, doorViewMaterial );

	doorView.rotation.y = Math.PI;
	doorView.position.set(
		doorWithKnobs.position.x,
		doorWithKnobs.position.y,
		doorWithKnobs.position.z - OFFSET
	);

	room.add( doorView );

	// Create a light switch

	let SWITCHDEPTH = 0.1;

	let buttonGeometry = new THREE.BoxGeometry( 0.6, 0.9, SWITCHDEPTH );
	buttonMaterial = new THREE.MeshStandardMaterial( {
		color: 0x000000,
		emissive: 0x00ff00,
		emissiveIntensity: 0.8
	} );

	button = new THREE.Mesh( buttonGeometry, buttonMaterial );
	button.name = "Button";

	buttonLight = new THREE.PointLight( 0x00ff00, 0.3, 3 );
	buttonLight.add( button );
	buttonLight.position.set( 6, - 0.5, DIMENSION.z / 2 - SWITCHDEPTH / 2 );

	room.add( buttonLight );

	// Add a mirror

	let MIRRORWIDTH = 18;
	let MIRRORHEIGHT = 18;
	let MIRRORDEPTH = 0.125;

	let mirrorSurfaceGeometry = new THREE.PlaneBufferGeometry(
		MIRRORWIDTH,
		MIRRORHEIGHT
	);

	mirrorSurface = new Reflector( mirrorSurfaceGeometry, {
		textureWidth: canvas.clientWidth * window.devicePixelRatio,
		textureHeight: canvas.clientHeight * window.devicePixelRatio,
		recursion: 1
	} );
	mirrorSurface.position.z = MIRRORDEPTH / 2;

	let mirrorGeometry = new THREE.BoxGeometry(
		MIRRORWIDTH,
		MIRRORHEIGHT,
		MIRRORDEPTH - OFFSET
	);
	let mirrorMaterial = new THREE.MeshBasicMaterial( { color: 0x222222 } );

	mirrorMesh = new THREE.Mesh( mirrorGeometry, mirrorMaterial );
	mirrorMesh.position.z = - OFFSET;

	mirror = new THREE.Object3D();
	mirror.name = "Mirror";
	mirror.add( mirrorSurface, mirrorMesh );

	mirror.rotation.y = Math.PI / 2;
	mirror.position.x = - ( DIMENSION.x / 2 - ( MIRRORDEPTH - OFFSET ) / 2 );

	mirrorSurface.castShadow = mirrorMesh.castShadow = true;

	room.add( mirror );

	// Add some miscellaenous objects

	// Add a cube with different colors on different faces

	let cubeGeo = new THREE.BoxGeometry( 5, 5, 5 );
	let cubeFaceColors = [ RED, GREEN, BLUE ];

	for ( let i = 0; i < cubeGeo.faces.length / 4; i ++ ) {

		let group = 4 * i;
		cubeGeo.faces[ group ].color = cubeGeo.faces[ group + 1 ].color = cubeGeo.faces[
			group + 2
		].color = cubeGeo.faces[ group + 3 ].color = cubeFaceColors[ i ];

	}

	cube = new THREE.Mesh(
		cubeGeo,
		new THREE.MeshStandardMaterial( {
			vertexColors: THREE.FaceColors
		} )
	);
	cube.position.set( - 12, - 7.5, 7 );

	// Add a torus that sits on the cube

	torus = new THREE.Mesh(
		new THREE.TorusBufferGeometry( 3, 1.2, 100, 6 ),
		new THREE.MeshStandardMaterial( {
			roughness: 0.5,
			metalness: 0,
			color: 0xff8a65
		} )
	);
	torus.position.set( - 11.3, - 1.43, 7 );
	torus.rotation.set(
		THREE.Math.degToRad( 18.42 ),
		THREE.Math.degToRad( - 35.62 ),
		THREE.Math.degToRad( - 108.92 )
	);

	// Add a cylinder

	stand = new THREE.Mesh(
		new THREE.CylinderBufferGeometry( 2, 2, 7, 50, 50 ),
		new THREE.MeshStandardMaterial( {
			color: 0xffffff,
			roughness: 0.8,
			metalness: 0.2
		} )
	);
	stand.position.set( 12, - 6.5, 7.5 );

	// Add a model of the Earth
	// This includes the surface and the atmosphere

	textureLoader.setPath( "../../assets/textures/earth/" );

	planet = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 2, 50, 50 ),
		new THREE.MeshPhongMaterial( {
			specular: 0x333333,
			shininess: 15,
			map: textureLoader.load( "earth_atmos_2048.jpg" ),
			specularMap: textureLoader.load( "earth_specular_2048.jpg" ),
			normalMap: textureLoader.load( "earth_normal_2048.jpg" ),
			normalScale: new THREE.Vector2( 0.85, 0.85 )
		} )
	);
	clouds = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 2, 50, 50 ),
		new THREE.MeshLambertMaterial( {
			map: textureLoader.load( "earth_clouds_1024.png" ),
			transparent: true
		} )
	);

	clouds.scale.set( 1.005, 1.005, 1.005 );

	earth = new THREE.Group();
	earth.add( planet, clouds );
	earth.position.set( 12, - 1.5, 7.5 );
	earth.rotation.z = 0.41;

	// Shadows for the misc objects

	cube.castShadow = torus.castShadow = stand.castShadow = planet.castShadow = clouds.castShadow = true;
	cube.receiveShadow = torus.receiveShadow = stand.receiveShadow = true;

	room.add( cube, torus, stand, earth );

	// Add the donuts

	modelLoader = new GLTFLoader();
	modelLoader.setPath( "models/" );

	modelLoader.load( "mint-donut-with-cream-and-sprinkles.glb", function ( gltf ) {

		donut01 = gltf.scene.children[ 0 ];
		donut01.scale.set( 20, 20, 20 );
		donut01.position.set( - 1, 0, - 13 );

		room.add( donut01 );

	} );

	modelLoader.load( "white-dough-with-chocolate-cream.glb", function ( gltf ) {

		donut02 = gltf.scene.children[ 0 ];
		donut02.scale.set( 10, 10, 10 );
		donut02.position.set( - 8, - 7, - 12 );

		room.add( donut02 );

	} );

	modelLoader.load( "strawberry-donut-with-hearts.glb", function ( gltf ) {

		donut03 = gltf.scene.children[ 0 ];
		donut03.scale.set( 7, 7, 7 );
		donut03.position.set( - 12, - 2, - 10 );

		room.add( donut03 );

	} );

	modelLoader.load( "chocolate-donut-with-colorful-candies.glb", function ( gltf ) {

		donut04 = gltf.scene.children[ 0 ];
		donut04.scale.set( 13, 13, 13 );
		donut04.position.set( - 11, 4, - 13 );

		room.add( donut04 );

	} );

	modelLoader.load( "white-donut-with-colorful-sprinkles.glb", function ( gltf ) {

		donut05 = gltf.scene.children[ 0 ];
		donut05.scale.set( 12, 12, 12 );
		donut05.position.set( 9, - 6, - 12 );

		room.add( donut05 );

	} );

	modelLoader.load( "taro-and-mint-flavored-donut.glb", function ( gltf ) {

		donut06 = gltf.scene.children[ 0 ];
		donut06.scale.set( 8, 8, 8 );
		donut06.position.set( 11, 1, - 11 );

		room.add( donut06 );

	} );

	modelLoader.load( "pink-donut-with-white-cream.glb", function ( gltf ) {

		donut07 = gltf.scene.children[ 0 ];
		donut07.scale.set( 8, 8, 8 );
		donut07.position.set( 8, 6, - 12 );

		room.add( donut07 );

	} );

	// Lighting

	ambient = new THREE.AmbientLight( NORMALROOMAMBIENT );

	let bulbGeometry = new THREE.SphereBufferGeometry( 1, 50, 50 );
	bulbMaterial = new THREE.MeshStandardMaterial( {
		emissive: 0xffffff,
		emissiveIntensity: 1,
		color: 0x000000
	} );

	bulb = new THREE.Mesh( bulbGeometry, bulbMaterial );
	bulb.name = "Light bulb";

	point = new THREE.PointLight( 0xffffff, POINTLIGHTINTENSITY, 40, 1 );
	point.add( bulb );
	point.castShadow = true;
	point.shadow.mapSize.width = point.shadow.mapSize.height = 2048;
	point.position.y = 8;
	point.userData = { isOn: true };

	room.add( ambient, point );

	// Raycasting setup

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Event listeners

	window.addEventListener( "mousemove", onMouseMove, false );
	window.addEventListener( "mousedown", onMouseClick, false );
	document.body.addEventListener( "keypress", onKeyPress, false );

	console.log( "Debugging mode: " + ( debugging ? "ON" : "OFF" ) );

}

function switchLight() {

	point.userData.isOn = ! point.userData.isOn;
	let isLightOn = point.userData.isOn;

	// Change the light's intensity

	point.intensity = isLightOn ? POINTLIGHTINTENSITY : 0;
	bulbMaterial.emissiveIntensity = isLightOn ? 1 : 0.25;

	// Change the color of the button and its light

	buttonLight.color = isLightOn ? GREEN : RED;
	buttonMaterial.setValues( {
		emissive: buttonLight.color
	} );

	// If the room's door is opened, change the room's ambient

	if ( ! doorWithKnobs.userData.isClosed )
		ambient.color = isLightOn ? NORMALROOMAMBIENT : OUTSIDELIGHTEDAMBIENT;

}

function onKeyPress( event ) {

	// Switching camera for debugging purposes

	switch ( event.code ) {

		case "KeyC":
			if ( debugging ) {

				camera = camera == first ? third : first;
				firstView.visible = camera == third;
				canvasHelper.bind( camera, renderer );

			}
			break;
		case "KeyD":
			debugging = ! debugging;
			if ( ! debugging && camera == third ) {

				camera = first;
				firstView.visible = false;
				canvasHelper.bind( camera, renderer );

			}

			console.log( "Debugging mode: " + ( debugging ? "ON" : "OFF" ) );
			break;
		default:
			event.preventDefault();

	}

}

function animate() {

	earth.rotation.y += 0.01;
	earth.position.y = Math.cos( time ) + 0.5;

}

function onMouseMove( event ) {

	let canvasRect = canvas.getBoundingClientRect();
	mouse.x = ( ( event.clientX - canvasRect.left ) / canvas.clientWidth ) * 2 - 1;
	mouse.y = - ( ( event.clientY - canvasRect.top ) / canvas.clientHeight ) * 2 + 1;

}

function onMouseClick() {

	raycast();

}

function raycast() {

	raycaster.setFromCamera( mouse, camera );
	intersects = raycaster.intersectObjects( scene.children, true ).filter(
		( intersect ) => intersect.object.visible
	);

	if ( intersects[ 0 ] ) {

		switch ( intersects[ 0 ].object.name ) {

			case "Light bulb":
			case "Button":
				switchLight();
				break;
			case "Door knob":
				doorWithKnobs.userData.isClosed = ! doorWithKnobs.userData.isClosed;
				if ( doorWithKnobs.userData.isClosed ) {

					doorWithKnobs.position.x = 0;
					doorWithKnobs.position.z = DIMENSION.z / 2;
					doorWithKnobs.rotation.y = 0;
					ambient.color = NORMALROOMAMBIENT;

				} else {

					doorWithKnobs.position.x = - ( DOORWIDTH / 2 );
					doorWithKnobs.position.z = DIMENSION.z / 2 - DOORWIDTH / 2;
					doorWithKnobs.rotation.y = Math.PI / 2;
					ambient.color = point.userData.isOn
						? NORMALROOMAMBIENT
						: OUTSIDELIGHTEDAMBIENT;

				}

		}

	}

}

function render( event ) {

	requestAnimationFrame( render );

	canvasHelper.update();

	time = event * 0.001;
	animate();

	if ( camera == first ) {

		fly.update( clock.getDelta() );
		firstView.update();

	} else {

		orbit.update();

	}

	renderer.render( scene, camera );

}
