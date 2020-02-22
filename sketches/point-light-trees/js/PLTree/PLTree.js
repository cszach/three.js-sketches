/* eslint no-undef: "off" */

/**
 * Point-light tree (PLTree) object
 *
 * Parameters govern how the tree looks.
 *
 * The first three arguments govern the meshes of the trunk, the branches, and
 * the leaves, and must be in the form:
 *   {
 *       geometryValues, // Object of arguments necessary for the geometry
 *       material // The material for the trunk/branches/leaves
 *   }
 *
 * The angle parameter governs the angles created by the branches and the trunk
 * per row. It must be an object in the form:
 * {
 *      start, // The angle of the first branch on the row
 *      end // The angle of the last branch on the row
 * }
 *
 * Measurements in this object should be in degrees and not radians.
 *
 * The geometries of the trunk, the branches, and the leaves are
 * CylinderBufferGeometry, CylinderBufferGeometry, SphereBufferGeometry,
 * respectively.
 *
 * @param {object} trunkData An object of the form { geometryValues, material }
 * @param {object} branchData An object of the form { geometryValues, material }
 * @param {object} leafData An object of the form { geometryValues, material }
 * @param {object} lightColors An array of hexadecimals that define the colors
 * for the lights
 * @param {number} angle An object of the form { start, end }
 * @param {number} amountPerRow Number of branches per row
 * @param {number} distance Distance between each row
 */
