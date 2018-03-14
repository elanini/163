const WATER_VS = `
precision highp float;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position; 
attribute vec2 uv;
attribute vec3 normal;
uniform float tick;

varying vec2 vUv;

//	https://www.shadertoy.com/view/lsjGWD
//	by Pietro De Nicola
//
#define OCTAVES   		2		// 7

vec2 hash( vec2 p ){
	p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
	return fract(sin(p)*43758.5453);
}

float voronoi( vec2 x , float time){
	vec2 n = floor( x );
	vec2 f = fract( x );
	
	float F1 = 8.0;
	float F2 = 8.0;
	
	for( int j=-1; j<=1; j++ )
		for( int i=-1; i<=1; i++ ){
			vec2 g = vec2(i,j);
			vec2 o = hash( n + g );

			o = 0.5 + 0.41*sin( time + 6.2831*o );	
			vec2 r = g - f + o;

		float d = 	 dot(r,r)  ;

		if( d<F1 ) { 
			F2 = F1; 
			F1 = d; 
		} else if( d<F2 ) {
			F2 = d;
		}
    }
	
	float c = F1;
	
    return c;
}

float fbm( vec2 p , float time){
	float s = 0.0;
	float m = 0.0;
	float a = 0.5;
	
	for( int i=0; i<OCTAVES; i++ ){
		s += a * voronoi(p, time);
		m += a;
		a *= 0.5;
		p *= 2.0;
	}
	return pow(s/m,2.0);
}

void main() {
    float displaceAmt = fbm(uv * 5.0 - 0.5, 100.0) * 50.0;
    vec3 newPosition = (position.xyz + normal.xyz * displaceAmt);
    vUv = uv;

    gl_Position = vec4( uv*2.0 - 1.0, 0.0, 1.0 );
}`;
  
const WATER_FS = `
precision highp float;
varying vec2 vUv;
uniform float tick;
uniform sampler2D heightmap;
#define OCTAVES   		5		// 7

vec2 hash( vec2 p ){
	p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
	return fract(sin(p)*43758.5453);
}

float voronoi( vec2 x , float time){
	vec2 n = floor( x );
	vec2 f = fract( x );
	
	float F1 = 8.0;
	float F2 = 8.0;
	
	for( int j=-1; j<=1; j++ )
		for( int i=-1; i<=1; i++ ){
			vec2 g = vec2(i,j);
			vec2 o = hash( n + g );

			o = 0.5 + 0.41*sin( time + 6.2831*o );	
			vec2 r = g - f + o;

		float d = 	 dot(r,r)  ;

		if( d<F1 ) { 
			F2 = F1; 
			F1 = d; 
		} else if( d<F2 ) {
			F2 = d;
		}
    }
	
	float c = F1;
	
    return c;
}

float fbm2( vec2 p , float time){
	float s = 0.0;
	float m = 0.0;
	float a = 0.5;
	
	for( int i=0; i<3; i++ ){
		s += a * voronoi(p, time);
		m += a;
		a *= 0.5;
		p *= 2.0;
	}
	return pow(s/m, 2.0);
}

float fbm5( vec2 p , float time){
	float s = 0.0;
	float m = 0.0;
	float a = 0.5;
	
	for( int i=0; i<15; i++ ){
		s += a * voronoi(p, time);
		m += a;
		a *= 0.5;
		p *= 2.0;
	}
	return pow(s/m, 2.0);
}

vec3 pos_for_uv(vec2 uv) {
	float height = texture2D(heightmap, uv).r;
	return vec3(uv.x, uv.y, height);
}

vec3 diff_for_uv(vec2 uv, vec3 pos2) {
	return  pos_for_uv(uv)- pos2;
}


vec3 get_normal(vec3 a, vec3 b) {
	return cross(normalize(a), normalize(b));
}

uniform int fakeShadow;
void main() {
	float pxStep = 1.0/2048.0;
	vec3 p   = pos_for_uv(vUv);

	vec3 avgnorm = vec3(0.0);
	vec3 Np  = diff_for_uv(vec2(vUv.x + pxStep, vUv.y), p);
	vec3 NEp = diff_for_uv(vec2(vUv.x + pxStep, vUv.y + pxStep), p);
	vec3 Ep  = diff_for_uv(vec2(vUv.x, vUv.y + pxStep), p);
	vec3 SEp = diff_for_uv(vec2(vUv.x - pxStep, vUv.y + pxStep), p);
	vec3 Sp  = diff_for_uv(vec2(vUv.x - pxStep, vUv.y), p);
	vec3 SWp = diff_for_uv(vec2(vUv.x - pxStep, vUv.y - pxStep), p);
	vec3 Wp  = diff_for_uv(vec2(vUv.x, vUv.y - pxStep), p);
	vec3 NWp = diff_for_uv(vec2(vUv.x + pxStep, vUv.y - pxStep), p);



	avgnorm += get_normal(Np, NEp);	
	avgnorm += get_normal(NEp, Ep);	
	avgnorm += get_normal(Ep, SEp);	
	avgnorm += get_normal(SEp, Sp);	
	avgnorm += get_normal(Sp, SWp);	
	avgnorm += get_normal(SWp, Wp);	
	avgnorm += get_normal(Wp, NWp);	
	avgnorm += get_normal(NWp, Np);	
	avgnorm += get_normal(Np, Ep);	
	avgnorm += get_normal(Ep, Sp);	
	avgnorm += get_normal(Sp, Wp);	
	avgnorm += get_normal(Wp, Np);	
	avgnorm = normalize(avgnorm);
	

	gl_FragColor = vec4((avgnorm + 1.0) / 2.0, p.z);
	// gl_FragColor = vec4(vec3(fbm2(vUv * 5.0 - 0.5, 100.0)), 1.0);
}`;



