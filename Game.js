window.onload = init;
if (!Detector.webgl) Detector.addGetWebGLMessage();

// VARIABLES
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var audioContext;
var audioBufferLoader;
var container, stats;
var slowArea, plane;
var camera_1, camera_2, scene, renderer, composer;
var sun_uniforms, sun_material, sun;
var Airship, AirshipCamera;
var camera_1_IsActive;
var soundNappe1, soundNappe2, soundNappe3, soundNappe4, soundWhale, soundKick;
var audioFilterFreqExcept, audioFilterHighPass;
var gainNodeWhale;
var WIDTH = window.innerWidth || 2;
var HEIGHT = window.innerHeight || 2;
var FAR = 3500;
var SPEED = 800;
var SLOWSPEED = 100;


// INIT
function init() {

    // PHYSIJS > TO DO
    //Physijs.scripts.worker = 'physijs_worker.js';
    //Physijs.scripts.ammo = 'ammo.js';

    // CONTAINER
    container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    container.appendChild(renderer.domElement);
    renderer.autoClear = true;

    // SCENE
    scene = new THREE.Scene; // scene = new Physijs.Scene;

    // CAMERAS
    camera_1_IsActive = true;
    camera_1 = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, FAR);
    camera_1.position.z = 400;
    camera_1.position.y = 200;
    camera_2 = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, FAR);
    scene.add(camera_2);
    scene.add(camera_1);

    // LIGHTS
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);
    var pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, - 3500);
    scene.add(pointLight);
    scene.fog = new THREE.Fog(0x000000, 250, 3000);

    // OBJECTS
    slowArea = new THREE.Mesh(new THREE.SphereGeometry(30, 30, 30, 30), new THREE.MeshBasicMaterial({
        color: 0x000000
    }));
    slowArea.position.set(0, 100, - 10000);
    scene.add(slowArea);
    createStars(0, 100, - 10000, 0.5);
    createStars(0, 300, - 5000, 10);
    createPlane();
    createAirship();
    createSun();
    createGrid();

    // INIT SOUNDS
    initSounds();

    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    container.appendChild(stats.domElement);

    // EFFECTS
    var renderModel = new THREE.RenderPass(scene, camera_1);
    var effectFilm = new THREE.FilmPass(0.35, 0.95, 2048, false);
    effectFilm.renderToScreen = true;
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderModel);
    composer.addPass(effectFilm);

    // RESIZE
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    // LAUNCH
    animate();

}

// CREATE PLANE
function createPlane() {
    plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshBasicMaterial({
        color: 0x0000FF,
        opacity: 0.1,
        transparent: true
    }));
    plane.position.y = -1;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
}

// CREATE AIRSHIP
function createAirship() {
    var loader = new THREE.JSONLoader();
    loader.load("meshes/spaceship.js", function(Geometry) {
        /*Airship_mat  = Physijs.createMaterial( // TO DO
            new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xFF0000, specular: 0xffffff, shininess: 500, shading: THREE.SmoothShading }),
            .4, // low friction
            .6 // high restitution
        );
        Airship = new Physijs.BoxMesh(
        	new THREE.CubeGeometry( 50, 50, 50 ),
    		cube_mat,
            0
    	);*/
        AirshipCamera = new THREE.CubeCamera(0.1, 5000, 512); //( 0.1, 5000, 512 );
        scene.add(AirshipCamera);
        var mirrorMaterial = new THREE.MeshBasicMaterial({
            envMap: AirshipCamera.renderTarget
        });
        Airship = new THREE.Mesh(Geometry, mirrorMaterial);
        Airship.scale.set(2, 2, 2);
        Airship.position.set(140, 170, 0);
        AirshipCamera.position = Airship.position;
        scene.add(Airship);
    });
}

