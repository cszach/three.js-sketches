class CanvasHelper {

	constructor( canvas ) {

		this.target = canvas;

	}

	get aspectRatio() {

		return this.target.clientWidth / this.target.clientHeight;

	}

	get dimension() {

		return [ this.target.clientWidth, this.target.clientHeight ];

	}

	bind( camera, renderer ) {

		this.camera = camera;
		this.renderer = renderer;

	}

	update() {

		// On canvas resize

		if ( this.target.width !== this.target.clientWidth
			|| this.target.height !== this.target.clientHeight ) {

			this.camera.aspect = this.aspectRatio;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( ...this.dimension );

		}

	}

}

export { CanvasHelper };
