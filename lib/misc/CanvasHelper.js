/**
 * CanvasHelper.js
 *
 * @author Nguyen Hoang Duong / you_create@protonmail.com
 */

/**
 * A simple class made for dealing with the canvas easier in three.js apps.
 */
class CanvasHelper {

	/**
	 * Creates a new instance of CanvasHelper.
	 *
	 * @param {object} canvas The canvas to deal with
	 */
	constructor( canvas ) {

		this.target = canvas;

	}

	/**
	 * Gets the aspect ratio of this canvas.
	 *
	 * @return {number} The aspect ratio of this canvas (width / height)
	 */
	get aspectRatio() {

		let target = this.target;

		return target.clientWidth / target.clientHeight;

	}

	/**
	 * Alias for aspectRatio.
	 */
	get aspect() {

		let target = this.target;

		return target.clientWidth / target.clientHeight;

	}

	/**
	 * Tells this instance what (three.js) camera and renderer are being used in
	 * this canvas. Necessary for the update function.
	 *
	 * @param {object} camera The camera
	 * @param {object} renderer The renderer
	 */
	bind( camera, renderer ) {

		this.camera = camera;
		this.renderer = renderer;

	}

	/**
	 * Does things in the animation loop.
	 */
	update() {

		// On canvas resize

		let target = this.target;
		let camera = this.camera;
		let renderer = this.renderer;
		let targetClientWidth = target.clientWidth;
		let targetClientHeight = target.clientHeight;
		let aspect = targetClientWidth / targetClientHeight;

		if ( target.width !== targetClientWidth
			|| target.height !== targetClientHeight ) {

			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			renderer.setSize( targetClientWidth, targetClientHeight );

		}

	}

}

export { CanvasHelper };
