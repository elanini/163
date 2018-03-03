let fs = `
precision mediump float;
/**
 * Part 1 Challenges
 * - Make the circle yellow
 * - Make the circle smaller by decreasing its radius
 * - Make the circle smaller by moving the camera back
 * - Make the size of the circle oscillate using the sin() function and the iTime
 *   uniform provided by shadertoy
 */
uniform vec2 resolution;
uniform float tick;
uniform sampler2D texture;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
// http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/#rotation-and-translation

mat4 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, 0, s, 0),
        vec4(0, 1, 0, 0),
        vec4(-s, 0, c, 0),
        vec4(0, 0, 0, 1)
    );
}
mat4 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(1, 0, 0, 0),
        vec4(0, c, -s, 0),
        vec4(0, s, c, 0),
        vec4(0, 0, 0, 1)
    );
}
mat4 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, -s, 0, 0),
        vec4(s, c, 0, 0),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 1)
    );
}
/**
 * Signed distance function for a sphere centered at the origin with radius 1.0;
 */
float sphereSDF(vec3 samplePoint) {
    return length(samplePoint) - 0.1;
}
//http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdTorus( vec3 p, vec2 t ) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}
float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}
//http://www.iquilezles.org/www/articles/smin/smin.htm
float smin( float a, float b, float k )
{
    float res = exp( -k*a ) + exp( -k*b );
    return -log( res )/k;
}
float sphereRepeat( vec3 p, vec3 c ) {
    vec3 q = mod(p,c)-0.5*c;
    return sphereSDF( q );
}
float sdCappedCylinder( vec3 p, vec2 h ) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
/**
 * Signed distance function describing the scene.
 * 
 * Absolute value of the return value indicates the distance to the surface.
 * Sign indicates whether the point is inside or outside the surface,
 * negative indicating inside.
 */
vec4 sceneSDF(vec3 samplePoint) {
    vec3 translatedSample = samplePoint - vec3(0.45, 0.45, -0.5);
    // one set of objects, morph to newbox
    vec3 torusPoint = (rotateX(-tick * 0.5) * vec4(translatedSample, 1.0)).xyz;
    vec3 boxPoint = (rotateX(tick) * vec4(translatedSample, 1.0)).xyz;
    boxPoint = (rotateY(radians(tick * 1.5)) * vec4(boxPoint, 1.0)).xyz;
    boxPoint = (rotateZ(radians(tick * 2.0)) * vec4(boxPoint, 1.0)).xyz;
    float torus = sdTorus(torusPoint, vec2(0.55, 0.15));
    float box = sdBox(boxPoint, vec3(0.20, 0.20, 0.20));
    float newbox = sdBox(boxPoint, vec3(0.5, 0.5, 0.5));

    float objectSet = mix(newbox, smin(torus, box, 10.0), sin(tick/3.0) / 2.0 + 0.5);

    // separate object
    translatedSample = (rotateX(tick * 0.5) * vec4(samplePoint + vec3(0.5, 0.5, 0.0), 1.0)).xyz;
    translatedSample = (rotateY(tick * 0.5) * vec4(translatedSample, 1.0)).xyz;
    float cyl = sdCappedCylinder(translatedSample, vec2(0.25, 0.25)); 

    if (cyl < objectSet) {
        return vec4(cyl, translatedSample);
    } else {
        return vec4(objectSet, -1.0, -1.0, -1.0);
    }
}


vec3 estimateNormal(vec3 p) {
    return normalize(vec3(
        sceneSDF(vec3(p.x + EPSILON, p.y, p.z)).x - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)).x,
        sceneSDF(vec3(p.x, p.y + EPSILON, p.z)).x - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)).x,
        sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)).x - sceneSDF(vec3(p.x, p.y, p.z - EPSILON)).x
    ));
}
/**
 * Return the shortest distance from the eyepoint to the scene surface along
 * the marching direction. If no part of the surface is found between start and end,
 * return end.
 * 
 * eye: the eye point, acting as the origin of the ray
 * marchingDirection: the normalized direction to march in
 * start: the starting distance away from the eye
 * end: the max distance away from the ey to march before giving up
 */
vec4 shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    vec3 objectPoint;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        vec4 dist = sceneSDF(eye + depth * marchingDirection);
        objectPoint = dist.yzw;
        if (dist.x < EPSILON) {
			return vec4(depth, objectPoint);
        }
        depth += dist.x;
        if (depth >= end) {
            return vec4(end, objectPoint);
        }
    }
    return vec4(end, objectPoint);
}
            

/**
 * Return the normalized direction to march in from the eye point for a single pixel.
 * 
 * fieldOfView: vertical field of view in degrees
 * size: resolution of the output image
 * fragCoord: the x,y coordinate of the pixel in the output image
 */
vec3 rayDirection(float fieldOfView, vec2 size) {
    vec2 xy = gl_FragCoord.xy - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}


void main() {
	vec3 dir = rayDirection(45.0, resolution);
    vec3 eye = vec3(0.0, 0.0, 5.0);
    vec4 result = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);
    float dist = result.x;
    vec3 objectPoint = result.yzw;
    
    if (dist > MAX_DIST - EPSILON) {
        // Didn't hit anything
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
    }

    vec3 Kd;

    if (objectPoint.x < -0.5 && objectPoint.y < -0.5 && objectPoint.z < -0.5) {
        Kd = vec3(1.0, 0.0, 0.0);
    } else {
        float pi = 3.14159265;
        float pi_over_two = 3.14159265 / 2.0;
        float u = (atan(objectPoint.x, objectPoint.z));
        Kd = texture2D(texture, vec2((u / pi) + 0.5, objectPoint.y)).rgb;
        if (abs(objectPoint.y) - 0.25 > -EPSILON) {
            Kd = texture2D(texture, vec2(objectPoint.x, objectPoint.z)).rgb;
        }
        // Kd = vec3(abs(u), abs(objectPoint.y), objectPoint.z);
    }

    vec3 hitpoint = eye + dist * dir;
    vec3 L = normalize(vec3(-1.0, -1.0, 2.0));
    vec3 Ka = vec3(0.0, 0.0, 0.2);
    vec3 Ks = vec3(1.0, 1.0, 1.0);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 N = estimateNormal(hitpoint);
    vec3 V = normalize(eye - hitpoint);
    float diffuseWeight = clamp(dot(L, N), 0.0, 1.0);
    vec3 reflectionDirection = normalize(reflect(-L, N));
    float specularWeight = pow(clamp(dot(reflectionDirection, V), 0.0, 1.0), 20.0);
    vec3 color = (Kd * lightColor * diffuseWeight) + (Ks * lightColor * specularWeight) + (Ka * lightColor);
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`