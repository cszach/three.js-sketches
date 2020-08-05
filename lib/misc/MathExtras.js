function constrain( number, min, max ) {

	return ( number < min ) ? min : ( number > max ) ? max : number;

}

export { constrain };
