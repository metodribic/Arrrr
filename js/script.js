
if ( ! Detector.webgl ) {
	Detector.addGetWebGLMessage();
	document.getElementById( 'container' ).innerHTML = "";
}

var keyboard = new THREEx.KeyboardState(); 
var container, stats;

var camera, controls, scene, renderer;

var mesh, texture, cube;

var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

var clock = new THREE.Clock();
var started = false;
var score = 0;

init();
animate();

function init() {
	container = document.getElementById( 'container' );

	//camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 20000 );

	scene = new THREE.Scene();
	// KAMERA OD PREJ
	

	data = generateHeight( worldWidth, worldDepth );

	//camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;
	camera.position.set(0, 25, 150); 
	scene.add(camera);

	var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.rotateX( - Math.PI / 2 );

	var vertices = geometry.attributes.position.array;

	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

		vertices[ j + 1 ] = data[ i ] * 10;

	}

	//dodam vodo
	var waterTexture = new THREE.ImageUtils.loadTexture( 'textures/water.jpg' );
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping; 
	waterTexture.repeat.set( 5, 5 );
	var waterMaterial = new THREE.MeshBasicMaterial( { map: waterTexture, side: THREE.DoubleSide } );
	var waterGeometry = new THREE.PlaneGeometry(7500, 7500);
	var water = new THREE.Mesh(waterGeometry, waterMaterial);
	water.position.y = 250;
	water.rotation.x = Math.PI / 2;
	water.doubleSided = true;
	scene.add(water);

	//dodamo kocko- kasneje objekt (ladjo)
	var geometryCube = new THREE.BoxGeometry(25, 25, 25);
	var materialCube = new THREE.MeshBasicMaterial({color: 0xfffff});
	cube = new THREE.Mesh(geometryCube, materialCube);

	//voda je na 250 torej more bit objekt na 250+polovica višine objekta
	cube.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);
	cube.position.x = -50;
	cube.position.z = 3600;
	cube.add(camera);
	scene.add(cube);

	texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;

	mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xbfd1e5 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = "";

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//controls.handleResize();

}

function generateHeight( width, height ) {

	var size = width * height, data = new Uint8Array( size ),
	perlin = new ImprovedNoise(), quality = 1, z = 100;

	for ( var j = 0; j < 4; j ++ ) {

		for ( var i = 0; i < size; i ++ ) {

			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

		}

		quality *= 5;

	}

	return data;

}

function generateTexture( data, width, height ) {

	var canvas, canvasScaled, context, image, imageData,
	level, diff, vector3, sun, shade;

	vector3 = new THREE.Vector3( 0, 0, 0 );

	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();

	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );

	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;

	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();

		shade = vector3.dot( sun );

		imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
	}

	context.putImageData( image, 0, 0 );

	// Scaled 4x

	canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;

	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );

	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;

	for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

		var v = ~~ ( Math.random() * 5 );

		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;

	}

	context.putImageData( image, 0, 0 );

	return canvasScaled;

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {
	console.log(started);
	var delta = clock.getDelta();
	var moveDistance = 20 * delta;
	var rotateAngle = Math.PI / 2 * delta;

	// če je igra v teku, povečaj hitrost oziroma se premakni za večji vektor
	if(started)
		cube.translateZ(-moveDistance*clock.elapsedTime*15);

	if(keyboard.pressed("left")) {
		// start
		if(!started) 
			startClock();
		// rotacija v levo
		else
	    	cube.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rotateAngle);
	} 

	if(keyboard.pressed("right")) { 
		// start
		if(!started) 
			startClock();
		// rotacija v desno
		else
			cube.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -rotateAngle);
	}

	// space pritisnemo ko se igra že izvaja - igro ustavimo, ter ponovno izrišemo > resetiramo položaj
	if(keyboard.pressed("space") && started) {
		init();
		started = false;
		score = 0;
	} 
		

	renderer.render( scene, camera );

}

// inicializacija ure
function startClock(){
	started = true;
	clock = new THREE.Clock();
}

