import * as THREE from '../../../three.js/build/three.module.js';

class MonolithGenerator {

	static randomPoint( sphere ) {

		let u = Math.random();
		let v = Math.random();
		let r = Math.cbrt( Math.random() );

		let theta = u * 2.0 * Math.PI;
		let phi = Math.acos( 2.0 * v - 1.0 );
		let sinPhi = Math.sin( phi );

		let sphereRadius = sphere.radius;

		return new THREE.Vector3(
			r * sinPhi * Math.cos( theta ) * sphereRadius + sphere.center.x,
			r * sinPhi * Math.sin( theta ) * sphereRadius + sphere.center.y,
			r * Math.cos( phi ) * sphereRadius + sphere.center.z
		);

	}

	constructor( monolith, defaults = null ) {

		this.monolith = monolith;
		this.defaults = defaults;

	}

	generate(
		quantity = this.defaults.quantity,
		sphere = this.defaults.boundingSphere,
		max = this.defaults.maxNumberOfIterations || 100,
		singularity = this.defaults.singularity
	) {

		this.monoliths = new Array();

		while ( this.monoliths.length < quantity ) {

			let newMonolith = this.monolith.clone();
			let i = 0;

			newMonolith.mesh.position.copy(
				MonolithGenerator.randomPoint( sphere )
			);
			newMonolith.mesh.geometry.computeBoundingBox();

			while ( ( this.monoliths.some(
				( monolith ) => ( newMonolith.hasCollidedWith( monolith ) )
			) || newMonolith.mesh.geometry.boundingBox.containsBox(
				singularity.mesh.geometry.boundingBox
			) ) && i < max ) {

				let randomPosition = MonolithGenerator.randomPoint( sphere );
				newMonolith.mesh.position.copy( randomPosition );

				i ++;

			}

			this.monoliths.push( newMonolith );

		}

	}

	addMonolithsToScene( object = this.defaults.object ) {

		if ( ! this.monoliths ) return;

		this.monoliths.forEach( ( monolith ) => {

			object.add( monolith.mesh );

		} );

	}

	hideMonolithsWithinThisSphere( sphere ) {

		this.monoliths.forEach( function ( monolith ) {

			if ( sphere.containsPoint( monolith.mesh.position ) ) {

				monolith.mesh.visible = false;

			}

		} );

	}

	createHelpers( mode, color, object = this.defaults.object ) {

		if ( mode === 0 ) return false;

		this.helpers = new Array();

		this.monoliths.forEach( ( monolith ) => {

			if ( mode === 5 && ! monolith.mesh.visible ) return;
			if ( mode === 6 && monolith.mesh.visible ) return;

			let helper = new THREE.BoxHelper( monolith.mesh, color );

			object.add( helper );
			this.helpers.push( helper );

		} );

		if ( mode === 1 ) {

			let quantity = Math.round( Math.random() * this.helpers.length );

			for ( let i = 0; i < quantity; i ++ ) {

				this.helpers.splice( Math.floor(
					Math.random() * this.helpers.length
				), 1 ).forEach( ( removedHelper ) => {

					console.log( removedHelper );
					object.remove( removedHelper );

				} );

			}

		}

	}

}

export { MonolithGenerator };
