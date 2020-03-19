import * as THREE from '../../../../three.js/build/three.module.js';
import { BLACK } from './../constants.js';

class Singularity {

	constructor( size, color, detailX, detailY, material, light, physics = false ) {

		this.size = size;
		this.color = color;
		this.details = { x: detailX, y: detailY };
		this.material = material;
		this.light = light;
		this.physicallyCorrect = physics;
		this.emissive = material.emissive.clone();

		this.build();

	}

	build( material = this.material, light = this.light, physics = this.physicallyCorrect ) {

		// Build the mesh

		let geometry, mesh;

		geometry = new THREE.SphereBufferGeometry(
			this.size,
			this.details.x,
			this.details.y
		);

		mesh = new THREE.Mesh( geometry, material );
		mesh.geometry.computeBoundingBox();

		this.light = light;
		this.mesh = mesh;

		this.light.name = "Light";
		this.mesh.name = "Mesh";

		this.group = new THREE.Group();
		this.group.add( this.mesh, this.light );

		if ( physics ) {

			this.mesh.castShadow = this.mesh.receiveShadow = true;
			this.group.castShadow = this.group.receiveShadow = true;

		}

	}

	toggleLight() {

		this.light.visible = ! this.light.visible;
		this.material.emissive = ( this.light.visible ) ? this.emissive.clone() : new THREE.Color( BLACK );

	}

}

export { Singularity };
