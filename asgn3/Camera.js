class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([2, 0, 2]);
        this.at = new Vector3([2, 0, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(
            this.fov,
            canvas.width / canvas.height,
            0.1,
            1000
        );
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveForward(speed) {
        let e = this.eye.elements, a = this.at.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);
        f.normalize();

        let newX = e[0] + f.elements[0]*speed;
        let newZ = e[2] + f.elements[2]*speed;
        // e[0] += f.elements[0]*speed; e[1] += f.elements[1]*speed; e[2] += f.elements[2]*speed;
        // a[0] += f.elements[0]*speed; a[1] += f.elements[1]*speed; a[2] += f.elements[2]*speed;

        if (isWalkable(newX, e[2])) e[0] = newX, a[0] += f.elements[0]*speed;
        if (isWalkable(e[0], newZ)) e[2] = newZ, a[2] += f.elements[2]*speed;

        this.updateView();
    }

    moveBackwards(speed) {
        let e = this.eye.elements, a = this.at.elements;
        let b = new Vector3([e[0]-a[0], e[1]-a[1], e[2]-a[2]]);
        b.normalize();
        // e[0] += b.elements[0]*speed; e[1] += b.elements[1]*speed; e[2] += b.elements[2]*speed;
        // a[0] += b.elements[0]*speed; a[1] += b.elements[1]*speed; a[2] += b.elements[2]*speed;

        let newX = e[0] + b.elements[0]*speed;
        let newZ = e[2] + b.elements[2]*speed;

        if (isWalkable(newX, e[2])) e[0] = newX, a[0] += b.elements[0]*speed;
        if (isWalkable(e[0], newZ)) e[2] = newZ, a[2] += b.elements[2]*speed;
        this.updateView();
    }

    moveLeft(speed) {
        let e = this.eye.elements, a = this.at.elements, u = this.up.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);
        // s = up x f
        let s = new Vector3([
            u[1]*f.elements[2] - u[2]*f.elements[1],
            u[2]*f.elements[0] - u[0]*f.elements[2],
            u[0]*f.elements[1] - u[1]*f.elements[0]
        ]);
        s.normalize();

        let newX = e[0] + s.elements[0]*speed;
        let newZ = e[2] + s.elements[2]*speed;
        // e[0] += s.elements[0]*speed; e[1] += s.elements[1]*speed; e[2] += s.elements[2]*speed;
        // a[0] += s.elements[0]*speed; a[1] += s.elements[1]*speed; a[2] += s.elements[2]*speed;
        if (isWalkable(newX, e[2])) e[0] = newX, a[0] += s.elements[0]*speed;
        if (isWalkable(e[0], newZ)) e[2] = newZ, a[2] += s.elements[2]*speed;
        this.updateView();
    }

    moveRight(speed) {
        let e = this.eye.elements, a = this.at.elements, u = this.up.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);
        let s = new Vector3([
            f.elements[1]*u[2] - f.elements[2]*u[1],
            f.elements[2]*u[0] - f.elements[0]*u[2],
            f.elements[0]*u[1] - f.elements[1]*u[0]
        ]);
        s.normalize();

        let newX = e[0] + s.elements[0]*speed;
        let newZ = e[2] + s.elements[2]*speed;
        // e[0] += s.elements[0]*speed; e[1] += s.elements[1]*speed; e[2] += s.elements[2]*speed;
        // a[0] += s.elements[0]*speed; a[1] += s.elements[1]*speed; a[2] += s.elements[2]*speed;
        if (isWalkable(newX, e[2])) e[0] = newX, a[0] += s.elements[0]*speed;
        if (isWalkable(e[0], newZ)) e[2] = newZ, a[2] += s.elements[2]*speed;
        this.updateView();
    }

    panLeft(alpha) {
        let e = this.eye.elements, a = this.at.elements, u = this.up.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);
        let rotMat = new Matrix4();
        rotMat.setRotate(alpha, u[0], u[1], u[2]);
        let f_prime = rotMat.multiplyVector3(f);
        a[0] = e[0] + f_prime.elements[0];
        a[1] = e[1] + f_prime.elements[1];
        a[2] = e[2] + f_prime.elements[2];
        this.updateView();
    }

    panRight(alpha) {
        let e = this.eye.elements, a = this.at.elements, u = this.up.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);
        let rotMat = new Matrix4();
        rotMat.setRotate(-alpha, u[0], u[1], u[2]);
        let f_prime = rotMat.multiplyVector3(f);
        a[0] = e[0] + f_prime.elements[0];
        a[1] = e[1] + f_prime.elements[1];
        a[2] = e[2] + f_prime.elements[2];
        this.updateView();
    }

    panUp(alpha) {
        let e = this.eye.elements, a = this.at.elements, u = this.up.elements;
        let f = new Vector3([a[0]-e[0], a[1]-e[1], a[2]-e[2]]);

        let side = new Vector3([
            f.elements[1]*u[2] - f.elements[2]*u[1],
            f.elements[2]*u[0] - f.elements[0]*u[2],
            f.elements[0]*u[1] - f.elements[1]*u[0]
        ]);
        side.normalize();

        let rotMat = new Matrix4();
        rotMat.setRotate(alpha, side.elements[0], side.elements[1], side.elements[2]);
        let f_prime = rotMat.multiplyVector3(f);

        a[0] = e[0] + f_prime.elements[0];
        a[1] = e[1] + f_prime.elements[1];
        a[2] = e[2] + f_prime.elements[2];
        this.updateView();
    }
}

function isWalkable(x, z) {
    let mx = Math.floor(x);
    let mz = Math.floor(z);
    if (mx < 0 || mx >= 32 || mz < 0 || mz >= 32) return false;
    return g_map[mx][mz] === 0;
}