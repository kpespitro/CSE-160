let VERTEX_SHADER = `
    precision mediump float;

    attribute vec3 a_Position;

    void main(){
        gl_Position = vec4(a_Position, 1.0);
    }
`;

let FRAGMENT_SHADER = `
    precision mediump float;

    uniform vec3 u_Color;

    void main(){
        gl_FragColor = vec4(u_Color, 1.0);
    }
`;

function main(){
    canvas = document.getElementById("webgl");

    ShapeColor = [0.0, 0.5, 1.0];

    gl = getWebGLContext(canvas);
    if (!gl){
        console.log("Failed to get WebGL context")
        return -1;
    }

    draw(gl);

    document.getElementById('redS').addEventListener('mouseup', function(){ShapeColor[0] = this.value/20; draw(gl)});
}

function draw(gl){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log(gl);

    let triangle = new Float32Array([-0.5,-0.5, 0.0,
                    0.5,-0.5, 0.0,    
                    0.0, 0.5, 0.0]);

    console.log(triangle);

    if(!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)){
        console.log("Failed to load/compile shaders");
        return -1;
    }

    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("Failed to create Buffer");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let a_Position = gl.getAttribLocation(gl.program, "a_Position");

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);

    let u_Color = gl.getUniformLocation(gl.program, "u_Color");

    gl.uniform3f(u_Color, ShapeColor[0], ShapeColor[1], ShapeColor[2]);
    
    gl.drawArrays(gl.TRIANGLES, 0, triangle.length/3);
}