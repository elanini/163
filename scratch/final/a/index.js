var container;

var camera, scene, renderer;
var options;
var tick = 0;

var terrain_mesh, water_mesh;
function init() {

    let gui = new dat.GUI({width: 300})
    container = document.getElementById('container');
    console.log(container)
    camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight, 1, 2000);
    var controls = new THREE.OrbitControls( camera );
    camera.position.y = 40;
    camera.position.z = 300;
    controls.update()

    scene = new THREE.Scene();

 //   terrain_mesh = generate_terrain_mesh();
//    terrain_mesh.rotateX(-Math.PI/2);

  //  let {mesh: skybox_mesh, cubeMap} = generate_skybox_mesh();
   // console.log(cubeMap)
   options = {
       fakeShadow: true
   }
    gui.add(options, "fakeShadow", false, true);
    water_mesh = generate_water_mesh();
    water_mesh.rotateX(-Math.PI/2);
    water_mesh.translateZ(9.0);
    // scene.add(skybox_mesh);
    // scene.add(terrain_mesh);
    scene.add(water_mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x999999);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    //make it so that resizing the browser window also resizes the scene
    window.addEventListener('resize', onWindowResize, false);

    animate();
}



function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    tick += 0.01;
    water_mesh.material.uniforms.tick.value = tick;
    water_mesh.material.uniforms.fakeShadow.value = options.fakeShadow ? 1 : 0

    //if I want to update the lights, I acutally have to update the material used by each object in the scene. 
    //material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);

    renderer.render(scene, camera);
}


function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}