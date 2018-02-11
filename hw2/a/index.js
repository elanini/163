var container;

var camera, scene, renderer;


function init() {

    container = document.getElementById('container');
    console.log(container)
    camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 40;
    camera.position.z = 300;

    scene = new THREE.Scene();


    let terrain_mesh = generate_terrain_mesh();
    terrain_mesh.rotateX(-Math.PI/2);

    let {mesh: skybox_mesh, cubeMap} = generate_skybox_mesh();
    console.log(cubeMap)

    let water_mesh = generate_water_mesh(cubeMap);
    water_mesh.rotateX(-Math.PI/2);
    water_mesh.translateZ(9.0);

    scene.add(skybox_mesh);
    scene.add(terrain_mesh);
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



    //if I want to update the lights, I acutally have to update the material used by each object in the scene. 
    //material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);

    renderer.render(scene, camera);
}


function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}