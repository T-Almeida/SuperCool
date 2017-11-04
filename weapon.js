class Gun {
    constructor(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime){
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

        if (this.fireCooldown <= 0) {
            //criar bala
            var bullet = new Bullet(worldVec, camera.getWorldDirection(), this.bulletSpeed);
            //draw bullet
            bullet.render();
            this.fireCooldown = 1/this.fireRate;
        }
    }

    update(delta, objectIndex) {
        if (this.isReloading){
            this.reloadCooldown -= delta;
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
        if (this.fireCooldown>0) this.fireCooldown -= delta;
        
        if (this.isShooting && this.fireCooldown <= 0) {
            this.shoot();
        }

        
    }

    reload() {
        if (this.currentAmmo == this.maxAmmo)
            return;
        this.isReloading = true;
        this.reloadCooldown = this.reloadTime;
        this.mesh.rotateX(Math.PI / 4);
    }

    stopReloading() {
        if (this.isReloading){
            this.isReloading = false;
            this.mesh.rotateX( - Math.PI / 4);
        }
        
    }
}

class Pistol extends Gun {
    constructor(position){
        var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.1,0.1,0.5),
            new THREE.MeshBasicMaterial({color:0x550000}));
        mesh.position.copy(position);

        var damage = 20;
        var bulletSpeed = 70;
        var fireRate = 100; // balas por segundo
        var maxAmmo = 10;
        var reloadTime = 1;
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime)

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
    constructor(position){
        var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.12,0.15,0.7),
            new THREE.MeshBasicMaterial({color:0x005500}));
        mesh.position.copy(position);

        var damage = 5;
        var bulletSpeed = 100;
        var fireRate = 8; // balas por segundo
        var maxAmmo = 40;
        var reloadTime = 2.5;
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime)
    }
}