function PLTree(
	trunkData = { geometryValues: null, material: null },
	branchData = { geometryValues: null, material: null },
	leafData = { geometryValues: null, material: null },
	lightColors = [ 0xff0000, 0x00ff00, 0x0000ff ],
	angle = { start: 120, end: 60 },
	amountPerRow = 4,
	distance = 0.5
) {

	THREE.Group.apply( this, arguments );

	this.name = "PLTree";

	// Define variables

	let trunkGeo, trunkMat, branchGeo, branchMat, leafGeo, leafMat;
	let trunk, branchProto, leafProto, lightProto;

	// Cache

	let t = trunkData.geometryValues || {
		radiusTop: 0.06,
		radiusBottom: 0.08,
		height: 2.5,
		radialSegments: 11,
		heightSegments: 10
	};
	let b = branchData.geometryValues || {
		radiusTop: 0.04,
		radiusBottom: 0.04,
		height: 0.5,
		radialSegments: 8,
		heightSegments: 1
	};
	let l = leafData.geometryValues || {
		radius: 0.2,
		widthSegments: 30,
		heightSegments: 30
	};
	let trunkHeight = t.height;
	let trunkRadiusTop = t.radiusTop;
	let trunkRadiusBottom = t.radiusBottom;
	let trunkRadiiDiff = trunkRadiusTop - trunkRadiusBottom;
	let branchLength = b.height;

	// Compose geometries and materials necessary to create the tree

	trunkGeo = new THREE.CylinderBufferGeometry(
		t.radiusTop,
		t.radiusBottom,
		t.height,
		t.radialSegments,
		t.heightSegments
	);
	branchGeo = new THREE.CylinderBufferGeometry(
		b.radiusTop,
		b.radiusBottom,
		b.height,
		b.radialSegments,
		b.heightSegments
	);
	leafGeo = new THREE.SphereBufferGeometry(
		l.radius,
		l.widthSegments,
		l.heightSegments
	);

	trunkMat = trunkData.material || new THREE.MeshStandardMaterial( {
		roughness: 1,
		metalness: 0.8,
		side: THREE.DoubleSide
	} );
	branchMat = branchData.material || trunkMat.clone();
	leafMat = leafData.material || new THREE.MeshStandardMaterial( {
		vertexColors: THREE.FaceColors
	} );

	// Compose the tree parts

	trunk = new THREE.Mesh( trunkGeo, trunkMat );
	branchProto = new THREE.Mesh( branchGeo, branchMat );
	leafProto = new THREE.Mesh( leafGeo, leafMat );
	lightProto = new THREE.PointLight( 0xffffff, 0.8 );

	trunk.name = "Trunk";
	branchProto.name = "Branch";
	leafProto.name = "Leaf";
	lightProto.name = "Light";

	this.add( trunk );

	// Compute the bounding box of a branch to calculate the x and z coordinates
	// of each branch later

	let branchProtoBox,
		branchBoxSize = new THREE.Vector3();

	// branchProto.rotation.z = - THREE.Math.degToRad( angle );
	branchProtoBox = new THREE.Box3().setFromObject( branchProto );
	branchProtoBox.getSize( branchBoxSize );

	leafProto.position.y = branchLength / 2;

	// Placements

	let branch, leaf, light, color;

	let i = 0; // The index to choose colors from lightColors
	let h = t.height * ( 1 / 2 ); // The distance from the ground to the nearest row of branches
	let angleStep = ( angle.end - angle.start ) / ( amountPerRow - 1 );
	let numberOfRows = Math.trunc( ( t.height - h ) / distance ) + 1;

	for ( let row = 0; row < numberOfRows; row ++ ) {

		// Cache
		//
		// branchPosY: y-position of the branches on this row
		// trunkRadius: The radius of the trunk where the branches on this row
		//   are sticked to
		// branchAxis: A vector that is parallel with the branch, used to
		//   translate the branch later
		// translateDistance: The amount of distance to translate the branch

		let branchPosY = - ( trunkHeight / 2 ) + h + ( distance * row );
		let trunkRadius = trunkRadiusBottom + ( trunkRadiiDiff * ( branchPosY / trunkHeight ) );
		let branchAxis = new THREE.Vector3( branchBoxSize.x, branchBoxSize.y, 0 );
		let translateDistance = Math.hypot( branchBoxSize.x, branchBoxSize.y ) + trunkRadius;

		// Construct branches on this row

		for ( let rowBranch = 0; rowBranch < amountPerRow; rowBranch ++ ) {

			// Compose the branch and the leaf

			branch = branchProto.clone();
			leaf = leafProto.clone();
			light = lightProto.clone();

			color = lightColors[ i % lightColors.length ];
			light.color = new THREE.Color( color );
			leaf.material = leafMat.clone();
			leaf.material.setValues( { emissive: color } );

			leaf.add( light.clone() );
			branch.add( leaf.clone() );

			branch.position.y = branchPosY;
			branch.rotation.y = ( rowBranch * Math.PI * 2 ) / amountPerRow;
			branch.rotation.z = - THREE.Math.degToRad( angle.start + angleStep * rowBranch );

			// Translate the branch so that the branch looks like it is sticked
			// on the trunk

			branch.translateOnAxis( branchAxis, translateDistance );

			trunk.add( branch.clone() );

			i ++;

		}

	}

	// PLTree's custom attributes and methods

	this.trunk = this.getObjectByName( "Trunk" ); // The tree trunk
	this.boundingBox = null; // The bounding box of the tree
	this.height = null; // The height of the tree
	this.trunkHeight = this.trunk.geometry.parameters.height; // The tree trunk's height
	this.animation = null; // Function to animate this tree

	/**
	 * Plant the tree
	 *
	 * If grown is false, sets the tree's scale to 0. In order to grow it,
	 * call this.grow.
	 *
	 * @param {number} x The x position for the tree
	 * @param {number} y The y coordinate of the ground
	 * @param {number} z The z position for the tree
	 * @param {boolean} grown Plant the grown tree?
	 */
	this.plant = function ( x = 0, y = 0, z = 0, grown = false ) {

		this.position.set( x, y, z );
		this.trunk.position.y = y + this.trunkHeight / 2;

		this.grown = grown;
		if ( ! this.grown ) this.scale.set( 0, 0, 0 );

	};

	/**
	 * Grow the planted tree with the help of TweenJS
	 *
	 * Growing a planted tree means running its scale attribute from 0 to 1.
	 *
	 * @param {number} duration How long will the tree grow? (in ms)
	 * @param {number} wait Wait for how long before growing? (in ms)
	 @ @param {function} ease Easing used for the growing animation
	 */
	this.grow = function (
		duration = 300,
		wait = 0,
		ease = createjs.Ease.quadInOut
	) {

		return createjs.Tween.get( this.scale )
			.wait( wait )
			.to( { x: 1, y: 1, z: 1 }, duration, ease );

	};

	/**
	 * Compute the bounding box of this tree and update its boundingBox attribute
	 */
	this.computeBoundingBox = function () {

		this.boundingBox = new THREE.Box3().setFromObject( this );

	};

	/**
	 * Compute the height of this tree and update its height attribute
	 */
	this.computeHeight = function () {

		this.computeBoundingBox();
		this.height = this.boundingBox.getSize().y;

	};

	/**
	 * Return a list of branches on this tree
	 *
	 * @return {object} List of branches on this tree as Object3Ds
	 */
	this.getBranches = function () {

		return this.children[ 0 ].children;

	};

	/**
	 * Return a branch or a leaf or a light on this tree
	 *
	 * @param {number} what 1 = get branch, 2 = get leaf, 3 = get light
	 * @param {number} which The index of the branch
	 */
	this.get = function ( what, which ) {

		switch ( what ) {

			case 1:
				return this.children[ 0 ].children[ which ];
			case 2:
				return this.get( 1, which ).getObjectByName( "Leaf" );
			case 3:
				return this.get( 2, which ).getObjectByName( "Light" );
			default:
				console.warn( "PLTree.get: First argument must be either 1, 2, or 3" );

		}

	};

	/**
	 * Iterate over each branch on this tree, executing a function in every
	 * iteration
	 *
	 * The function that is executed per iteration also accepts these arguments:
	 *   - i: The index of the current branch (0-indexed)
	 *   - branch: The branch (as an Object3D)
	 *   - leaf: The leaf on this branch (as an Object3D)
	 *   - light: The light on this branch (as an Object3D)
	 *
	 * @param {function} func The function to execute for every branch iterated
	 */
	this.forEachBranch = function ( func ) {

		this.getBranches().forEach( function ( branch, i ) {

			func( i, branch, this.get( 2, i ), this.get( 3, i ) );

		}, this );

	};

	/**
	 * Remove a branch on this tree
	 *
	 * Note that this function does not dispose the branch, it only makes the
	 * branch invisible by setting its visible attribute to false.
	 *
	 * @param {number} i The index of the branch to remove
	 * @return {object} The removed branch
	 */
	this.removeBranch = function ( i ) {

		let target = this.getBranches()[ i ];
		target.visible = false;

		return target;

	};

	/**
	 * Remove a leaf on this tree
	 *
	 * Note that this function does not dispose the leaf, it only makes the
	 * leaf invisible by setting its visible attribute to false. Also, making a
	 * leaf invisible also makes the corresponding light invisible.
	 *
	 * @param {number} i The index of the branch that has the leaf to remove
	 * @return {object} The removed leaf
	 */
	this.removeLeaf = function ( i ) {

		let target = this.getBranches()[ i ].getObjectByName( 'Leaf' );
		target.visible = false;

		return target;

	};

	/**
	 * Set a function to run every time this.animate is called
	 *
	 * @param {function} animation The function to execute every time this.animate is called
	 */
	this.setAnimation = function ( animation ) {

		this.animation = animation;

	};

	/**
	 * Execute the function set via this.setAnimation
	 */
	this.animate = function () {

		this.animation();

	};

}

PLTree.prototype = Object.create( THREE.Group.prototype );
PLTree.prototype.constructor = PLTree;
