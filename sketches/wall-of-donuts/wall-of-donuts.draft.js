/**
 * Wall of Donuts
 *
 * A room with donuts sticked on one wall and has some misc objects in it
 * (because why not?). This sketch also contains interaction.
 *
 * The single most important variable used in this sketch that affects the
 * position and dimension of various meshes is 'ROOMDIMENSION' (see section
 * 'Constants' below). The chart below shows in details how other meshes are
 * affected by this variable. ('o' means affected, 'x' means unaffected)
 *
 * /------------------------------------------------------------\
 * |        Mesh        |    Variable    | Dimension | Position |
 * |------------------------------------------------------------|
 * |        Room        |      room      |     o     |     x    |
 * |       Mirror       |     mirror     |     o     |     o    |
 * |  Door & Door knobs |  doorWithKnobs |     o     |     o    |
 * |    Light switch    |   buttonLight  |     o     |     o    |
 * |     Point light    |      point     |     x     |     o    |
 * |        Cube        |      cube      |     x     |     o    |
 * |        Torus       |      torus     |     x     |     x    |
 * |        Stand       |      stand     |     x     |     x    |
 * |   Model of Earth   |      earth     |     x     |     x    |
 * |       Donuts       |     donut*     |     o     |     x    |
 * \------------------------------------------------------------/
 *
 * Attributes of any mesh that are unaffected by ROOMDIMENSION have to be
 * assigned values for manually. Also, cameras' positions are affected.
 *
 * Another feature of this sketch is that it implements physically-corrected
 * lighting. For this, the measurements for distance and light power use certain
 * units: meters for distance, lumens for light power. There are 3 light sources
 * in this sketch:
 *   o The light bulb on the ceilling
 *   o The light switch next to the door
 *   o The (virtual) light from the environment outside the door when the door
 *     is opened
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

// Everything inside the scene + variables used for raycasting, animation,
// and loaders

var scene, camera, first, third, renderer, fly, orbit;
var room; // Room
var mirror, mirrorSurface, mirrorMesh; // Mirror
var door, doorKnob01, doorKnob02, doorWithKnobs, doorView, externalLight; // Room's door
var button, buttonLight; // Light switch
var cube, torus, stand, earth, planet, clouds; // Miscellaenous objects
var point, bulb; // Lights
var donut01, donut02, donut03, donut04, donut05, donut06, donut07; // Donuts
var buttonMaterial, bulbMaterial; // Materials that are not static
var raycaster, mouse, intersects; // Raycasting
var textureLoader, modelLoader; // Loaders
var firstView; // Helpers
var time, clock; // Animation
var debugging = true; // Is debugging?

// Variables used by the camera and the renderer

var aspect = window.innerWidth / window.innerHeight;
var canvas = document.createElement( "canvas" );
var context = canvas.getContext( "webgl2", { alpha: false } );

// Constants
// Notes:
//   o Distance is measured in meters
//   o Light power is measured in lumens

var RED = new THREE.Color( 0xff0000 );
var GREEN = new THREE.Color( 0x00ff00 );
var BLUE = new THREE.Color( 0x0000ff );
var OFFSET = 0.001; // The amount of translation used to avoid z-fighting
var ROOMDIMENSION = new THREE.Vector3( 5, 3, 3 ); // The dimension of the room
var DOORDIMENSION = new THREE.Vector3(
	ROOMDIMENSION.x * 0.3,
	ROOMDIMENSION.y * 0.75,
	ROOMDIMENSION.z / 80
); // The dimension of the room's door
var PERSONHEIGHT = 1.7; // The height of the first person view if the ground is at 0
var pointLightPower = 850; // The power of the room's point light when it is on
var externalLightIntensity = 100;

/**
 * A class that represents a room made up of four walls, a floor and a ceilling
 *
 * @param {Vector3} dimension The dimension of the room, determined by a
 * THREE.Vector3, where the y value determines the height of the room
 * @param {Material} wallMaterial The material for the walls
 * @param {Material} floorMaterial The material for the floor
 * @param {Material} ceilingMaterial The material for the ceiling
 */
