import * as THREE from '../../../../three.js/build/three.module.js';

class Particles {

	constructor( quantity, size, color ) {

		this.quantity = quantity;
		this.size = size;
		this.color = color;

		this.points = null;
		this.particlesToDelete = [];

	}

	build( innerBound, outerBound ) {

		let geometry = new THREE.Geometry();
		let material = new THREE.PointsMaterial( {
			color: this.color,
			size: this.size
		} );


		for ( let i = 0; i < this.quantity; i ++ ) {

			let newParticle = new THREE.Vector3(
				Math.random() * ( outerBound - innerBound ) + innerBound,
				Math.random() * ( outerBound - innerBound ) + innerBound,
				Math.random() * ( outerBound - innerBound ) + innerBound,
			);

			geometry.vertices.push( newParticle );

		}

		geometry.verticesNeedUpdate = true;

		this.points = new THREE.Points( geometry, material );

	}

	animate( time, multiplier ) {

		this.points.rotation.y = Math.sin( time * multiplier );
		this.points.rotation.z = Math.cos( time * multiplier );

	}

}

export { Particles };
