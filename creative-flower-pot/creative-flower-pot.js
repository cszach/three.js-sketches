var scene, camera, renderer, controls; // Scene, camera, renderer, and controls
var groundGeometry, groundMaterial, ground; // Ground
var pot, potGeometry, potMaterial, transparentMaterial, potMaterials; // Pot
var boxFlower,
	cylinderFlower,
	dodecahedronFlower,
	icosahedronFlower,
	octahedronFlower,
	sphereFlower,
	torusFlower,
	torusKnotFlower,
	flowerMaterial,
	stemMaterial; // Geometries & materials for the flower and the stem
var flowerPot; // Pot + Flowers + Stems (Object3D)
var POTCENTER, FLOWERPOTCENTER, flowerPotCenter; // Centers
var ambient, key, fill, back; // Lights
var keyHelper, fillHelper, backHelper;
var time; // Animation

var aspect = window.innerWidth / window.innerHeight;
var canvas = document.createElement( "canvas" );
var context = canvas.getContext( "webgl2", { alpha: false } );

var floatMemory; // Helper for randomFloat (implemented below)

/**
 * Return a random float in a given range defined by the minumum and maximum
 * values
 *
 * @param {float} min The smallest possible float to generate (inclusive)
 * @param {float} max The biggest possible float to generate (inclusive)
 * @param {boolean} force Set to true if having a different return value from
 * the previous one is desired, the amount of difference is determined by the
 * difference parameter
 * @param {float} difference Minumum difference between this call's return value
 * and the previous one, must be 0 or a positive float
 * @return {float} A random float that is no more higher than max and no more
 * smaller than min
 */
function randomFloat( min, max, force = true, difference = 1 ) {

	let result = ( Math.random() * ( max - min ) + min ).toFixed( 5 );

	while ( force && Math.abs( result - floatMemory ) < difference ) {

		randomFloat( min, max, force, difference );

	}

	return result;

}

/**
 * Replace every value in this Vector3 with its absolute value.
 */
THREE.Vector3.prototype.abs = function () {

	return new THREE.Vector3(
		Math.abs( this.x ),
		Math.abs( this.y ),
		Math.abs( this.z )
	);

};

/**
 * Object3D's extension: Get the coordinate of the center of the object
 * Returns a Vector3
 */
THREE.Object3D.prototype.getCenter = function () {

	return new THREE.Box3().setFromObject( this ).getCenter();

};

/**
 * Class for creating flowers (including stems)
 *
 * @param {Geometry,BufferGeometry} geometry The geometry for the flower (required)
 * @param {number} flowerColor The color of the flower (default to random)
 * @param {number} stemColor The color of the stem (default to random)
 * @param {THREE.Vector3} position The position of the flower (excluding the stem) (default to random)
 * @param {THREE.Euler} rotation Flower's rotation (excluding the stem) (default to random)
 * @param {boolean} animation Enable animation (default to true)
 * @param {float} animationSpeed The speed of the animation (default to 1)
 */
function Flower(
	geometry,
	flowerColor = Math.random() * 0xffffff,
	stemColor = Math.random() * 0xffffff,
	position = new THREE.Vector3(
		randomFloat( - 3, 3 ),
		randomFloat( 4, 7.5 ),
		randomFloat( - 3, 3 )
	),
	rotation = new THREE.Euler(
		randomFloat( 0, Math.PI ),
		randomFloat( 0, Math.PI ),
		randomFloat( 0, Math.PI )
	),
	animation = true,
	animationSpeed = 1
) {

	THREE.Object3D.apply( this, arguments );

	this.name = "Flower";

	let flower, stemCurve, stemGeometry, stem;

	flower = new THREE.Mesh( geometry, flowerMaterial.clone() );

	flower.material.color.set( flowerColor );
	flower.position.copy( position.clone() );
	flower.rotation.copy( rotation.clone() );
	flower.castShadow = true;
	// flower.receiveShadow = true;

	this.add( flower );

	// FLOWERCENTER: The flower's center (variable: flower).
	// POTCENTER: The pot's center (variable: pot).
	// MIDDLE: The middle control point for the quadractic bezier curve that
	// serves as the stem.

	let FLOWERCENTER = flower.getCenter();
	POTCENTER = pot.getCenter();
	let MIDDLE = new THREE.Vector3(
		FLOWERCENTER.x * 0.2,
		( FLOWERCENTER.y + POTCENTER.y ) / 1.2,
		FLOWERCENTER.z * 0.2
	);

	stemCurve = new THREE.QuadraticBezierCurve3( FLOWERCENTER, MIDDLE, POTCENTER );
	stemGeometry = new THREE.TubeBufferGeometry(
		stemCurve.clone(),
		50,
		0.1,
		50,
		false
	);

	stem = new THREE.Mesh( stemGeometry, stemMaterial );

	stem.material.color.set( stemColor );
	stem.castShadow = true;
	// stem.receiveShadow = true;

	this.add( stem );

	this.animation = animation;
	this.animationSpeed = animationSpeed;

}

Flower.prototype = Object.create( THREE.Object3D.prototype );
Flower.prototype.constructor = Flower;