function Room( dimension, wallMaterial, floorMaterial, ceilingMaterial ) {

	THREE.Group.apply( this, arguments );

	let front, back, left, right; // Walls
	let floor, ceiling;

	front = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.y ),
		wallMaterial
	);
	back = front.clone();
	left = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.z, dimension.y ),
		wallMaterial
	);
	right = left.clone();

	front.position.set( 0, 0, - dimension.z / 2 );
	back.position.set( 0, 0, dimension.z / 2 );
	left.position.set( - dimension.x / 2, 0, 0 );
	right.position.set( dimension.x / 2, 0, 0 );

	back.rotation.x = Math.PI;
	left.rotation.y = Math.PI / 2;
	right.rotation.y = - Math.PI / 2;

	floor = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.z ),
		floorMaterial
	);
	ceiling = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.z ),
		ceilingMaterial
	);

	floor.position.y = - dimension.y / 2;
	ceiling.position.y = dimension.y / 2;

	floor.rotation.x = - Math.PI / 2;
	ceiling.rotation.x = Math.PI / 2;

	front.receiveShadow = back.receiveShadow = left.receiveShadow = right.receiveShadow = floor.receiveShadow = ceiling.receiveShadow = true;

	this.add( front, back, left, right, floor, ceiling );

}

Room.prototype = Object.create( THREE.Group.prototype );
Room.prototype.constructor = Room;

