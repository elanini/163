var container;

var camera, scene, renderer;


function init() {

    container = document.getElementById('container');
    console.log(container)
    camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 5;

    scene = new THREE.Scene();


    let terrain_mesh = generate_terrain_mesh();
    terrain_mesh.rotateX(-Math.PI/3);
    scene.add(terrain_mesh);

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