if ( WEBGL.isWebGL2Available() ) {

	init();
	render();

} else {

	document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

function init() {

	// Set up the scene, the camera, the renderer, and the controls

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer( {
		canvas: canvas,
		context: context,
		antialias: true
	} );
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	scene.background = new THREE.Color( 0xaaaaaa );
	camera.position.y = 5;
	camera.position.z = 10;
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.needsUpdate = true;
	// renderer.gammaInput = true;
	// renderer.gammaOutput = true;
	controls.enablePan = false;
	controls.minDistance = 5;
	controls.maxDistance = 30;
	controls.maxPolarAngle = Math.PI / 2;
	controls.enableDamping = true;
	controls.dampingFactor = 0.1;
	// controls.autoRotate = true;
	controls.autoRotateSpeed = 3;
	controls.target = new THREE.Vector3( 0, 0, 0 );

	document.body.appendChild( renderer.domElement );

	// Create a circle ground

	groundGeometry = new THREE.CircleBufferGeometry( 15, 50 );
	groundMaterial = new THREE.MeshLambertMaterial( {
		color: 0x26a69a,
		side: THREE.DoubleSide
	} );
	ground = new THREE.Mesh( groundGeometry, groundMaterial );

	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;

	scene.add( ground );

	// Initialize flowerPot

	flowerPot = new THREE.Object3D();
	flowerPot.name = "Flower pot";

	// Create the pot

	potGeometry = new THREE.IcosahedronGeometry( 2 );
	potMaterial = new THREE.MeshPhysicalMaterial( {
		color: 0xffffff,
		emissive: 0x000000,
		roughness: 0.05,
		metalness: 0.65,
		reflectivity: 0.2,
		side: THREE.DoubleSide
	} );
	transparentMaterial = new THREE.MeshStandardMaterial( {
		transparent: true,
		opacity: 0
	} );
	potMaterials = [ potMaterial, transparentMaterial ];

	potMaterial.vertexColors = THREE.FaceColors;

	pot = new THREE.Mesh( potGeometry, potMaterials );

	pot.position.y = 1.6;
	pot.scale.x = 1.5;
	pot.rotation.x = THREE.Math.degToRad( 20.9 );
	pot.castShadow = true;
	// pot.receiveShadow = true;

	potGeometry.faces[ 2 ].materialIndex = 1;

	flowerPot.add( pot );

	// Create the geometries and materials necessary to create flowers. Flowers
	// should be created in interactivity.js.

	boxFlower = new THREE.BoxBufferGeometry( 0.85, 0.85, 0.85 );
	cylinderFlower = new THREE.CylinderBufferGeometry( 0.5, 0.5, 1.5, 50, 10 );
	dodecahedronFlower = new THREE.DodecahedronBufferGeometry( 0.85 );
	icosahedronFlower = new THREE.IcosahedronBufferGeometry( 0.85 );
	octahedronFlower = new THREE.OctahedronBufferGeometry( 0.85 );
	sphereFlower = new THREE.SphereBufferGeometry( 0.75, 50, 50 );
	torusFlower = new THREE.TorusBufferGeometry( 0.75, 0.2, 50, 4 );
	torusKnotFlower = new THREE.TorusKnotBufferGeometry( 0.5, 0.2, 120, 100 );

	flowerMaterial = new THREE.MeshLambertMaterial();
	stemMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );

	// Add the flower pot and an Object3D at its center to the scene
	// flowerPotCenter - the Object3D at the flower pot's center - will be
	// repositioned in the render function

	flowerPotCenter = new THREE.Object3D();
	scene.add( flowerPot, flowerPotCenter );

	// Lighting system (three-point)

	let keyOffset = Math.PI / 3;
	let fillOffset = ( 2 * Math.PI ) / 3;
	let backOffset = - Math.PI / 2;

	ambient = new THREE.AmbientLight( 0x333333 );
	key = new THREE.SpotLight( 0xffffff, 0.8, 0, Math.PI / 6, 0.2, 1 );
	fill = new THREE.SpotLight( 0xffffff, 0.6, 0, Math.PI / 6, 0.2, 1 );
	back = new THREE.SpotLight( 0xffffff, 0.4, 0, Math.PI / 6, 0.2, 1 );

	key.position.set( Math.cos( keyOffset ) * 15, 8, Math.sin( keyOffset ) * 15 );
	fill.position.set( Math.cos( fillOffset ) * 20, 8, Math.sin( fillOffset ) * 20 );
	back.position.set( Math.cos( backOffset ) * 7, 15, Math.sin( backOffset ) * 7 );

	key.castShadow = true; // 3 lights but only the key light casts shadows
	key.shadow.mapSize = new THREE.Vector2( 4096, 4096 );

	scene.add( ambient, key, fill, back );

	// Lights' helpers

	keyHelper = new THREE.SpotLightHelper( key );
	fillHelper = new THREE.SpotLightHelper( fill );
	backHelper = new THREE.SpotLightHelper( back );

	// scene.add( keyHelper, fillHelper, backHelper );

	// Event listeners

	window.addEventListener( "resize", onWindowResize );

}

function onWindowResize() {

	aspect = window.innerWidth / window.innerHeight;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {}

function render( event ) {

	requestAnimationFrame( render );

	time = event * 0.001;

	// Compute the center of the flower pot

	FLOWERPOTCENTER = flowerPot.getCenter(); // Vector3
	flowerPotCenter.position.set( ...FLOWERPOTCENTER.toArray() );

	key.target = fill.target = back.target = flowerPotCenter;
	controls.target.y = FLOWERPOTCENTER.y;

	// Animate things

	animate();

	// Update things

	keyHelper.update();
	fillHelper.update();
	backHelper.update();
	controls.update();

	renderer.render( scene, camera );

}