if ( THREE.WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( THREE.WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// SCENE, CAMERA, RENDERER, CLOCK, CONTROLS

	scene = new THREE.Scene();
	first = new THREE.PerspectiveCamera( 75, aspect, 0.001, 1000 );
	firstView = new THREE.CameraHelper( first );
	third = new THREE.PerspectiveCamera( 75, aspect, 0.001 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	clock = new THREE.Clock();
	fly = new THREE.FlyControls( first, renderer.domElement );
	orbit = new THREE.OrbitControls( third, renderer.domElement );

	firstView.name = "CameraHelper";
	first.position.set(
		0,
		PERSONHEIGHT - ROOMDIMENSION.y / 2,
		ROOMDIMENSION.z * 0.3
	);
	firstView.update();
	firstView.visible = debugging;
	third.position.set( 0, ROOMDIMENSION.y * 1.5, ROOMDIMENSION.z * 1.5 );
	camera = debugging ? third : first;
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );
	fly.movementSpeed = 100;
	fly.rollSpeed = Math.PI / 48;
	fly.setMouseMoveOnly();
	orbit.autoRotate = true;

	document.body.appendChild( renderer.domElement );
	scene.add( firstView );

	// ROOM

	textureLoader = new THREE.TextureLoader();

	let wallMaterial = new THREE.MeshStandardMaterial( {
		roughness: 0.8,
		metalness: 0.2,
		color: 0x9d1b3a
	} );
	let floorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xeeeeee,
		roughness: 0.8,
		metalness: 0.2
	} );
	let ceilingMaterial = wallMaterial.clone();

	room = new Room( ROOMDIMENSION, wallMaterial, floorMaterial, ceilingMaterial );
	room.name = "Room";

	scene.add( room );

	// DOOR

	let doorGeometry = new THREE.BoxBufferGeometry(
		DOORDIMENSION.x,
		DOORDIMENSION.y,
		DOORDIMENSION.z
	);
	let doorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xfb8c00,
		roughness: 0.8,
		metalness: 0.3
	} );

	door = new THREE.Mesh( doorGeometry, doorMaterial );

	let doorKnobGeometry = new THREE.SphereBufferGeometry( DOORDIMENSION.x / 20, 45, 45 );
	let doorKnobMaterial = new THREE.MeshStandardMaterial( {
		color: 0xffeb3b,
		roughness: 0.8,
		metalness: 0.5
	} );

	doorKnob01 = new THREE.Mesh( doorKnobGeometry, doorKnobMaterial );
	doorKnob02 = doorKnob01.clone();

	doorKnob01.position.x = doorKnob02.position.x = DOORDIMENSION.x / 3;
	doorKnob01.position.z = DOORDIMENSION.z * 1.5;
	doorKnob02.position.z = - DOORDIMENSION.z * 1.5;
	doorKnob01.name = doorKnob02.name = "Door knob";

	doorWithKnobs = new THREE.Object3D();
	doorWithKnobs.name = "Door";
	doorWithKnobs.add( door, doorKnob01, doorKnob02 );

	doorWithKnobs.position.z = ROOMDIMENSION.z / 2;
	doorWithKnobs.position.y = DOORDIMENSION.y / 2 - ROOMDIMENSION.y / 2;
	doorWithKnobs.userData = { isClosed: true };

	room.add( doorWithKnobs );

	// DOORVIEW

	textureLoader.setPath( "textures/" );

	let doorViewImage = textureLoader.load( "doorview.png" );
	doorViewImage.encoding = THREE.sRGBEncoding;
	let doorViewGeometry = new THREE.PlaneBufferGeometry(
		DOORDIMENSION.x,
		DOORDIMENSION.y
	);
	let doorViewMaterial = new THREE.MeshMatcapMaterial( {
		map: doorViewImage,
		side: THREE.BackSide
	} );

	doorView = new THREE.Mesh( doorViewGeometry, doorViewMaterial );

	THREE.RectAreaLightUniformsLib.init();

	externalLight = new THREE.RectAreaLight(
		0xffffff,
		0,
		DOORDIMENSION.x,
		DOORDIMENSION.y
	);
	externalLight.add( doorView );

	externalLight.lookAt( 0, 0, 0 );
	externalLight.position.set(
		doorWithKnobs.position.x,
		doorWithKnobs.position.y,
		doorWithKnobs.position.z - OFFSET
	);

	room.add( externalLight );

	// LIGHT SWITCH

	let SWITCHDEPTH = DOORDIMENSION.z * 0.3;

	let buttonGeometry = new THREE.BoxBufferGeometry(
		DOORDIMENSION.x * 0.06,
		DOORDIMENSION.y * 0.06,
		SWITCHDEPTH
	);
	buttonMaterial = new THREE.MeshStandardMaterial( {
		color: 0x000000,
		emissive: 0x00ff00,
		emissiveIntensity: 0.8
	} );

	button = new THREE.Mesh( buttonGeometry, buttonMaterial );
	button.name = "Button";

	buttonLight = new THREE.PointLight( 0x00ff00, 1, 0, 2 );
	buttonLight.power = 2;
	buttonLight.distance = Infinity;
	buttonLight.add( button );
	buttonLight.position.set(
		DOORDIMENSION.x / 2 + DOORDIMENSION.x / 6,
		ROOMDIMENSION.y / 2 - ( DOORDIMENSION.y * 2 ) / 3,
		ROOMDIMENSION.z / 2 - SWITCHDEPTH / 2
	);

	room.add( buttonLight );

	// MIRROR

	let MIRRORWIDTH = ROOMDIMENSION.z * 0.9;
	let MIRRORHEIGHT = ROOMDIMENSION.y * 0.9;
	let MIRRORDEPTH = ROOMDIMENSION.x / 240;

	let mirrorSurfaceGeometry = new THREE.PlaneBufferGeometry(
		MIRRORWIDTH,
		MIRRORHEIGHT
	);

	mirrorSurface = new THREE.Reflector( mirrorSurfaceGeometry, {
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerWidth * window.devicePixelRatio,
		recursion: 1
	} );
	mirrorSurface.position.z = MIRRORDEPTH / 2;

	let mirrorGeometry = new THREE.BoxBufferGeometry(
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
	mirror.position.x = - ( ROOMDIMENSION.x / 2 - ( MIRRORDEPTH - OFFSET ) / 2 );

	room.add( mirror );

	// MISC MESHES

	// Add a cube with different colors on different faces

	let CUBEDIMENSION = 0.75;
	let cubeGeo = new THREE.BoxGeometry(
		CUBEDIMENSION,
		CUBEDIMENSION,
		CUBEDIMENSION
	);
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
	cube.position.set(
		- (
			ROOMDIMENSION.x / 2 -
			ROOMDIMENSION.x * 0.02 -
			CUBEDIMENSION / 2 -
			MIRRORDEPTH
		),
		CUBEDIMENSION / 2 - ROOMDIMENSION.y / 2,
		ROOMDIMENSION.z / 2 - ROOMDIMENSION.x * 0.02 - CUBEDIMENSION / 2
	);

	// Add a torus that sits on the cube

	torus = new THREE.Mesh(
		new THREE.TorusBufferGeometry( 0.4, 0.16, 100, 6 ),
		new THREE.MeshStandardMaterial( {
			roughness: 0.5,
			metalness: 0,
			color: 0xff8a65
		} )
	);
	torus.position.set( - 2.05, - 0.28, 1.05 );
	torus.rotation.set(
		THREE.Math.degToRad( 20 ),
		THREE.Math.degToRad( - 45 ),
		THREE.Math.degToRad( 14.6 )
	);

	// Add a cylinder

	let STANDRADIUS = 0.25;
	let STANDHEIGHT = 1;
	let STANDOFFSET = 0.5;

	stand = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(
			STANDRADIUS,
			STANDRADIUS,
			STANDHEIGHT,
			50,
			1
		),
		new THREE.MeshStandardMaterial( {
			color: 0xffffff,
			roughness: 0.8,
			metalness: 0.2
		} )
	);
	stand.position.set(
		ROOMDIMENSION.x / 2 - STANDRADIUS - STANDRADIUS * STANDOFFSET,
		STANDHEIGHT / 2 - ROOMDIMENSION.y / 2,
		ROOMDIMENSION.z / 2 - STANDRADIUS - STANDRADIUS * STANDOFFSET
	);

	// Add a model of the Earth
	// This includes the surface and the atmosphere

	textureLoader.setPath( "../../assets/textures/earth/" );

	let EARTHRADIUS = 0.26;
	let map = textureLoader.load( "earth_atmos_2048.jpg" );
	let specularMap = textureLoader.load( "earth_specular_2048.jpg" );
	let normalMap = textureLoader.load( "earth_normal_2048.jpg" );
	let cloudsMap = textureLoader.load( "earth_clouds_1024.png" );

	map.encoding = specularMap.encoding = normalMap.encoding = cloudsMap.encoding =
		THREE.sRGBEncoding;

	planet = new THREE.Mesh(
		new THREE.SphereBufferGeometry( EARTHRADIUS, 50, 50 ),
		new THREE.MeshPhongMaterial( {
			specular: 0x333333,
			shininess: 15,
			map,
			specularMap,
			normalMap,
			normalScale: new THREE.Vector2( 0.85, 0.85 )
		} )
	);
	clouds = new THREE.Mesh(
		new THREE.SphereBufferGeometry( EARTHRADIUS, 50, 50 ),
		new THREE.MeshLambertMaterial( {
			map: cloudsMap,
			transparent: true
		} )
	);

	clouds.scale.set( 1.005, 1.005, 1.005 );

	earth = new THREE.Group();
	earth.add( planet, clouds );
	earth.position.copy( stand.position );
	earth.rotation.z = 0.41;

	room.add( cube, torus, stand, earth );

	// DONUTS

	// loadDonuts(); // Function defined below

	// LIGHTING

	let bulbGeometry = new THREE.SphereBufferGeometry( 0.1, 50, 50 );
	bulbMaterial = new THREE.MeshStandardMaterial( {
		emissive: 0xffffff,
		emissiveIntensity: 1,
		color: 0x000000
	} );

	bulb = new THREE.Mesh( bulbGeometry, bulbMaterial );
	bulb.name = "Light bulb";

	point = new THREE.PointLight( 0xffffff, 1, 0, 2 );
	point.power = pointLightPower;
	point.distance = Infinity;
	point.add( bulb );
	point.position.y = ROOMDIMENSION.y * 0.4;
	point.userData = { isOn: true };

	room.add( point );

	// SHADOWS

	// Door & door knobs

	door.castShadow = doorKnob01.castShadow = doorKnob02.castShadow = true;
	door.receiveShadow = doorKnob01.receiveShadow = doorKnob02.receiveShadow = true;

	// Mirror

	mirrorSurface.castShadow = mirrorMesh.castShadow = true;

	// Misc meshes

	cube.castShadow = torus.castShadow = stand.castShadow = planet.castShadow = clouds.castShadow = true;
	cube.receiveShadow = torus.receiveShadow = stand.receiveShadow = true;

	// Lights

	point.castShadow = true;
	point.shadow.mapSize.width = point.shadow.mapSize.height = 2048;

	// RAYCASTING

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// EVENT LISTENERS

	window.addEventListener( "resize", onWindowResize, false );
	window.addEventListener( "mousemove", onMouseMove, false );
	window.addEventListener( "mousedown", onMouseClick, false );
	document.body.addEventListener( "keypress", onKeyPress, false );

	// LOGS

	console.log( "Debugging mode: " + ( debugging ? "ON" : "OFF" ) );

}

