import * as THREE from "../../../three.js/build/three.module.js";

class KineticBall {

	constructor( radius, detailsX, detailsY, cubeCamera ) {

		this.geometry = new THREE.SphereBufferGeometry( radius, detailsX, detailsY );
		this.material = new THREE.MeshPhysicalMaterial( {
			color: 0xffffff,
			emissive: 0x000000,
			roughness: 0,
			metalness: 1,
			envMap: cubeCamera.renderTarget.texture
		} );
		this.mesh = this.build();

	}

	build() {

		let mesh = new THREE.Mesh( this.geometry, this.material );

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		return mesh;

	}

}

export { KineticBall };
