class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.textureNum=-2;
        this.texColorWeight = 0.0;
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_texColorWeight, this.texColorWeight);
        drawCube(this.matrix);
    }
}

let cubeBuffer = null;
let cubeUVBuffer = null;

function initCubeBuffer() {
    const vertices = new Float32Array([
        // front
        0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0,
        0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0,

        // back
        0.0,0.0,1.0, 1.0,0.0,1.0, 1.0,1.0,1.0,
        0.0,0.0,1.0, 1.0,1.0,1.0, 0.0,1.0,1.0,

        // top
        0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0,
        0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0,

        // bottom
        0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0,
        0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,

        // left
        0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0,
        0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0,

        // right
        1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0,
        1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0
    ]);

    const uvs = new Float32Array([
        // front
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1,
        // back
        0,0, 1,0, 1,1,
        0,0, 1,1, 0,1,
        // top
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
        // bottom
        0,0, 1,1, 0,1,
        0,0, 1,0, 1,1,
        // left
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
        // right
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1,
    ]);

    // create buffer object
    cubeBuffer = gl.createBuffer();
    if (!cubeBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // bind buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    // write date into object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    cubeUVBuffer = gl.createBuffer();
    if (!cubeUVBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.DYNAMIC_DRAW);
}

function drawCube(M) {
    if (!cubeBuffer) {
        console.log("Cube buffer not initialized");
        return;
    }

    // bind buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    // assign buffer to a_Position object
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // enable assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // uv buffer -> a_UV
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    // send matrix to shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}