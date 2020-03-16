import * as THREE from '../../../../three.js/build/three.module.js';
import { BLACK } from './../constants.js';

class Singularity {

	constructor( size, color, detailX, detailY, material, light ) {

		this.size = size;
		this.color = color;
		this.details = { x: detailX, y: detailY };
		this.material = material;
		this.light = light;
		this.emissive = material.emissive.clone();

		this.build();

	}

	build( material = this.material, light = this.light ) {

		// Build the mesh

		let geometry, mesh;

		geometry = new THREE.SphereBufferGeometry(
			this.size,
			this.details.x,
			this.details.y
		);

		mesh = new THREE.Mesh( geometry, material );

		light.name = "Light";
		mesh.add( light );
		mesh.geometry.computeBoundingBox();

		this.mesh = mesh;

	}

	toggleLight() {

		let light = this.mesh.getObjectByName( "Light" );
		let material = this.mesh.material;

		light.visible = ! light.visible;
		material.emissive = ( light.visible ) ? this.emissive.clone() : BLACK;

	}

}

export { Singularity };
