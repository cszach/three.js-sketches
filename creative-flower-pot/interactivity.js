if ( scene ) {

	implement();

}

function implement() {

	addDefaultFlowers();
	debug();

}

/**
 * Add flowers (without interactivity)
 */
function addDefaultFlowers() {

	flowerPot.add( new Flower( torusKnotFlower ) );
	flowerPot.add( new Flower( dodecahedronFlower ) );
	flowerPot.add( new Flower( sphereFlower ) );
	flowerPot.add( new Flower( icosahedronFlower ) );
	flowerPot.add( new Flower( torusFlower ) );

}

/**
 * interactivity meant for debugging
 */
function debug() {

	// Lights debugging

	var debugLights = function ( event ) {

		switch ( event.code ) {

			case "KeyK":
				key.visible = keyHelper.visible = ! key.visible;
				break;
			case "KeyF":
				fill.visible = fillHelper.visible = ! fill.visible;
				break;
			case "KeyB":
				back.visible = backHelper.visible = ! back.visible;
				break;

		}

	};

	window.addEventListener( "keypress", debugLights );

}
