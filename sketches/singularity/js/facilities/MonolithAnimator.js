class MonolithAnimator {

	constructor( monoliths ) {

		this.monoliths = monoliths;

	}

	assign( mode ) {

		switch ( mode ) {

			case 0:

				break;

			case 1:

				let quantity = Math.round( Math.random() * this.monoliths.length );
				let chosenIndices, randomIndex;

				chosenIndices = [];
				for ( let i = 0; i < quantity; i ++ ) {

					while ( true ) {

						randomIndex = Math.floor( Math.random() * this.monoliths.length );

						if ( chosenIndices.indexOf( randomIndex ) === - 1 ) {

							chosenIndices.push( randomIndex );
							break;

						}

					}

				}

				this.animatedMonoliths = new Array();
				chosenIndices.forEach( ( chosenIndex ) => {

					this.animatedMonoliths.push( this.monoliths[ chosenIndex ] );

				}, this );

				break;

			case 2:

				this.animatedMonoliths = this.monoliths;
				break;

		}

	}

	animate( time, timeMultiplier = 1, distanceMultiplier = 1 ) {

		if ( ! this.animatedMonoliths || this.animatedMonoliths.length === 0 ) {

			return;

		}

		this.animatedMonoliths.forEach( ( monolith ) => {

			monolith.mesh.position.y = monolith.position.y + Math.sin( time * timeMultiplier ) * distanceMultiplier;

		} );

	}

}

export { MonolithAnimator };
