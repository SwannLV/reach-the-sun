if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var clock = new THREE.Clock();
Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var camera, scene, renderer, composer, box;
var sun_uniforms, sun_material, sun, Airship;
var spaceshipSpeed = 10.0;

var keyboard  = new THREEx.KeyboardState();

var WIDTH = window.innerWidth || 2;
var HEIGHT = window.innerHeight || 2;
var FAR = 3500;

init();
animate();

function init() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, FAR );
    camera.position.z = 400;
    camera.position.y = 200;

	scene = new Physijs.Scene;

    // Plane
    var plane = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshBasicMaterial( { color: 0x0000FF, opacity: 0.1, transparent: true } ) );
    plane.position.y = -1;
    plane.rotation.x = - Math.PI / 2;
    scene.add( plane );

	// Materials
	/*var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'textures/lavatext.jpg' ) }),
		.8, // high friction
		.4 // low restitution
	);
	/*ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
	ground_material.map.repeat.set( 3, 3 );*/

    // Ground
    /*	ground = new Physijs.BoxMesh(
			new THREE.CubeGeometry(WIDTH, 1, FAR),
			ground_material,
			0 // mass
		);
		//ground.receiveShadow = true;
		scene.add( ground );
        ground.position.y = -1;*/

	/*var box_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'textures/lavatext.jpg' ) }),
		.4, // low friction
		.6 // high restitution
	);
	box_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
	box_material.map.repeat.set( .25, .25 );*/
   /* var box_material = Physijs.createMaterial(
    	new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xFF0000, specular: 0xffffff, shininess: 500, shading: THREE.SmoothShading }),
		.4, // low friction
		.6 // high restitution
	);*/

     // Airship
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
        //Geometry.materials[0].color.setHex(0xFFFFFF); // Sets the material color to red
        Airship = new THREE.Mesh(Geometry, new THREE.MeshFaceMaterial());
        Airship.scale.set(2, 2, 2);
        Airship.position.set(20, 0, -100); // Positions the mesh right from the center
        Airship.position.y   = 235;
        Airship.position.x   = 0;
        Airship.position.z   = 0;
        //Airship.rotation.y   = - Math.PI / 2;
        scene.add(Airship);
    });

    // Box
    /*box = new Physijs.BoxMesh(
		new THREE.CubeGeometry( 100, 100, 100 ),
		box_material
	);
    box.position.set(0,50,-400);
	box.position.set(
		Math.random() * 50 - 25,
		10 + Math.random() * 5,
		Math.random() * 50 - 25
	);
	box.rotation.set(
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2
	);
	//box.castShadow = true;
	scene.add( box );*/

    // LIGHTS
    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );
    var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, -3500 );
    scene.add( pointLight );

    // Fog
    scene.fog = new THREE.Fog( 0x000000, 250, 3000 );

    // Sun
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

    //

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
   var gridXNumber = 6;
   var gridZNumber = FAR / squareLength;
   for (var i = - gridXNumber; i <= gridXNumber; i++){
        createLine(v(i/2 * squareLength, 0, FAR), v(i/2 * squareLength, 0, -FAR), 0xFFFFFF);
   }
   for (var j = - gridZNumber; j <= gridZNumber; j++){
        createLine(v(gridXNumber * squareLength / 2, 0, j*100), v(-gridXNumber * squareLength / 2, 0, j*100), 0xFFFFFF);
   }
    /*for (var i = - WIDTH/100; i <= WIDTH/100 + 1; i++){
        createLine(v(i/2 * 100, 0, FAR), v(i/2 * 100, 0, -FAR), 0xFFFFFF);
   }
   for (var j = - FAR/100; j <= FAR/100; j++){
        createLine(v(WIDTH/2, 0, j*100), v(-WIDTH/2, 0, j*100), 0xFFFFFF);
   }*/

    //

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	container.appendChild( renderer.domElement );
	renderer.autoClear = false;

	//

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
	container.appendChild( stats.domElement );

	//

	var renderModel = new THREE.RenderPass( scene, camera );
	//var effectBloom = new THREE.BloomPass( 3.25 );
	var effectFilm = new THREE.FilmPass( 0.35, 0.95, 2048, false );

	effectFilm.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	//composer.addPass( effectBloom );
	composer.addPass( effectFilm );

	//

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

//
/*
function AddMesh( geometry ) {

    //geometry.materials[0][0].shading = THREE.FlatShading;
	//geometry.materials[0][0].morphTargets = true;
alert('ok');
	var material = new THREE.MeshFaceMaterial();
alert('ok');
	Airship = new THREE.Mesh( geometry, material );
	Airship.scale.set(50, 50, 50);
    Airship.position.x = 20;
    Airship.position.z = -50;

	scene.addObject( Airship );
}*/

//

function animateAirship()
{
     if( keyboard.pressed("left") ) {
        Airship.position.x -= 5;
        //speedRotZ = 0.05;
    }
    else if( keyboard.pressed("right") ) {
        Airship.position.x += 5;
        //speedRotZ = -0.05;
    }
   /* else if (speedRotZ != 0)
    {
        speedRotZ = 0.00;
    }*/
    if( keyboard.pressed("up") ) {
        Airship.position.y += 5;
    }
    else if( keyboard.pressed("down") && Airship.position.y > 35) {
        Airship.position.y -= 5;
    }
    /*if( keyboard.pressed("space") ) {
        //cube.position.z += 1;
        Airship.rotation.x -= speedRotX / 2;
    }
    else{
        //cube.position.z -= 2;
        Airship.rotation.x -= speedRotX;
    }*/
    //camera.position.z -= 1;
    //cube.rotation.z += speedRotZ;
}

function animateGrid()
{
    for ( var i = 0; i < scene.children.length; i ++ ) {
        var object = scene.children[ i ];
        if ( object instanceof THREE.Line ) {
            if (object.position.z >= 100*10){
                object.position.z = 0;
            }
            object.position.z += spaceshipSpeed;
        }
    }
}

function animate() {

	requestAnimationFrame( animate );
    //box.position.z += spaceshipSpeed;
    animateAirship();
    animateGrid();
	render();
	stats.update();

}

function render() {

	var delta = 5 * clock.getDelta();

    camera.lookAt( Airship.position );
    //scene.simulate(undefined, 2);
	sun_uniforms.time.value += 0.2 * delta;

	renderer.clear();
	composer.render( 0.01 );

}
