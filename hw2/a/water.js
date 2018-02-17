const WATER_VS = `
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 cameraPosition;

attribute vec3 position; 
attribute vec3 normal; 

varying vec3 vI;
varying vec3 vWorldNormal;

void main() {
    vec4 mvPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vWorldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

    vI = worldPosition.xyz - cameraPosition;

    gl_Position = projectionMatrix * mvPosition;
}`;
  
const WATER_FS = `
precision mediump float;

uniform samplerCube envMap;

varying vec3 vI, vWorldNormal;

void main() {
    vec3 reflection = reflect( vI, vWorldNormal );
    vec4 envColor = textureCube( envMap, vec3( -reflection.x, reflection.yz ) );
    gl_FragColor = vec4(envColor.rgb, 0.8);
}`;

function generate_water_mesh(cubeMap) {
    let geometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
    let uniforms = {
        tCube: { type: "t", value: cubeMap }
    };
    let material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: WATER_VS,
        fragmentShader: WATER_FS
    })
    material.transparent = true;
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}