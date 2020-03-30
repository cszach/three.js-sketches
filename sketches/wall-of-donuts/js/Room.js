import * as THREE from "../../../three.js/build/three.module.js";

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

export { Room };
