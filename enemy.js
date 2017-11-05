function Enemy(position) {

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3,5,2),
        new THREE.MeshBasicMaterial({color:0x0f0fff}));

    this.mesh.position.copy(position);

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    this.weapon = new EnemyPistol(new THREE.Vector3(1.5,0,-2), EnemyBullet);
    this.weapon.mesh.visible = true;
    objetos.push(this.weapon);

    this.mesh.add(this.weapon.mesh);


    this.speed = 10;

    this.fireCooldown = 1;

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        this.meshBB.setFromObject(this.mesh);
        this.detectCollision();

        //this.mesh.rotateY(0.3*delta * superHotConstant);
        //this.mesh.translateZ(-this.speed*delta * superHotConstant);


        if (this.fireCooldown<=0) {
            this.weapon.stopShooting();
            this.weapon.shoot();
            this.fireCooldown = 1;
        }

        if (this.weapon.currentAmmo==0) this.weapon.reload();

        if (this.fireCooldown>0) this.fireCooldown -= delta * currentTimeSpeed;

    };

    this.detectCollision = function () {
        //detecao colisao com balas e futuramente outros
        for (var i = 0;i<objetos.length ; i++){
            if (!(objetos[i] instanceof Bullet)) continue;
            if (this.meshBB.containsPoint(objetos[i].mesh.position)){
                console.log("Colisão");
                objetos[i].destroy(i);
            }
        }
    };

    this.render = function () {
        objetos.push(this);
        scene.add(this.mesh);
    }
}