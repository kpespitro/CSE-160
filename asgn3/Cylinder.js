class Cylinder {
    constructor(){
        this.type = 'cylinder';
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
        drawCylinder(this.matrix);
    }
}

let cylinderBuffer = null;
let cylinderUVBuffer = null;
let cylinderNormalBuffer = null;
let cylinderVertexCount = 0;

function initCylinderBuffer() {
    const vertices = [];
    const uvs = [];
    const normals = [];

    const segments = 30;
    const angleStep = 360 / segments;
    const radius = 0.5;
    const height = 1.0;

    // sides
    for (var angle = 0; angle < 360; angle += angleStep) {
        var a1 = angle * Math.PI / 180;
        var a2 = (angle + angleStep) * Math.PI / 180;

        var x1 = Math.cos(a1) * radius;
        var z1 = Math.sin(a1) * radius;
        var x2 = Math.cos(a2) * radius;
        var z2 = Math.sin(a2) * radius;

        // outward normals
        var nx1 = Math.cos(a1);
        var nz1 = Math.sin(a1);
        var nx2 = Math.cos(a2);
        var nz2 = Math.sin(a2);

        var u1 = angle / 360;
        var u2 = (angle + angleStep) / 360;

        vertices.push(
            x1, 0, z1,
            x1, height, z1,
            x2, height, z2
        );
        normals.push(
            nx1, 0, nz1,
            nx1, 0, nz1,
            nx2, 0, nz2
        );
        uvs.push(u1, 0, u1, 1, u2, 1);

        vertices.push(
            x1, 0, z1,
            x2, height, z2,
            x2, 0, z2
        );
        normals.push(
            nx1, 0, nz1,
            nx2, 0, nz2,
            nx2, 0, nz2
        );
        uvs.push(u1, 0, u2, 1, u2, 0);
    }

    // top
    for (var angle = 0; angle < 360; angle += angleStep) {
        var a1 = angle * Math.PI / 180;
        var a2 = (angle + angleStep) * Math.PI / 180;

        var x1 = Math.cos(a1) * radius;
        var z1 = Math.sin(a1) * radius;
        var x2 = Math.cos(a2) * radius;
        var z2 = Math.sin(a2) * radius;

        vertices.push(
            0, height, 0,
            x1, height, z1,
            x2, height, z2
        );
        normals.push(
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        );
        uvs.push(0.5, 0.5, (x1/radius+1)/2, (z1/radius+1)/2, (x2/radius+1)/2, (z2/radius+1)/2);
    }

    // bottom
    for (var angle = 0; angle < 360; angle += angleStep) {
        var a1 = angle * Math.PI / 180;
        var a2 = (angle + angleStep) * Math.PI / 180;

        var x1 = Math.cos(a1) * radius;
        var z1 = Math.sin(a1) * radius;
        var x2 = Math.cos(a2) * radius;
        var z2 = Math.sin(a2) * radius;

        vertices.push(
            0, 0, 0,
            x2, 0, z2,
            x1, 0, z1
        );
        normals.push(
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
        );
        uvs.push(0.5, 0.5, (x2/radius+1)/2, (z2/radius+1)/2, (x1/radius+1)/2, (z1/radius+1)/2);
    }

    cylinderVertexCount = vertices.length / 3;

    cylinderBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    cylinderUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);

    cylinderNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

    console.log('cyl verts:', vertices.length/3, 
                'uvs:', uvs.length/2, 
                'normals:', normals.length/3);
}

function drawCylinder(M) {
    if (!cylinderBuffer) {
        console.log("Cylinder buffer not initialized");
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.disableVertexAttribArray(a_UV);
    gl.disableVertexAttribArray(a_Normal);

    gl.vertexAttrib2f(a_UV, 0.0, 0.0);
    gl.vertexAttrib3f(a_Normal, 0.0, 1.0, 0.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    var normalMatrix = new Matrix4(M);
    normalMatrix.invert();
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, cylinderVertexCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.vertexAttribPointer(a_Normal, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
}