var container;

var camera, scene, renderer;
var options, spawnerOptions;
var clock = new THREE.Clock(), tick = 0;
var particleSystem;


function init() {
    let gui = new dat.GUI({width: 300})

    container = document.getElementById('container');
    console.log(container)
    camera = new THREE.PerspectiveCamera(28.0, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 100;

    options = {
        position: new THREE.Vector3(),
        positionRandomness: 2.5,
        velocity: new THREE.Vector3(0, 1, 0),
        velocityRandomness: 1.5,
        color: 0xFF4500,
        colorRandomness: 0.1,
        turbulence: .05,
        lifetime: 1,
        size: 50,
        sizeRandomness: 1,
    };

    spawnerOptions = {
        spawnRate: 1500,
        horizontalSpeed: 0.1,
        verticalSpeed: 0.0,
        timeScale: 1
    };


    scene = new THREE.Scene();

    particleSystem = new THREE.GPUParticleSystem( {
        maxParticles: 250000,
        particleSpriteTex: new THREE.TextureLoader().load('abc.png')
    } );


    scene.add(particleSystem);

    gui.add( options, "velocityRandomness", 0, 3 );
    gui.add( options, "positionRandomness", 0, 3 );
    gui.add( options, "size", 1, 20 );
    gui.add( options, "color", 0, 0xffffff);
    gui.add( options, "sizeRandomness", 0, 25 );
    gui.add( options, "colorRandomness", 0, 1 );
    gui.add( options, "lifetime", .1, 10 );
    gui.add( options, "turbulence", 0, 1 );

    gui.add( spawnerOptions, "spawnRate", 10, 30000 );
    gui.add( spawnerOptions, "timeScale", -1, 1 );


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );



    //make it so that resizing the browser window also resizes the scene
    window.addEventListener('resize', onWindowResize, false);

    animate();
}



function animate() {

    requestAnimationFrame(animate);
    var delta = clock.getDelta() * spawnerOptions.timeScale;

    tick += delta;

    if ( tick < 0 ) tick = 0;

    if ( delta > 0 ) {

        // options.position.x = Math.sin( tick * spawnerOptions.horizontalSpeed ) * 20;
        // options.position.y = Math.sin( tick * spawnerOptions.verticalSpeed ) * 10;
        // options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;
        options.position.x = 1
        options.position.y = 1
        options.position.z = 1

        for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {

            // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
            // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
            particleSystem.spawnParticle( options );

        }

    }
    particleSystem.update( tick );

    render();

}

function render() {



    //if I want to update the lights, I acutally have to update the material used by each object in the scene. 
    //material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);
// console.log(renderer)
    renderer.render(scene, camera);
}


function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}