function generate_water_mesh() {
	let geometry = new THREE.PlaneGeometry(2048, 2048, 1, 1);
	let t = new THREE.TextureLoader().load(
		'heightmap.png',
		(texture) => {
			var dataURL = renderer.domElement.toDataURL();
			window.open(dataURL, "image");
		});
	t.magFilter = THREE.NearestFilter
	console.log(t)
    let uniforms = {
        tick: {type: "f", value: 0},
		fakeShadow: {type: "i", value: 1},
		heightmap: {type: "t", value: t}
	};
    let material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: WATER_VS,
        fragmentShader: WATER_FS
	})
	let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

/*
	vec2 adjUv = vUv * 5.0 - 0.5;
    float noiseval = fbm5(adjUv, 100.0);
    float above = fbm5(vec2(adjUv.x + 0.0001, adjUv.y), 100.0);
    float right = fbm5(vec2(adjUv.x, adjUv.y + 0.0001), 100.0);
    vec3 cpos = vec3(adjUv, noiseval);
    vec3 abovePos = vec3(adjUv.x + 0.0001, adjUv.y, above);
    vec3 rightPos = vec3(adjUv.x, adjUv.y + 0.0001, right);
    vec3 N = normalize(cross(  normalize(rightPos - cpos), normalize(abovePos - cpos)));

	vec3 smoothN;
	if (fakeShadow == 1) {
		float smoothNoiseval = fbm2(adjUv, 100.0);
		float smoothAbove = fbm2(vec2(adjUv.x + 0.0001, adjUv.y), 100.0);
		float smoothRight = fbm2(vec2(adjUv.x, adjUv.y + 0.0001), 100.0);
		vec3 smoothCpos = vec3(adjUv, smoothNoiseval);
		vec3 smoothAbovePos = vec3(adjUv.x + 0.0001, adjUv.y, smoothAbove);
		vec3 smoothRightPos = vec3(adjUv.x, adjUv.y + 0.0001, smoothRight);
		smoothN = normalize(
			cross(  
				normalize(smoothRightPos - smoothCpos), 
				normalize(smoothAbovePos - smoothCpos)
			)
		);

	}

    vec3 hitpoint = cpos;
    vec3 L = normalize(vec3(1.0, 5.0, -2.0));
    vec3 Kd = vec3(1.0, 0.0, 0.0);
    vec3 Ka = vec3(0.0, 0.0, 0.2);
    vec3 Ks = vec3(1.0, 1.0, 1.0);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 V = normalize(vec3(0.0, 0.0, 1.0) - hitpoint);
	float diffuseWeight;
	if (fakeShadow == 1) {
		diffuseWeight = dot(N, L) * clamp(5.0 * dot(L, smoothN), 0.0, 1.0);
	} else {
		diffuseWeight = dot(N, L);
	}
    // vec3 reflectionDirection = normalize(reflect(-L, N));
    float specularWeight = 0.0;
	vec3 color = (Kd * lightColor * diffuseWeight) + (Ks * lightColor * specularWeight) + (Ka * lightColor);
	*/