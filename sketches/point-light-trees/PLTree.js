function PLTree() {

	THREE.Group.apply( this, arguments );

}

PLTree.prototype = Object.create( THREE.Group.prototype );
PLTree.prototype.constructor = PLTree;
