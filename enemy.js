function Enemy(position) {

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(20,30,2),
        new THREE.MeshBasicMaterial({color:0x0f0fff}));

    this.mesh.position.copy(position);

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    this.weapon = new EnemyPistol(new THREE.Vector3(1.5,0,-2), EnemyBullet);
    this.weapon.mesh.visible = true;
    game.objects.push(this.weapon);

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

        if (this.fireCooldown>0) this.fireCooldown -= delta * game.currentTimeSpeed;

    };

    this.detectCollision = function () {
        //detecao colisao com balas e futuramente outros
        for (var i = 0;i<game.objects.length ; i++){
            if (!(game.objects[i] instanceof Bullet)) continue;
            if (this.meshBB.containsPoint(game.objects[i].mesh.position)){
                console.log("Colisão");
                game.objects[i].destroy(i);
            }
        }
    };

    this.render = function () {
        game.objects.push(this);
        game.scene.add(this.mesh);
    }
}