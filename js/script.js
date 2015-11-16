 
if ( ! Detector.webgl ) {
        Detector.addGetWebGLMessage();
        document.getElementById( 'container' ).innerHTML = "";
}
 
 
 
var textureCube;
var keyboard = new THREEx.KeyboardState();
var container, stats;
var camera, controls, scene, renderer, water, randomX, randomY;
var mesh, texture, cube, coin, coin2, score, object, objectTmp;
var worldWidth = 512, worldDepth = 512,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2
var clock = new THREE.Clock();
var allCrates = []; //tabela v katero shranis vse objekte, za collision
var allCoins = []; //tabela kovanckov
var started = false;
var score = 0;
var divScore;
var cube1;
 
init();
animate();
 
 
function init() {
        container = document.getElementById( 'container' );
 
        //camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
        camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 110000 );
        scene = new THREE.Scene();
        // scene.addEventListener(
        //                 'update',
        //                 function() {
        //                         console.log("bam");
        //                         scene.simulate( undefined, 1 );
        //                         physics_stats.update();
                               
        //                 }
        //         );
        data = generateHeight( worldWidth, worldDepth );
 
        //camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;
        camera.position.set(0, 25, 150);
        scene.add(camera);
 
        var geometry = new THREE.PlaneBufferGeometry( 2000, 50000, worldWidth - 1, worldDepth - 1 );
        geometry.rotateX( - Math.PI / 2 );
 
        var vertices = geometry.attributes.position.array;
 
        for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 )
                vertices[ j + 1 ] = data[ i ] * 10;
 
       
        //############ NEBO ############
        var urls = [
                'textures/yellowcloud_rt.jpg',
                'textures/yellowcloud_lf.jpg',
                'textures/yellowcloud_up.jpg',         
                'textures/yellowcloud_dn.jpg',
                'textures/yellowcloud_bk.jpg',         
                'textures/yellowcloud_ft.jpg'
        ];
 
        textureCube = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderLib['cube'];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms['tCube'].value = textureCube;
        var skyboxmaterial = new THREE.ShaderMaterial({
                fragmentShader : shader.fragmentShader,
                vertexShader   : shader.vertexShader,
                uniforms       : shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
        });
 
        var skyGeometry = new THREE.CubeGeometry( 100000, 100000, 100000 );    
        var materialArray = [];
        for (var i = 0; i < 6; i++)
                materialArray.push( new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture(urls[i]),
                        side: THREE.BackSide
                }));
        var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add( skyBox );
 
 
        //############ VODA ############
        var waterTexture = new THREE.ImageUtils.loadTexture( 'textures/water.jpg' );
        waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
        waterTexture.repeat.set( 5, 5 );
        var waterMaterial = new THREE.MeshBasicMaterial( { map: waterTexture, side: THREE.DoubleSide } );
        var waterGeometry = new THREE.PlaneGeometry(3000, 50000);
        water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y = 360;
        water.rotation.x = Math.PI / 2;
        water.doubleSided = true;
        scene.add(water);
 
        /*
        //############ LADJA ############
        var loader = new THREE.ObjectLoader();
                loader.load( 'http://localhost/rgti_arrrr/models/ladja2.json',
                function ( objectTmp) {
                        objectTmp.scale.x = objectTmp.scale.y = objectTmp.scale.z = 1.5;
                        objectTmp.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2);
                        //voda je na 250 torej more bit objekt na 250+polovica višine objekta
                        objectTmp.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);        
                        objectTmp.position.x = 250;
                        objectTmp.position.z = 24800;
                       
                        objectTmp.add(camera);
                   
                    object = objectTmp;
                    scene.add( object );
                } );
        */
               
        //############ LADJA-KOCKA ############
        var geometryCube = new THREE.BoxGeometry(25, 25, 25);
        var materialCube = new THREE.MeshBasicMaterial({color: 0xfffff});
        cube = new THREE.Mesh(geometryCube, materialCube);
        //voda je na 250 torej more bit objekt na 250+polovica višine objekta
        cube.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);     
        cube.position.x = 250;
        cube.position.z = 24800;
        cube.add(camera);
        scene.add(cube);
       
       
 
        //############ OVIRE ############
        createObstacle(230, 24200);
        createObstacle(150, 22200);
        createObstacle(50, 21200);
        createObstacle(80, 20200);
        createObstacle(100, 19200);
        createObstacle(30, 18200);
        createObstacle(80, 17200);
        createObstacle(80, 14200);
        createObstacle(80, 13200);
        createObstacle(-70, 11200);
        createObstacle(-110, 9800);
        createObstacle(-130, 8200);
        createObstacle(-150, 7200);
        createObstacle(0, 7200);
        createObstacle(-200, 7800);
        createObstacle(-10, 6800);
        createObstacle(-250, 6800);
        createObstacle(50, 6400);
        createObstacle(-30, 5700);
        createObstacle(-50, 3500);
        createObstacle(-100, 3000);
        createObstacle(-20, 1200);
        createObstacle(-60, 100);
        createObstacle(0, -1000);
        createObstacle(100, -2300);
 
        //createObstacle(80, 20200);
        //createObstacle(100, 19200);
        //createObstacle(30, 18200);
        //createObstacle(80, 17200);
        //createObstacle(80, 14200);
        //createObstacle(80, 13200);
        //createObstacle(-70, 11200);
        //createObstacle(-110, 9800);
        //createObstacle(-130, 8200);
 
 
        
        //############ ZETONI ############
        for (var i=0; i<=100; i++) {
            randomX = Math.floor(Math.random() * 500)-200;
            randomY = Math.floor(Math.random() * 45000)-16000;  
           	createCoin(randomX, randomY);
        }      
       
       
        //############ 	PRVI ŽETON ############
        var geometryCoin = new THREE.CylinderGeometry( 8, 8, 2, 32 );
        var materialCoin = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        coin = new THREE.Mesh( geometryCoin, materialCoin );
       
        coin.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);
        coin.position.x = 250;
        coin.position.z = 24250;
        allCoins.push(coin);
        scene.add( coin );
        //console.log(allCoins);
       
 
