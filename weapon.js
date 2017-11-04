class Gun {
    constructor(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime){
        this.mesh = mesh;
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
        console.log("ammo "+this.currentAmmo);

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
        if (this.currentAmmo <= 0 && !this.isReloading) {
            this.reload();
            return;
        }
        
        // update do cooldown da disparo
        if (this.fireCooldown>0) this.fireCooldown -= delta;
        // update do cooldown do recarregamento
        if (this.reloadCooldown>0) this.reloadCooldown -= delta;
        
        if (this.isShooting && this.fireCooldown <= 0) {
            this.shoot();
        }

        
    }

    reload() {
        if (this.currentAmmo == this.maxAmmo)
            return;
        console.log("Reload");
        this.isReloading = true;
        this.reloadCooldown = this.reloadTime;
        this.mesh.rotateX(Math.PI / 4);
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
        var fireRate = 3; // balas por segundo
        var maxAmmo = 10;
        var reloadTime = 1;
        super(mesh, damage, bulletSpeed, fireRate, maxAmmo, reloadTime)
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

function Weapon(position, bulletSpeed, ) {

    this.position = position;

    this.bulletSpeed = 50;
    this.rpm = 650;
    this.coolDown = 0;

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1,0.1,0.5),
        new THREE.MeshBasicMaterial({color:0x005555}));

    this.mesh.position.copy(position);

    objetos.push(this);

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta, objectIndex) {
        //update  coolDown
        if (this.coolDown>0) this.coolDown -= delta;
    };

    this.shootBullets = function (delta) {
        var worldVec = new THREE.Vector3(0,0,0);
        this.mesh.localToWorld(worldVec);


        if (this.coolDown <= 0) {
            //criar bala
            var bullet = new Bullet(worldVec, camera.getWorldDirection(), this.bulletSpeed);
            //draw bullet
            bullet.render();
            this.coolDown = 60/this.rpm;
        }


    }


}
