function addCube( scene, geo, mat ) {

	let geometry = geo || new THREE.BoxBufferGeometry( 1, 1, 1 );
	let material = mat || new THREE.MeshStandardMaterial( {
		color: 0xaaaaaa
	} );

	scene.add( new THREE.Mesh( geometry, material ) );

}

function addPlane( scene, geo, mat ) {

	let geometry = geo || new THREE.PlaneBufferGeometry( 10, 10, 10, 10 );
	let material = mat || new THREE.MeshBasicMaterial( {
		color: 0x000000,
		wireframe: true
	} );

	let plane = new THREE.Mesh( geometry, material );
	plane.rotation.x = Math.PI / 2;

	scene.add( plane );

}

function addPointLight( scene, position, color, intensity, distance, decay, helper = true ) {

	color = color || 0xffffff;
	intensity = intensity || 1;
	distance = distance || 0;
	decay = decay || 1;

	let light = new THREE.PointLight( color, intensity, distance, decay );
	light.position.x = position.x;
	light.position.y = position.y;
	light.position.z = position.z;

	helper = helper ? new THREE.PointLightHelper( light ) : null;

	scene.add( light, helper );

}
