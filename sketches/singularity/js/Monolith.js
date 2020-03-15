import * as THREE from '../../../three.js/build/three.module.js';

class Monolith {

	constructor( x, y, z, width, height, depth, color, physics = false ) {

		this.position = { x, y, z };
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.color = color;
		this.physicallyCorrect = physics;

		this.build( physics );

	}

	clone() {

		return new Monolith(
			this.position.x,
			this.position.y,
			this.position.z,
			this.width,
			this.height,
			this.depth,
			this.color,
			this.physicallyCorrect
		);

	}

	build( physics = false ) {

		let geometry, material;

		geometry = new THREE.BoxBufferGeometry(
			this.width,
			this.height,
			this.depth
		);

		material = new THREE.MeshStandardMaterial( {
			metalness: 0.5,
			roughness: 0.5,
			color: this.color
		} );

		this.mesh = new THREE.Mesh( geometry, material );
		this.mesh.position.set( this.position.x, this.position.y, this.position.z );

		if ( physics ) {

			this.mesh.castShadow = this.mesh.receiveShadow = true;

		}

	}

	hasCollidedWith( monolith ) {

		return Math.abs( this.position.x - monolith.position.x ) < this.width / 2 + monolith.width / 2
			&& Math.abs( this.position.y - monolith.position.y ) < this.height / 2 + monolith.height / 2
			&& Math.abs( this.position.z - monolith.position.z ) < this.depth / 2 + monolith.depth / 2;

	}

}

export { Monolith };