function loadDonuts() {

	modelLoader = new THREE.GLTFLoader();
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

}

function switchLight() {

	point.userData.isOn = ! point.userData.isOn;
	let isLightOn = point.userData.isOn;

	// Change the light's intensity

	point.power = isLightOn ? pointLightPower : 0;
	bulbMaterial.emissiveIntensity = isLightOn ? 1 : 0.25;

	// Change the color of the button and its light

	buttonLight.color = isLightOn ? GREEN : RED;
	buttonMaterial.setValues( {
		emissive: buttonLight.color
	} );

}

function onWindowResize() {

	aspect = window.innerWidth / window.innerHeight;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onKeyPress( event ) {

	// Switching camera for debugging purposes

	switch ( event.code ) {

		case "KeyC":
			if ( debugging ) {

				camera = camera == first ? third : first;
				firstView.visible = camera == third;

			}
			break;
		case "KeyD":
			debugging = ! debugging;
			if ( ! debugging && camera == third ) {

				camera = first;
				firstView.visible = false;

			}

			console.log( "Debugging mode: " + ( debugging ? "ON" : "OFF" ) );
			break;
		default:
			event.preventDefault();

	}

}

function animate() {

	// Animate the model of Earth

	earth.rotation.y += 0.01;
	earth.position.y =
		stand.geometry.parameters.height -
		ROOMDIMENSION.y / 2 +
		planet.geometry.parameters.radius +
		0.05 +
		Math.pow( Math.sin( time ), 2 ) * stand.geometry.parameters.height * 0.2;

}

function onMouseMove( event ) {

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onMouseClick() {

	raycast();

}

function raycast() {

	raycaster.setFromCamera( mouse, camera );
	intersects = raycaster.intersectObjects( scene.children, true );

	let filteredIntersects = intersects.filter(
		object => object.object.name != "CameraHelper"
	);

	if ( filteredIntersects[ 0 ] ) {

		switch ( filteredIntersects[ 0 ].object.name ) {

			case "Light bulb":
			case "Button":
				switchLight();
				break;
			case "Door knob":
				doorWithKnobs.userData.isClosed = ! doorWithKnobs.userData.isClosed;

				if ( doorWithKnobs.userData.isClosed ) {

					doorWithKnobs.position.x = 0;
					doorWithKnobs.position.z = ROOMDIMENSION.z / 2;
					doorWithKnobs.rotation.y = 0;

					externalLight.intensity = 0;

				} else {

					doorWithKnobs.position.x = - ( DOORDIMENSION.x / 2 );
					doorWithKnobs.position.z = ROOMDIMENSION.z / 2 - DOORDIMENSION.x / 2;
					doorWithKnobs.rotation.y = Math.PI / 2;

					externalLight.intensity = externalLightIntensity;

				}

		}

	}

}

function render( event ) {

	requestAnimationFrame( render );

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
