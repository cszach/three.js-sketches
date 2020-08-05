import * as THREE from "../../../three.js/build/three.module.js";

class AnimatedMatrix {

	constructor( object ) {

		this.object = object;

	}

	build() {

		let object = new THREE.Object3D();

		return object;

	}

}

export { AnimatedMatrix };