// CREATE SUN
function createSun() {
    sun_uniforms = {
        fogDensity: {
            type: "f",
            value: 0.45
        },
        fogColor: {
            type: "v3",
            value: new THREE.Vector3(0, 0, 0)
        },
        time: {
            type: "f",
            value: 1.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2()
        },
        uvScale: {
            type: "v2",
            value: new THREE.Vector2(3.0, 1.0)
        },
        texture1: {
            type: "t",
            value: THREE.ImageUtils.loadTexture("textures/cloud.png")
        },
        texture2: {
            type: "t",
            value: THREE.ImageUtils.loadTexture("textures/lavatext.jpg")
        }
    };
    sun_uniforms.texture1.value.wrapS = sun_uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
    sun_uniforms.texture2.value.wrapS = sun_uniforms.texture2.value.wrapT = THREE.RepeatWrapping;
    sun_material = new THREE.ShaderMaterial({
        uniforms: sun_uniforms,
        vertexShader: document.getElementById('sunVertexShader').textContent,
        fragmentShader: document.getElementById('sunFragmentShader').textContent
    });
    sun = new THREE.Mesh(new THREE.SphereGeometry(600, 200, 30, 30), sun_material);
    sun.rotation.z = 6 * 3.14 / 4;
    sun.position.set(0, 700, - 3000);
    scene.add(sun);
}

// CREATE GRID
function createGrid() {
    //Shorten the vertex function
    function v(x, y, z) {
        return new THREE.Vertex(new THREE.Vector3(x, y, z));
    }
    //Create line (point1, point2, colour)
    function createLine(p1, p2, color) {
        var line, lineGeometry = new THREE.Geometry(),
            lineMat = new THREE.LineBasicMaterial({
                color: color,
                lineWidth: 1
            });
        lineGeometry.vertices.push(p1, p2);
        line = new THREE.Line(lineGeometry, lineMat);
        scene.add(line);
    }
    // Grid creation
    var squareLength = 100;
    var gridXNumber = 3;
    var gridZNumber = FAR / squareLength + 10;
    for (var i = -gridXNumber; i <= gridXNumber; i++) {
        createLine(v(i / 2 * squareLength, 0, gridZNumber * squareLength), v(i / 2 * squareLength, 0, - gridZNumber * squareLength), 0xFFFFFF);
    }
    for (var j = -gridZNumber; j <= gridZNumber; j++) {
        createLine(v(gridXNumber * squareLength / 2, 0, j * 100), v(-gridXNumber * squareLength / 2, 0, j * 100), 0xFFFFFF);
    }
}

// CREATE STARS
function createStars(lineX, lineY, lineZ, scale) {
    var i, line, vertex1, vertex2, material, p,
    parameters = [
        [0.25, 0xff7700, 1, 2],
        [0.5, 0xff9900, 1, 1],
        [0.75, 0xffaa00, 0.75, 1],
        [1, 0xffaa00, 0.5, 1],
        [1.25, 0x000833, 0.8, 1],
        [3.0, 0xaaaaaa, 0.75, 2],
        [3.5, 0xffffff, 0.5, 1],
        [4.5, 0xffffff, 0.25, 1],
        [5.5, 0xffffff, 0.125, 1]
    ],
        geometry = new THREE.Geometry();
    for (i = 0; i < 1500; i++) {
        var vertex1 = new THREE.Vector3();
        vertex1.x = Math.random() * 2 - 1;
        vertex1.y = Math.random() * 2 - 1;
        vertex1.z = Math.random() * 2 - 1;
        vertex1.normalize();
        vertex1.multiplyScalar(450);
        vertex2 = vertex1.clone();
        vertex2.multiplyScalar(Math.random() * 0.09 + 1);
        geometry.vertices.push(vertex1);
        geometry.vertices.push(vertex2);
    }
    for (i = 0; i < parameters.length; ++i) {
        p = parameters[i];
        material = new THREE.LineBasicMaterial({
            color: p[1],
            opacity: p[2],
            linewidth: p[3]
        });
        line = new THREE.Line(geometry, material, THREE.LinePieces);
        line.scale.x = line.scale.y = line.scale.z = p[0] * scale;
        line.originalScale = p[0];
        line.rotation.y = Math.random() * Math.PI;
        line.position.x = lineX;
        line.position.y = lineY;
        line.position.z = lineZ;
        line.updateMatrix();
        scene.add(line);
    }
}

// INIT SOUNDS
function initSounds() {
    try {
        audioContext = new webkitAudioContext();
    }
    catch (e) {
        alert('Audio effects will be OFF.\n\nPlease try it with Chrome, or wait for the next Firefox.');
    }
    if (audioContext) {
        audioBufferLoader = new BufferLoader(
        audioContext, ['sounds/DarkNappe1.mp3', 'sounds/DarkNappe2.mp3', 'sounds/DarkNappe3.mp3', 'sounds/DarkNappe4.mp3', 'sounds/Whale.mp3', 'sounds/Kick.mp3', ],
        finishedAudioLoading);
        audioBufferLoader.load();
    }
}

