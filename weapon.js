class Gun {
    constructor(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime, bulletType){
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
    }

    startShooting(){
        this.isShooting = true;
    }

    stopShooting(){
        this.isShooting = false;
    }

    shoot() {
        this.currentAmmo -= 1;
        var worldVec = new THREE.Vector3(0,0,0);
        this.mesh.localToWorld(worldVec);

        //criar bala
        var bullet = new this.bulletType(worldVec, new THREE.Vector3(0,0,-1).applyQuaternion(this.mesh.getWorldQuaternion()), this.bulletSpeed);
        //draw bullet
        bullet.render();
        this.fireCooldown = 1/this.fireRate;
    }

    update(delta, objectIndex) {
        if (this.isReloading){
            this.reloadCooldown -= delta * currentTimeSpeed;
            if (this.reloadCooldown <= 0) {
                this.currentAmmo = this.maxAmmo;
                this.isReloading = false;   
                this.mesh.rotateX(- Math.PI / 4);          
            }
            else{
                return;
            }
        }
        // se nao tem mais balas tem de recarregar
        if (this.currentAmmo <= 0) {
            return;
        }
        
        // update do cooldown da disparo
        if (this.fireCooldown>0) this.fireCooldown -= delta * currentTimeSpeed;
        
        if (this.isShooting && this.fireCooldown <= 0) {
            this.shoot();
        }

        
    }

    reload() {
        if (this.currentAmmo == this.maxAmmo || this.isReloading)
            return;
        this.isReloading = true;
        this.reloadCooldown = this.reloadTime;
        this.mesh.rotateX(Math.PI / 4);
    }

    stopReloading() {
        if (this.isReloading){
            this.isReloading = false;
            this.reloadCooldown = 0;
            this.mesh.rotateX( - Math.PI / 4);
        }
        
    }
}

class Pistol extends Gun {
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
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime,bulletType)

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
    constructor(position,bulletType){
        var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.12,0.15,0.7),
            new THREE.MeshBasicMaterial({color:0x005500}));
        mesh.position.copy(position);

        var damage = 100;
        var bulletSpeed = 40;
        var fireRate = 8; // balas por segundo
        var maxAmmo = 40;
        var reloadTime = 3.5;
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime,bulletType)
    }
}
