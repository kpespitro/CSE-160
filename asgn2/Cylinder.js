class Cylinder {
    constructor(){
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawCylinder(this.matrix);
    }
}

let cylinderBuffer = null;
let cylinderVertexCount = 0;

function initCylinderBuffer() {
    const vertices = [];

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

        vertices.push(
            x1, 0, z1,
            x1, height, z1,
            x2, height, z2
        );

        vertices.push(
            x1, 0, z1,
            x2, height, z2,
            x2, 0, z2
        );
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
    }

    cylinderBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    cylinderVertexCount = vertices.length / 3;
}

function drawCylinder(M) {
    if (!cylinderBuffer) {
        console.log("Cylinder buffer not initialized");
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    gl.drawArrays(gl.TRIANGLES, 0, cylinderVertexCount);
}