// FINISHED AUDIO LOADING
function finishedAudioLoading(bufferList) {
    // Create audio buffers
    soundNappe1 = audioContext.createBufferSource();
    soundNappe2 = audioContext.createBufferSource();
    soundNappe3 = audioContext.createBufferSource();
    soundNappe4 = audioContext.createBufferSource();
    soundWhale = audioContext.createBufferSource();
    soundKick = audioContext.createBufferSource();
    soundNappe1.buffer = bufferList[0];
    soundNappe2.buffer = bufferList[1];
    soundNappe3.buffer = bufferList[2];
    soundNappe4.buffer = bufferList[3];
    soundWhale.buffer = bufferList[4];
    soundKick.buffer = bufferList[5];
    //Create filters
    audioFilterFreqExcept = audioContext.createBiquadFilter();
    audioFilterHighPass = audioContext.createBiquadFilter();
    audioFilterFreqExcept.connect(audioFilterHighPass);
    audioFilterHighPass.connect(audioContext.destination);
    audioFilterFreqExcept.type = 6;
    audioFilterHighPass.type = 0;
    audioFilterFreqExcept.frequency.value = 440; // Set cutoff to 440 HZ
    gainNodeWhale = audioContext.createGainNode();
    gainNodeWhale.gain.value = 0.2;
    gainNodeWhale.connect(audioContext.destination);
    //Program audio tracks
    programAudioTracks();
}

// PROGRAM AUDIO TRACKS
function programAudioTracks() {
    var startTime = audioContext.currentTime + 0.100;
    var iNappesCount = 10;
    var nappeTime = 31.320;
    var barTime = nappeTime / 4;
    var iKicksInBar = 16;
    var iKicksInNappe = iKicksInBar * 4;
    // Sequencer
    for (var iNappe = 0; iNappe < iNappesCount; iNappe++) {
        var time = startTime + iNappe * nappeTime;
        // Play the Nappe in four parts due to the size limitation I guess
        playSound(soundNappe1.buffer, time, true);
        playSound(soundNappe2.buffer, time + barTime, true);
        playSound(soundNappe3.buffer, time + 2 * barTime, true);
        playSound(soundNappe4.buffer, time + 3 * barTime, true);
        // Play the kick every eighth note / 8.
        /*for (var i = 0; i < iKicksInNappe; i++) {
            playSound(soundKick.buffer, time + (i + 0.23) * nappeTime / iKicksInNappe, false);
        }*/
    }
}

// PLAYSOUND
function playSound(buffer, time, bFBP) {
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    if (bFBP) {
        source.connect(audioFilterFreqExcept);
    }
    else {
        source.connect(gainNodeWhale);
        //source.connect(audioContext.destination);
    }
    source.noteOn(time);
}

// ON WINDOW RESIZE
function onWindowResize(event) {
    sun_uniforms.resolution.value.x = window.innerWidth;
    sun_uniforms.resolution.value.y = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera_1.aspect = window.innerWidth / window.innerHeight;
    camera_1.updateProjectionMatrix();
    composer.reset();
}

