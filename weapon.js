class Gun {
    constructor(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime, bulletType,pointBulletSpawn,accuracyDistance){
        this.mesh = mesh;
        this.mesh.visible = false;
        this.damage = damage;
        this.bulletSpeed = bulletSpeed;
        this.fireRate = fireRate;
        this.fireCooldown = 0;
        this.maxAmmo = maxAmmo;
        this.currentAmmo = maxAmmo;
        this.reloadTime = reloadTime;
        this.reloadCooldown = 0;
        this.isShooting = false;
        this.isReloading = false;
        this.bulletType = bulletType;

        this.pointBulletSpawn = pointBulletSpawn;

        this.accuracyDistance = accuracyDistance;
        this.point = new THREE.Object3D();
        this.point.position.z = - this.accuracyDistance;
        game.controls.getObject().children[0].add(this.point);
    }

    startShooting(){
        this.isShooting = true;
    }

    stopShooting(){
        this.isShooting = false;
    }

    shoot() {
        this.currentAmmo -= 1;

        var pointBulletVec = new THREE.Vector3(0,0,0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);

        var accPoint = new THREE.Vector3(0,0,0);
        this.point.localToWorld(accPoint);
        accPoint.sub(pointBulletVec);
        //criar bala
        var bullet = new this.bulletType(pointBulletVec, accPoint.normalize(), this.bulletSpeed);
        //draw bullet
        bullet.render();
        this.fireCooldown = 1/this.fireRate;
    }

    update(delta, objectIndex) {
        // update do cooldown da disparo
        if (this.fireCooldown>0) 
            this.fireCooldown -= delta * game.currentTimeSpeed;
            
        // angulo da arma para simular a animação
        if (this.isReloading) this.mesh.rotation.x = Math.PI / 4;
        else if (this.fireCooldown>1/(this.fireRate*3)) this.mesh.rotation.x = Math.PI / 32;
        else  this.mesh.rotation.x = 0;

        if (this.isReloading){
            this.reloadCooldown -= delta * game.currentTimeSpeed;
            if (this.reloadCooldown <= 0) {
                this.currentAmmo = this.maxAmmo;
                this.isReloading = false;   
            }
            else{
                return;
            }
        }

        // se nao tem mais balas tem de recarregar
        if (this.currentAmmo <= 0) {
            return;
        }

        if (this.isShooting && this.fireCooldown <= 0) {
            this.shoot();
        }
    }

    reload() {
        if (this.currentAmmo == this.maxAmmo || this.isReloading)
            return;
        this.isReloading = true;
        this.reloadCooldown = this.reloadTime;
    }

    stopReloading() {
        if (this.isReloading){
            this.isReloading = false;
            this.reloadCooldown = 0;
        }
        
    }
}

class Pistol extends Gun {
    constructor(mesh,bulletType,accuracyDistance,bulletPosition){
        var damage = 100;
        var bulletSpeed = 15;
        var fireRate = 4; // balas por segundo
        var maxAmmo = 10;
        var reloadTime = 1.5;

        //var pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({color:0x0000ff}));// usar isto para encontrar o ponto
        var pointBulletSpawn = new THREE.Object3D();
        pointBulletSpawn.position.copy(bulletPosition);
        mesh.add(pointBulletSpawn);

        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime,bulletType,pointBulletSpawn,accuracyDistance);

        this.canShot = true; // um disparo por clique do botao
    }

    stopShooting(){
        super.stopShooting();
        this.canShot = true;
    }

    // a pistola so dispara 1 vez por clique do rato
    shoot(){
        if (this.canShot){
            super.shoot();
            this.canShot = false;
        }
    }
}

class Automatic extends Gun {  // TODO mudar o nome
    constructor(mesh, bulletType,accuracyDistance,bulletPosition){
        var damage = 100;
        var bulletSpeed = 20;
        var fireRate = 8; // balas por segundo
        var maxAmmo = 40;
        var reloadTime = 3.5;
        //var pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({color:0x0000ff}));// usar isto para encontrar o ponto
        var pointBulletSpawn = new THREE.Object3D();
        pointBulletSpawn.position.copy(bulletPosition);
        mesh.add(pointBulletSpawn);
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime,bulletType,pointBulletSpawn,accuracyDistance);
    }
}

class EnemyPistol extends Gun { // TODO nao usar mais
    constructor(position,bulletType){
        var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.1,0.1,0.5),
            new THREE.MeshBasicMaterial({color:0x550000}));
        mesh.position.copy(position);

        var damage = 100;
        var bulletSpeed = 40;
        var fireRate = 4; // balas por segundo
        var maxAmmo = 10;
        var reloadTime = 1.5;
        //var pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({color:0x0000ff}));// usar isto para encontrar o ponto
        var pointBulletSpawn = new THREE.Object3D();
        pointBulletSpawn.position.z = -0.2;
        mesh.add(pointBulletSpawn);
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime,bulletType,pointBulletSpawn);

        this.canShot = true; // um disparo por clique do botao
    }
}
