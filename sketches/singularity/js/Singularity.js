import * as THREE from '../../../three.js/build/three.module.js';

class Singularity {

	constructor( size, color, detailX, detailY, power, physics = false ) {

		this.size = size;
		this.color = color;
		this.details = { x: detailX, y: detailY };
		this.power = power;

		this.build( physics );

	}

	build( physics = false ) {

		let light;
		let geometry, material, mesh;

		light = new THREE.PointLight(
			this.color,
			1,
			Infinity,
			( physics ) ? 2 : 1
		);

		light.power = this.power;

		geometry = new THREE.SphereBufferGeometry(
			this.size,
			this.details.x,
			this.details.y
		);

		material = new THREE.MeshStandardMaterial( {
			emissive: this.color,
			emissiveIntensity: light.intensity / Math.pow( 0.02, 2.0 ),
			color: 0x000000
		} );

		if ( physics ) {

			light.castShadow = true;
			light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

		}

		mesh = new THREE.Mesh( geometry, material );
		mesh.add( light );
		mesh.geometry.computeBoundingBox();

		this.mesh = mesh;

	}

}

export { Singularity };