// ANIMATE AIRSHIP
function animateAirship(deltaClock) {
    var timeBase = deltaClock;
    // SLOW DOWN
    if (keyboard.pressed("space")) {
        timeBase = deltaClock / 4;
        if (camera_1.position.z > -300) {
            camera_1.position.z -= SLOWSPEED * deltaClock;
        }
    }
    else if (camera_1.position.z < 400) {
        camera_1.position.z += SLOWSPEED * deltaClock;
    }
    // LEFT & RIGHT
    if (keyboard.pressed("left")) {
        if (Airship.rotation.z < Math.PI / 2) {
            Airship.rotation.z += timeBase;
        }
    }
    else if (keyboard.pressed("right")) {
        if (Airship.rotation.z > -Math.PI / 2) {
            Airship.rotation.z -= timeBase;
        }
    }
    Airship.position.x -= 300 * timeBase * Airship.rotation.z;
    // UP & DOWN
    if (keyboard.pressed("up")) {
        Airship.rotation.x += timeBase;
    }
    else if (keyboard.pressed("down")) {
        Airship.rotation.x -= timeBase;
    }
    Airship.rotation.x = Airship.rotation.x % (2 * Math.PI);
    // BOX LIMITATIONS
    if (Airship.position.y < 25) {
        Airship.rotation.x = 0;
        Airship.position.y = 25;
    }
    else if (Airship.position.y > 1000) {
        Airship.rotation.x = 0;
        Airship.position.y = 1000;
    }
    if (Airship.position.x > 1000) {
        Airship.rotation.z = 0;
        Airship.position.x = 1000;
    }
    else if (Airship.position.x < -1000) {
        Airship.rotation.z = 0;
        Airship.position.x = -1000;
    }
    Airship.position.y += 300 * timeBase * Math.sin(Airship.rotation.x);

    camera_2.position.set(Airship.position.x, Airship.position.y, Airship.position.z - 100);
    camera_2.rotation = Airship.rotation;

    // Change cut off freq audio on height
    if (audioContext) {
        //var dist = Airship.position.distanceToSquared(camera_1.position) / 1000;
        var minValue = 200;
        var maxValue = audioContext.sampleRate / 2;
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // BASS PASS
        var rotSinZAngle = Math.sin(Airship.rotation.z);
        var multiplierZ = Math.pow(2, numberOfOctaves * (Math.abs(rotSinZAngle) - 1.0));
        audioFilterHighPass.frequency.value = maxValue * multiplierZ * 2;
        // HIGH PASS
        var rotSinXAngle = Math.sin(Airship.rotation.x);
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        var multiplierX = Math.pow(2, numberOfOctaves * (Math.abs(rotSinXAngle/2) - 1.0));
        audioFilterFreqExcept.frequency.value = maxValue * multiplierX;
    }
}

// ANIMATE GRID
function animateGrid(deltaClock) {
    var speed = keyboard.pressed("space") ? SLOWSPEED : SPEED;
    var randomX = Math.random();
    var randomY = Math.random();

    for (var i = 0; i < scene.children.length; i++) {
        var object = scene.children[i];
        if (object instanceof THREE.Line) {
            if (object.position.y == 0 && object.position.z >= 1000) {
                object.position.z = 0;
            }
            else if (object.position.z >= 5000) {
                object.position.z = -5000;
                object.position.x = (randomX * 2 - 1) * 300;
                object.position.y = randomY * 600;
            }
            object.position.z += speed * deltaClock;
        }
    }
    // Black Hole
    if (slowArea.position.z >= 5000) {
        slowArea.position.z = -5000;
        slowArea.position.x = (randomX * 2 - 1) * 300;
        slowArea.position.y = randomY * 600;
    }
    slowArea.position.z += speed * deltaClock;
}

// ANIMATE
function animate() {

    requestAnimationFrame(animate);

    var deltaClock = clock.getDelta();

    if (Airship && slowArea) {
        var dist = Airship.position.distanceToSquared(slowArea.position);
        if (dist < 500000) {
            var distFactor = dist / 500000.0;
            if (distFactor < 0.2) {
                distFactor = 0.2;
            }
            var size = 3 * (1 - distFactor);
            slowArea.scale.set(size, size, size);
            if (dist < 3000) {
                plane.material.color.setRGB(Math.random(), Math.random(), Math.random());
                if (audioContext && !soundWhale.playing) {
                    playSound(soundWhale.buffer, 0, false);
                }
            }
        }
        animateAirship(deltaClock);
        animateGrid(deltaClock);
        render(deltaClock);
        stats.update();
    }

}

// RENDER
function render(deltaClock) {

    if (Airship) {
        Airship.visible = false;
        AirshipCamera.updateCubeMap(renderer, scene);
        Airship.visible = true;
    }
    camera_1.lookAt(Airship.position); // TO DO: error on start, but camera has to look at
    sun_uniforms.time.value += deltaClock;
    if (keyboard.pressed("1")) {
        camera_1_IsActive = true;
    }
    else if (keyboard.pressed("2")) {
        camera_1_IsActive = false;
    }
    if (camera_1_IsActive) {
        renderer.render(scene, camera_1);
    }
    else {
        renderer.render(scene, camera_2);
    }
    //composer.render( 0.01 ); // TO DO: find better setup
}