/*      //############ TESTNI OBJEKT############
        var geometryCube = new THREE.BoxGeometry(25, 25, 25);
        var materialCube = new THREE.MeshBasicMaterial({color: 0x343434});
        cube1 = new Physijs.BoxMesh(geometryCube, materialCube);
        //voda je na 250 torej more bit objekt na 250+polovica višine objekta
        cube1.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);    
        cube1.position.x = -50;
        cube1.position.z = 3500;
        scene.add(cube1);
        allCrates.push(cube1);
*/
 
        //############ TEREN ############
        texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        mesh = new Physijs.BoxMesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
        scene.add( mesh );
        //allCrates.push(mesh);
 

        //############ RENDERER ############
        renderer = new THREE.WebGLRenderer();
        //renderer.setClearColor( 0x99ffcc );
        //renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.innerHTML = "";
        container.appendChild( renderer.domElement );
 

        //############ STATS ############
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );
 

        ///############ SCORE ############ - NOT WORKING
        divScore = document.createElement("div");
        divScore.style.width = "100px";
        divScore.style.height = "100px";
        divScore.style.color = "red";
	    divScore.style.top = "100%" ;
	    divScore.style.right = "100%" ;
	    divScore.style.zIndex = "99";
        divScore.textContent = score;
        container.appendChild(divScore);
 
        window.addEventListener( 'resize', onWindowResize, false );
 
} // end of init()
 
 
// kreiranje zakladov-ZETONOV //
function createCoin(cx, cz) {
        //zeton test
        var geometryCoin = new THREE.CylinderGeometry( 8, 8, 2, 32 );
        var materialCoin = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        coin = new THREE.Mesh( geometryCoin, materialCoin );
       
        coin.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);
        coin.position.x = cx;
        coin.position.z = cz;
        coin.rotation.x += 0.1;
        coin.rotation.z += 0.13;
        allCoins.push(coin);
        scene.add( coin );
        return coin;
}
 
