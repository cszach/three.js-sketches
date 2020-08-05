import * as THREE from "../../../three.js/build/three.module.js";

/**
 * A class that represents a room made up of four walls, a floor and a ceilling
 */
function Room( dimension, color ) {

	THREE.Group.apply( this, arguments );

	this.dimension = dimension;

	let material = new THREE.MeshPhysicalMaterial( {

		roughness: 0.5,
		metalness: 0.5,
		reflectivity: 0.5,
		color: color,

	} );

	let floor = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.z ),
		material
	);
	floor.position.y = - dimension.y / 2;
	floor.rotation.x = - Math.PI / 2;

	let front = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.y ),
		material
	);
	let back = front.clone();
	let left = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.z, dimension.y ),
		material
	);
	let right = left.clone();

	front.position.set( 0, 0, - dimension.z / 2 );
	back.position.set( 0, 0, dimension.z / 2 );
	left.position.set( - dimension.x / 2, 0, 0 );
	right.position.set( dimension.x / 2, 0, 0 );

	back.rotation.x = Math.PI;
	left.rotation.y = Math.PI / 2;
	right.rotation.y = - Math.PI / 2;

	let ceiling = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( dimension.x, dimension.z ),
		material
	);

	ceiling.position.y = dimension.y / 2;
	ceiling.rotation.x = Math.PI / 2;

	front.receiveShadow = back.receiveShadow = left.receiveShadow
	= right.receiveShadow = floor.receiveShadow = ceiling.receiveShadow = true;

	this.add( front, back, left, right, floor, ceiling );

}

Room.prototype = Object.create( THREE.Group.prototype );
Room.prototype.constructor = Room;

export { Room };
