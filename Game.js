if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var clock = new THREE.Clock();
Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var camera, scene, renderer, composer;
var sun_uniforms, sun_material, sun, Airship, AirshipCamera;
var spaceshipSpeed = 10.0;

var keyboard  = new THREEx.KeyboardState();

var WIDTH = window.innerWidth || 2;
var HEIGHT = window.innerHeight || 2;
var FAR = 3500;

init();
animate();

function initPlane () {
    var plane = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshBasicMaterial( { color: 0x0000FF, opacity: 0.1, transparent: true } ) );
    plane.position.y = -1;
    plane.rotation.x = - Math.PI / 2;
    scene.add( plane );
}

function initAirship () {
    var loader = new THREE.JSONLoader();
    loader.load("spaceship.js", function (Geometry) {
        /*Airship_mat  = Physijs.createMaterial(
            new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xFF0000, specular: 0xffffff, shininess: 500, shading: THREE.SmoothShading }),
            .4, // low friction
            .6 // high restitution
        );
        Airship = new Physijs.BoxMesh(
        	new THREE.CubeGeometry( 50, 50, 50 ),
    		cube_mat,
            0
    	);*/
        AirshipCamera = new THREE.CubeCamera ( 0.1, 5000, 512 );//( 0.1, 5000, 512 );
        scene.add( AirshipCamera );
        var mirrorMaterial = new THREE.MeshBasicMaterial( { envMap: AirshipCamera.renderTarget } );
        Airship = new THREE.Mesh(Geometry, mirrorMaterial);
        Airship.scale.set(2, 2, 2);
        Airship.position.set (140, 170, 0);
        AirshipCamera.position = Airship.position;
        scene.add(Airship);
    });
}