//kreiranje ovir-SKATLE //
function createObstacle(ox, oz) {
        var crateTexture = new THREE.ImageUtils.loadTexture('textures/crate.jpg');
        var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
        var crateGeometry = new THREE.CubeGeometry(25, 25, 25, 1, 1, 1);
        crate = new THREE.Mesh(crateGeometry, crateMaterial);
        //voda je na 250 torej more bit objekt na 250+polovica višine objekta
        crate.position.y = water.position.y + Math.round(cube.geometry.parameters.height/2);    
        crate.position.x = ox;
        crate.position.z = oz;
        allCrates.push(crate);
        scene.add( crate );
        return crate;
}
 
 
// resize handler
function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        //controls.handleResize();
}
 

// generiranje terena
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
 
 
// generiranje texture za teren
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
 
                imageData[ i ] = ( 32 + shade * 76 ) * ( 0.5 + data[ j ] * 0.007 );
                imageData[ i + 1 ] = ( 32 + shade * 66 ) * ( 0.5 + data[ j ] * 0.007 );
                imageData[ i + 2 ] = ( shade * 22 ) * ( 0.5 + data[ j ] * 0.003 );
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
 
 

function animate() {
        // scene.simulate();
        render();
        requestAnimationFrame( animate );
        stats.update();
}
 
 
function render() {
 
        var delta = clock.getDelta();
        var moveDistance = 20 * delta;
        var rotateAngle = Math.PI / 6 * delta;
        var objSpeed = -moveDistance*clock.elapsedTime*15;

        rotateCoins();

 
        // če je igra v teku, povečaj hitrost oziroma se premakni za večji vektor
        if(started){
                if(objSpeed < -23)
                        objSpeed = -23;
                //object.translateZ(objSpeed);
                cube.translateZ(objSpeed);
        }
 
        if(keyboard.pressed("left")) {
                // start
                if(!started)
                        startClock();
                // rotacija v levo
                else
                //object.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rotateAngle);
                cube.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rotateAngle);
        }
 
        if(keyboard.pressed("right")) {
                // start
                if(!started)
                        startClock();
                // rotacija v desno
                else
                        //object.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -rotateAngle);
                        cube.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -rotateAngle);
        }
 
        // space pritisnemo ko se igra že izvaja - igro ustavimo, ter ponovno izrišemo > resetiramo položaj
        if(keyboard.pressed("space") && started) {
                init();
                started = false;
                score = 0;
        }
       
 
        // collision detection:
        //   determines if any of the rays from the cube's origin to each vertex
        //              intersects any face of a mesh in the array of target meshes
        //   for increased collision accuracy, add more vertices to the cube;
        //              for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
        //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
        var originPoint = cube.position.clone();
 
        for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++){		
			var localVertex = cube.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( cube.matrix );
			var directionVector = globalVertex.sub( cube.position );
			
			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResultsCrate = ray.intersectObjects( allCrates );
			var ray2 = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResultsCoins = ray2.intersectObjects( allCoins );


			// zadanem škatlo
			if ( collisionResultsCrate.length > 0 && collisionResultsCrate[0].distance < directionVector.length() ) {
				console.log(" ZABOJ ###");
				score--;

				//console.log(" SCORE:  "+score);
			}

			// zadanem žeton
			if ( collisionResultsCoins.length > 0 && collisionResultsCoins[0].distance < directionVector.length() ) {
				console.log("kovanc ++++++++++++++")
				score++;
				//console.log(" SCORE:  "+score);
			}	
		}      
       
       
        renderer.render( scene, camera );
 
}
 
 
// inicializacija ure
function startClock(){
        started = true;
        clock = new THREE.Clock();
}


function rotateCoins(){
	for (coin1 of allCoins){
		coin1.rotation.x += 0.1;
        coin1.rotation.z += 0.13;
	}
}
