import * as THREE from "../../../three.js/build/three.module.js";

class PointLightingSystem {

	constructor( light, length, width, xGap, zGap, autoBuild = true ) {

		this.light = light;
		this.area = {
			length,
			width
		};
		this.gaps = {
			x: xGap,
			z: zGap
		};
		this.mesh = null;
		this.helpers = null;

		if ( autoBuild ) {

			this.mesh = this.build();

		}

	}

	build() {

		let mesh = new THREE.Group();

		let numberOfRows = Math.floor( this.area.length / this.gaps.x ) + 1;
		let numberOfColumns = Math.floor( this.area.width / this.gaps.z ) + 1;

		console.log( numberOfRows, numberOfColumns );

		let x = - ( this.gaps.x / 2 ) * numberOfRows % 2;
		let z = - ( this.gaps.z / 2 ) * numberOfColumns % 2;

		for ( let r = 0; r < Math.floor( numberOfRows / 2 ); r ++ ) {

			x += this.gaps.x;

			for ( let c = 0; c < Math.floor( numberOfColumns / 2 ); c ++ ) {

				z += this.gaps.z;

				let light01 = this.light.clone();
				light01.position.set( x, light01.position.y, z );

				let light02 = this.light.clone();
				light02.position.set( - x, light02.position.y, - z );

				let light03 = this.light.clone();
				light03.position.set( - x, light03.position.y, z );

				let light04 = this.light.clone();
				light04.position.set( x, light04.position.y, - z );

				mesh.add( light01, light02, light03, light04 );

			}

		}

		return mesh;

	}

	buildHelpers() {

		if ( ! this.mesh ) return;

		this.helpers = [];

		this.mesh.children.forEach( ( light ) => {

			let helper = new THREE.PointLightHelper( light );

			this.helpers.push( helper );
			this.mesh.add( helper );

		}, this );

	}

	updateHelpers() {

		this.helpers.forEach( ( helper ) => {

			helper.update();

		} );

	}

}

export { PointLightingSystem };
