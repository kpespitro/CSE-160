class Cube{
    constructor(){
        this.type='cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0,1.0,1.0,1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4(); 
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // pass color of point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawCube(this.matrix);
    }
}

let cubeBuffer = null;

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

    // send matrix to shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}