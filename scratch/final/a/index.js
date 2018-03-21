var container;

var camera, scene, renderer;
var options;
var tick = 0;

var terrain_mesh;
function init() {

    let gui = new dat.GUI({width: 300})
    container = document.getElementById('container');
    console.log(container)
    let width = 1024
    let height = 1024
    camera = new THREE.PerspectiveCamera( 90, width / height, 1, 2000 );
    var controls = new THREE.OrbitControls(camera)
    camera.position.z = 100;
    camera.position.y = 40;
    controls.update();

    scene = new THREE.Scene();

    options = {
        fakeShadow: true
    }
    gui.add(options, "fakeShadow", false, true);
    terrain_mesh = generate_terrain_mesh();
    terrain_mesh.rotateX(-Math.PI/2);
    terrain_mesh.translateZ(9.0);
    scene.add(terrain_mesh);

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setClearColor(0x999999);
    renderer.setSize(1024, 1024);
    container.appendChild(renderer.domElement);


    //make it so that resizing the browser window also resizes the scene
    window.addEventListener('resize', onWindowResize, false);
    var img = new Image();
    img.onload = function() {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        console.log(ctx.getImageData(0,0,2048,2048));
    }
    img.src = 'heightmap.png';

    animate();
    // renderk()
    // var dataURL = renderer.domElement.toDataURL();
    // window.open(dataURL, "image");
}



function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    tick += 0.01;
    terrain_mesh.material.uniforms.tick.value = tick;
    terrain_mesh.material.uniforms.fakeShadow.value = options.fakeShadow ? 1 : 0

    //if I want to update the lights, I acutally have to update the material used by each object in the scene. 
    //material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);

    renderer.render(scene, camera);
}


function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}