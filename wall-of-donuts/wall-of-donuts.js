var scene, camera, first, third, renderer, fly, orbit;
var room, dimension, wallMaterial, floorMaterial, ceilingMaterial; // The room
var mirrorSurfaceGeometry,
	mirrorSurface,
	mirrorGeometry,
	mirrorMaterial,
	mirrorMesh,
	mirror; // Mirror
var door,
	doorGeometry,
	doorMaterial,
	doorKnob01,
	doorKnob02,
	doorKnobGeometry,
	doorKnobMaterial,
	doorWithKnobs; // The room's door
var button, buttonGeometry, buttonMaterial, buttonLight; // Light switch
var cube, torus, stand, earth, planet, clouds; // Miscellaenous objects
var ambient, point, pointIntensity, bulb, bulbGeometry, bulbMaterial; // Lights
var raycaster, mouse, intersects; // Raycasting
var loader; // Loaders
var firstView; // Helpers
var time, clock; // Animation

var aspect = window.innerWidth / window.innerHeight;
var canvas = document.createElement( "canvas" );
var context = canvas.getContext( "webgl2", { alpha: false } );
var texturesUrl = "../assets/textures/";

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

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );

}

function init() {

	// Set up the scene, the camera, the renderer, and the controls

	scene = new THREE.Scene();
	first = new THREE.PerspectiveCamera( 50, aspect, 0.1, 100 );
	third = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );
	camera = third;
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	clock = new THREE.Clock();
	fly = new THREE.FlyControls( first, renderer.domElement );
	orbit = new THREE.OrbitControls( third, renderer.domElement );

	first.position.set( 0, 2, 3 );
	third.position.set( 0, 20, 15 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	fly.movementSpeed = 100;
	fly.rollSpeed = Math.PI / 48;
	fly.setMouseMoveOnly();
	orbit.autoRotate = true;

	document.body.appendChild( renderer.domElement );

	// Create the room

	loader = new THREE.TextureLoader();

	// let floorTexturesUrl = texturesUrl + "floor-02/";

	dimension = new THREE.Vector3( 30, 20, 20 );
	wallMaterial = new THREE.MeshPhongMaterial( {
		shininess: 20,
		color: 0x9d1b3a
	} );
	// floorMaterial = new THREE.MeshStandardMaterial( {
	// 	roughness: 1,
	// 	map: loader.load( floorTexturesUrl + "color.jpg" ),
	// 	// aoMap: loader.load( floorTexturesUrl + "ao.jpg" ),
	// 	// bumpMap: loader.load( floorTexturesUrl + "height.jpg" ),
	// 	normalMap: loader.load( floorTexturesUrl + "normal.jpg" ),
	// 	roughnessMap: loader.load( floorTexturesUrl + "roughness.jpg" )
	// } );
	floorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xeeeeee,
		roughness: 0.8,
		metalness: 0.2
	} );
	ceilingMaterial = wallMaterial.clone();

	room = new Room( dimension, wallMaterial, floorMaterial, ceilingMaterial );
	room.name = "Room";

	scene.add( room );

	// Add a door

	doorGeometry = new THREE.BoxGeometry( 9, 15, 0.25 );
	doorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xfb8c00,
		roughness: 0.8,
		metalness: 0.3
	} );
	door = new THREE.Mesh( doorGeometry, doorMaterial );

	doorKnobGeometry = new THREE.SphereGeometry( 0.45, 45, 45 );
	doorKnobMaterial = new THREE.MeshStandardMaterial( {
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

	doorWithKnobs.position.z = 10;
	doorWithKnobs.position.y = - 2.5;
	doorWithKnobs.userData = { isClosed: true };

	scene.add( doorWithKnobs );

	// Create a light switch

	buttonGeometry = new THREE.BoxGeometry( 0.6, 0.9, 0.1 );
	buttonMaterial = new THREE.MeshStandardMaterial( {
		color: 0x000000,
		emissive: 0xff0000,
		emissiveIntensity: 0.8
	} );
	button = new THREE.Mesh( buttonGeometry, buttonMaterial );
	button.name = "Button";

	buttonLight = new THREE.PointLight( 0xff0000, 0.3, 3 );
	buttonLight.add( button );
	buttonLight.position.set( 6, - 0.5, 9.95 );

	scene.add( buttonLight );

	// Add a mirror

	mirrorSurfaceGeometry = new THREE.PlaneBufferGeometry( 18, 18 );
	mirrorSurface = new THREE.Reflector( mirrorSurfaceGeometry, {
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerWidth * window.devicePixelRatio,
		recursion: 1
	} );

	mirrorSurface.position.z = 0.0635;

	mirrorGeometry = new THREE.BoxGeometry( 18, 18, 0.124 );
	mirrorMaterial = new THREE.MeshBasicMaterial( { color: 0x222222 } );
	mirrorMesh = new THREE.Mesh( mirrorGeometry, mirrorMaterial );

	mirrorMesh.position.z = - 0.001;

	mirror = new THREE.Object3D();
	mirror.name = "Mirror";
	mirror.add( mirrorSurface, mirrorMesh );

	mirror.rotation.y = Math.PI / 2;
	mirror.position.x = - 14.938;

	mirrorSurface.castShadow = mirrorMesh.castShadow = true;

	scene.add( mirror );

	// Add some miscellaenous objects

	// Add a cube with different colors on different faces

	let cubeGeo = new THREE.BoxGeometry( 5, 5, 5 );
	let cubeFaceColors = [
		new THREE.Color( 0xff0000 ),
		new THREE.Color( 0x00ff00 ),
		new THREE.Color( 0x0000ff )
	];

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

	planet = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 2, 50, 50 ),
		new THREE.MeshPhongMaterial( {
			specular: 0x333333,
			shininess: 15,
			map: loader.load( "../assets/textures/earth/earth_atmos_2048.jpg" ),
			specularMap: loader.load(
				"../assets/textures/earth/earth_specular_2048.jpg"
			),
			normalMap: loader.load( "../assets/textures/earth/earth_normal_2048.jpg" ),
			normalScale: new THREE.Vector2( 0.85, 0.85 )
		} )
	);
	clouds = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 2, 50, 50 ),
		new THREE.MeshLambertMaterial( {
			map: loader.load( "../assets/textures/earth/earth_clouds_1024.png" ),
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

	scene.add( cube, torus, stand, earth );

	// Lighting

	ambient = new THREE.AmbientLight( 0x333333 );

	bulbGeometry = new THREE.SphereBufferGeometry( 1, 50, 50 );
	bulbMaterial = new THREE.MeshStandardMaterial( {
		emissive: 0xffffff,
		emissiveIntensity: 1,
		color: 0x000000
	} );

	bulb = new THREE.Mesh( bulbGeometry, bulbMaterial );
	bulb.name = "Light bulb";

	pointIntensity = 1.75;
	point = new THREE.PointLight( 0xffffff, pointIntensity, 40, 1 );
	point.add( bulb );
	point.castShadow = true;
	point.shadow.mapSize.width = point.shadow.mapSize.height = 2048;
	point.position.y = 8;
	point.userData = { isOn: true };

	scene.add( ambient, point );

	// Helpers

	// firstView = new THREE.CameraHelper( first );
	// firstView.visible = camera == third;
	//
	// scene.add( firstView );

	// Raycasting setup

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Event listeners

	window.addEventListener( "resize", onWindowResize, false );
	window.addEventListener( "mousemove", onMouseMove, false );
	window.addEventListener( "mousedown", onMouseClick, false );
	document.body.addEventListener( "keypress", onKeyPress, false );

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
			camera = camera == first ? third : first;
			// firstView.visible = camera == third;
			break;

	}

}

function animate() {

	earth.rotation.y += 0.01;
	earth.position.y = Math.cos( time ) + 0.5;

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

	if ( intersects[ 0 ] ) {

		switch ( intersects[ 0 ].object.name ) {

			case "Light bulb":
				point.userData.isOn = ! point.userData.isOn;
				point.intensity = point.userData.isOn ? pointIntensity : 0;
				bulbMaterial.emissiveIntensity = point.userData.isOn ? 1 : 0.25;
				break;
			case "Door knob":
				doorWithKnobs.userData.isClosed = ! doorWithKnobs.userData.isClosed;
				if ( doorWithKnobs.userData.isClosed ) {

					doorWithKnobs.position.x = 0;
					doorWithKnobs.position.z = 10;
					doorWithKnobs.rotation.y = 0;

				} else {

					doorWithKnobs.position.x = - 4.5;
					doorWithKnobs.position.z = 5.5;
					doorWithKnobs.rotation.y = Math.PI / 2;

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

	} else {

		// firstView.update();
		orbit.update();

	}

	renderer.render( scene, camera );

}
