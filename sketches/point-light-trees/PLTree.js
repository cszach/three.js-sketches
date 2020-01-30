/**
 * Point-light tree (PLTree) object
 *
 * Parameters govern how the tree looks.
 *
 * The first three arguments govern the meshes of the trunk, the branches, and
 * the leaves, and must be in the form:
 *   {
 *       geometryValues,
 *       material
 *   }
 * where geoValues is an object of arguments necessary to construct the geometry
 * and material is the material for the corresponding mesh.
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
 * @param {number} angle The size of the angle created by the axes of the branch
 * and the tree trunk
 * @param {number} amountPerRow Number of branches per row
 * @param {number} distance Distance between each row
 * @param {boolean} animate Animate the tree?
 */
function PLTree(
	trunkData = { geometryValues: null, material: null },
	branchData = { geometryValues: null, material: null },
	leafData = { geometryValues: null, material: null },
	lightColors = [ 0xff0000, 0x00ff00, 0x0000ff ],
	angle = 75,
	amountPerRow = 3,
	distance = 0.5,
	animate = false
) {

	THREE.Group.apply( this, arguments );
	this.name = "PLTree";
	this.animate = animate;

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

	this.add( trunk );

	// Compute the bounding box of a branch to calculate the x and z coordinates
	// of each branch later

	let branchProtoBox,
		branchBoxSize = new THREE.Vector3();

	branchProto.rotation.z = - THREE.Math.degToRad( angle );
	branchProtoBox = new THREE.Box3().setFromObject( branchProto );
	branchProtoBox.getSize( branchBoxSize );

	leafProto.position.y = branchLength / 2;

	// Placements

	let i = 0; // The index to choose colors from lightColors
	let h = t.height * ( 1 / 2 ); // The distance from the ground to the nearest row of branches
	let numberOfRows = Math.trunc( ( t.height - h ) / distance ) + 1;
	let branch, leaf, light, color;

	for ( let row = 0; row < numberOfRows; row ++ ) {

		// Cache

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

			// Translate the branch so that the branch looks like it is sticked
			// on the trunk

			branch.translateOnAxis( branchAxis, translateDistance );

			trunk.add( branch.clone() );

			i ++;

		}

	}

	// Compute the height of the tree

	this.height = null;
	this.computeHeight = function () {

		let treeBox = new THREE.Box3().setFromObject( this );
		this.height = treeBox.getSize().y;

		return treeBox.clone();

	};

}

PLTree.prototype = Object.create( THREE.Group.prototype );
PLTree.prototype.constructor = PLTree;
