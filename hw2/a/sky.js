const SKYBOX_VS = `
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position; 

varying vec3 vWorldPosition;

void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;

    vec4 p = viewMatrix * modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
}
`;



const SKYBOX_FS = `
precision mediump float;

uniform samplerCube tCube;
varying vec3 vWorldPosition;

void main() {
    gl_FragColor = textureCube( tCube, vec3(  vWorldPosition ) );
}
`;


function generate_skybox_mesh() {
    let cubeMap = new THREE.CubeTextureLoader()
        .setPath("./img/sky/")
        .load( [
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg'
        ] );
    let uniforms = { "tCube": {type: "t", value: cubeMap }};
    let material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: SKYBOX_VS,
        fragmentShader: SKYBOX_FS
    });
    material.depthWrite = false;
    material.side = THREE.BackSide;
    
    let geometry = new THREE.BoxGeometry( 2000, 2000, 2000 );
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}