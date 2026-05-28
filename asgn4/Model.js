class Model {
    constructor() {
        this.type = 'model';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.texColorWeight = 0.0;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.uvBuffer = null;
        this.vertexCount = 0;
    }

    loadOBJ(objText) {
        const positions = [];
        const normals = [];
        const uvs = [];

        const vPos = []
        const vNorm = []
        const vUV = []

        const lines = objText.split('\n');
        for (let line of lines) {
            line = line.trim();
            const parts = line.split(/\s+/);
            if (parts[0] === 'v') {
                vPos.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (parts[0] === 'vn') {
                vNorm.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (parts[0] === 'vt') {
                vUV.push([parseFloat(parts[1]), parseFloat(parts[2])]);
            } else if (parts[0] === 'f') {
                const faceVerts = [];
                for (let i = 1; i < parts.length; i++) {
                    faceVerts.push(parts[i]);
                }
                for (let i = 1; i < faceVerts.length - 1; i++) {
                    const tri = [faceVerts[0], faceVerts[i], faceVerts[i+1]];
                    for (let token of tri) {
                        const idx = token.split('/');
                        const pi = parseInt(idx[0]) - 1;
                        const ti = idx[1] ? parseInt(idx[1]) - 1 : -1;
                        const ni = idx[2] ? parseInt(idx[2]) - 1 : -1;

                        positions.push(...vPos[pi]);

                        if (ni >= 0 && vNorm[ni]) {
                            normals.push(...vNorm[ni]);
                        } else {
                            normals.push(0, 1, 0);
                        }

                        if (ti >= 0 && vUV[ti]) {
                            uvs.push(...vUV[ti]);
                        } else {
                            uvs.push(0, 0);
                        }
                    }
                }
            }
        }

        this.vertexCount = positions.length / 3;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        console.log('OBJ loaded: ' + this.vertexCount + ' vertices');
    }

    render() {
        if (!this.vertexBuffer) return;

        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_texColorWeight, this.texColorWeight);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var normalMatrix = new Matrix4(this.matrix);
        normalMatrix.invert();
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}