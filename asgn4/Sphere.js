class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.texColorWeight = 0.0;
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_texColorWeight, this.texColorWeight);
        drawSphere(this.matrix);
    }
}

let sphereBuffer = null;
let sphereUVBuffer = null;
let sphereNormalBuffer = null;
let sphereVertexCount = 0;

function initSphereBuffer() {
    const BANDS = 30;
    const SLICES = 30;

    let positions = [];
    let uvs = []
    let normals = [];

    for (let lat = 0; lat < BANDS; lat++) {
        let theta0 = (lat / BANDS) * Math.PI;
        let theta1 = ((lat + 1) / BANDS) * Math.PI;

        for (let lon = 0; lon < SLICES; lon++) {
            let phi0 = (lon / SLICES) * 2 * Math.PI;
            let phi1 = ((lon + 1) / SLICES) * 2 * Math.PI;

            // 4 corners
            let x00 = Math.sin(theta0) * Math.cos(phi0);
            let y00 = Math.cos(theta0);
            let z00 = Math.sin(theta0) * Math.sin(phi0);

            let x10 = Math.sin(theta1) * Math.cos(phi0);
            let y10 = Math.cos(theta1);
            let z10 = Math.sin(theta1) * Math.sin(phi0);

            let x01 = Math.sin(theta0) * Math.cos(phi1);
            let y01 = Math.cos(theta0);
            let z01 = Math.sin(theta0) * Math.sin(phi1);

            let x11 = Math.sin(theta1) * Math.cos(phi1);
            let y11 = Math.cos(theta1);
            let z11 = Math.sin(theta1) * Math.sin(phi1);

            // triangle 1
            positions.push(x00,y00,z00, x10,y10,z10, x11,y11,z11);
            // triangle 2
            positions.push(x00,y00,z00, x11,y11,z11, x01,y01,z01);

            // UVS
            let u0 = lon / SLICES,  u1 = (lon + 1) / SLICES;
            let v0 = lat / BANDS,   v1 = (lat + 1) / BANDS;
            uvs.push(u0,v0, u0,v1,  u1,v1);
            uvs.push(u0,v0, u1,v1,  u1,v0);

            // Normals
            normals.push(x00,y00,z00, x10,y10,z10, x11,y11,z11);
            normals.push(x00,y00,z00, x11,y11,z11, x01,y01,z01);
        }
    }

    sphereVertexCount = positions.length / 3;

    sphereBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    sphereUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    sphereNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

function drawSphere(M) {
    if (!sphereBuffer) {
        console.log("Sphere buffer not initialized");
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    var normalMatrix = new Matrix4(M);
    normalMatrix.invert();
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, sphereVertexCount);
}