function initSun () {
    sun_uniforms = {

		fogDensity: { type: "f", value: 0.45 },
		fogColor: { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		uvScale: { type: "v2", value: new THREE.Vector2( 3.0, 1.0 ) },
		texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/cloud.png" ) },
		texture2: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/lavatext.jpg" ) }

	};

	sun_uniforms.texture1.value.wrapS = sun_uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
	sun_uniforms.texture2.value.wrapS = sun_uniforms.texture2.value.wrapT = THREE.RepeatWrapping;

	sun_material = new THREE.ShaderMaterial( {

		uniforms: sun_uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,

		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );

	sun = new THREE.Mesh( new THREE.SphereGeometry( 600, 200, 30, 30 ), sun_material );
	sun.rotation.z = 6*3.14/4;
    sun.position.x = 0;
    sun.position.y = 700;
    sun.position.z = -3000;
	scene.add( sun );
}

function initGrid () {
    //Shorten the vertex function
    function v(x,y,z){
        return new THREE.Vertex(new THREE.Vector3(x,y,z));
    }

    //Create line (point1, point2, colour)
    function createLine(p1, p2, color){
        var line, lineGeometry = new THREE.Geometry(),
        lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
        lineGeometry.vertices.push(p1, p2);
        line = new THREE.Line(lineGeometry, lineMat);
        scene.add(line);
    }

   // Grid creation
   var squareLength = 100;
   var gridXNumber = 3;
   var gridZNumber = FAR / squareLength;
   for (var i = - gridXNumber; i <= gridXNumber; i++){
        createLine(v(i/2 * squareLength, 0, FAR), v(i/2 * squareLength, 0, -FAR), 0xFFFFFF);
   }
   for (var j = - gridZNumber; j <= gridZNumber; j++){
        createLine(v(gridXNumber * squareLength / 2, 0, j*100), v(-gridXNumber * squareLength / 2, 0, j*100), 0xFFFFFF);
   }
}

function initStars (lineX, lineY, lineZ, scale) {

    var i, line, vertex1, vertex2, material, p,
		parameters = [ [ 0.25, 0xff7700, 1, 2 ], [ 0.5, 0xff9900, 1, 1 ], [ 0.75, 0xffaa00, 0.75, 1 ], [ 1, 0xffaa00, 0.5, 1 ], [ 1.25, 0x000833, 0.8, 1 ],
				       [ 3.0, 0xaaaaaa, 0.75, 2 ], [ 3.5, 0xffffff, 0.5, 1 ], [ 4.5, 0xffffff, 0.25, 1 ], [ 5.5, 0xffffff, 0.125, 1 ] ],

		geometry = new THREE.Geometry();


	for ( i = 0; i < 1500; i ++ ) {

		var vertex1 = new THREE.Vector3();
		vertex1.x = Math.random() * 2 - 1;
		vertex1.y = Math.random() * 2 - 1;
		vertex1.z = Math.random() * 2 - 1;
		vertex1.normalize();
		vertex1.multiplyScalar( 450 );

		vertex2 = vertex1.clone();
		vertex2.multiplyScalar( Math.random() * 0.09 + 1 );

		geometry.vertices.push( vertex1 );
		geometry.vertices.push( vertex2 );

	}

	for( i = 0; i < parameters.length; ++ i ) {

		p = parameters[ i ];

		material = new THREE.LineBasicMaterial( { color: p[ 1 ], opacity: p[ 2 ], linewidth: p[ 3 ] } );

		line = new THREE.Line( geometry, material, THREE.LinePieces );
		line.scale.x = line.scale.y = line.scale.z = p[ 0 ] * scale;
		line.originalScale = p[ 0 ];
		line.rotation.y = Math.random() * Math.PI;
        line.position.x = lineX;
        line.position.y = lineY;
        line.position.z = lineZ;
		line.updateMatrix();
		scene.add( line );

	}
}

// INIT
function init() {

	container = document.getElementById( 'container' );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    container.appendChild( renderer.domElement );
	renderer.autoClear = true;

    // CAMERA
	camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, FAR );
    camera.position.z = 400;
    camera.position.y = 200;

	scene = new Physijs.Scene;

    // LIGHTS
    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );
    var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, -3500 );
    scene.add( pointLight );
    scene.fog = new THREE.Fog( 0x000000, 250, 3000 );
    
    // OBJECTS
    initStars(0, 100, -10000, 0.5);
    initStars(0, 300, -5000, 10);
    initPlane();
    initAirship();
    initSun();
    initGrid();
    
    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
	container.appendChild( stats.domElement );

    // EFFECTS
	var renderModel = new THREE.RenderPass( scene, camera );
	var effectFilm = new THREE.FilmPass( 0.35, 0.95, 2048, false );
	effectFilm.renderToScreen = true;
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderModel );
	composer.addPass( effectFilm );

    // RESIZE
	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );
    
}


function onWindowResize( event ) {

	sun_uniforms.resolution.value.x = window.innerWidth;
	sun_uniforms.resolution.value.y = window.innerHeight;

	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	composer.reset();

}

function animateAirship()
{
     if( keyboard.pressed("left") ) {
        Airship.position.x -= 5;
    }
    else if( keyboard.pressed("right") ) {
        Airship.position.x += 5;
    }
    if( keyboard.pressed("up") ) {
        Airship.position.y += 5;
    }
    else if( keyboard.pressed("down") && Airship.position.y > 35) {
        Airship.position.y -= 5;
    }
}

function animateGrid()
{
    for ( var i = 0; i < scene.children.length; i ++ ) {
        var object = scene.children[ i ];
        if ( object instanceof THREE.Line ) {
            if (object.position.y == 0 && object.position.z >= 1000){
                object.position.z = 0;
            }
            else if (object.position.z >= 5000){
                object.position.z = -5000;
                /*object.position.x = Math.random() * 2 - 1;
		        object.position.y = Math.random() * 2 - 1;*/
            }
            object.position.z += spaceshipSpeed;
        }
    }
}

function animate() {

	requestAnimationFrame( animate );
    animateAirship();
    animateGrid();
	render();
	stats.update();

}

function render() {

	var delta = 5 * clock.getDelta();

    if (Airship) {
        camera.lookAt( Airship.position );
    }
	sun_uniforms.time.value += 0.2 * delta;

    Airship.visible = false;
    AirshipCamera.updateCubeMap( renderer, scene );
	Airship.visible = true;
	
	renderer.render( scene, camera );
    
    renderer.clear();
    composer.render( 0.01 );

}
