var gun2Audio = new Audio('audio/gun2.mp3');


class Gun {
    constructor(
        mesh, 
        damage, 
        bulletSpeed, 
        fireRate, 
        maxAmmo, 
        magCapacity,
        reloadTime, 
        bulletType, 
        bulletPosition, 
        accuracyDistance,
        spread
        ){
            this.mesh = mesh;
            this.mesh.visible = false;
            this.damage = damage;
            this.bulletSpeed = bulletSpeed;
            this.fireRate = fireRate;
            this.fireCooldown = 0;
            this.maxAmmo = maxAmmo;
            this.magCapacity = magCapacity;
            this.currentAmmo = magCapacity;
            this.reloadTime = reloadTime;
            this.reloadCooldown = 0;
            this.isShooting = false;
            this.isReloading = false;
            this.bulletType = bulletType;
            this.accuracyDistance = accuracyDistance;
            
            this.point = new THREE.Object3D();
            this.point.position.z = - this.accuracyDistance;
            game.controls.getObject().children[0].add(this.point);

            this.pointBulletSpawn = new THREE.Object3D();
            this.pointBulletSpawn.position.copy(bulletPosition);
            mesh.add(this.pointBulletSpawn);

            // bullet spread
            this.spread = spread;
            this.normalizedSpead = spread/accuracyDistance;

            // previous state
            /**
             * 0 - normal
             * 1 - shot
             * 2 - shot half
             * 3 - reloading
             * 4 - out of ammo
             */
            this.changeState(0);
    }

    startShooting(){
        this.isShooting = true;
    }

    stopShooting(){
        this.isShooting = false;
    }

    shoot() {
        if (this.currentAmmo <= 0){
            this.changeState(4);
            return false;
        }

        this.currentAmmo -= 1;

        var pointBulletVec = new THREE.Vector3(0,0,0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);

        var spreadX = Math.random() * this.normalizedSpead * 2 - this.normalizedSpead;
        var spreadY = Math.random() * this.normalizedSpead * 2 - this.normalizedSpead;
        var accPoint = new THREE.Vector3(spreadX,spreadY,0);
        this.point.localToWorld(accPoint);
        accPoint.sub(pointBulletVec);
        
        //criar bala
        var bullet = bPool.allocate();
        bullet.activate(this.damage, pointBulletVec, accPoint.normalize(), this.bulletSpeed, true);

        this.fireCooldown = 1/this.fireRate;

        this.changeState(1); // SHOT  

        updateWeaponHUD(this);
        return true;
    }

    changeState(state){
        this.previousState = state;
        switch(state){
            case 0:
            case 2:
                this.mesh.rotation.x = 0;
                crosshair.r = 10 + this.spread;
                crosshair.stroke = "white";
                break;
            case 1:
                this.mesh.rotation.x = Math.PI / 32;
                crosshair.r = 12 + this.spread;
                crosshair.stroke = "white";
                break;
            case 3:
                this.mesh.rotation.x = Math.PI / 4;
                crosshair.stroke = "none";
                break;
            case 4:
                this.mesh.rotation.x = 0;
                crosshair.r = 10 + this.spread;
                crosshair.stroke = "red";
                break;
        }
        updateWeaponHUD(this);
        updateReloadHUD(this);
        
    }

    update(delta, objectIndex) {
        switch (this.previousState) {
            case 0: // NORMAL
                if (this.isShooting) {
                    this.shoot();
                }
                break;
            case 1: // SHOT : já disparou antes
                this.fireCooldown -= delta * game.currentTimeSpeed;
                
                if (this.fireCooldown<0){ // fire cooldown finished
                    if (this.currentAmmo<=0)
                        this.changeState(4);
                    else if (this.isShooting)
                        this.shoot();
                    else
                        this.changeState(0);
                } 
                else if ( this.fireCooldown < 1/(this.fireRate*3) ) {
                    if (this.currentAmmo <= 0)
                        this.changeState(4);
                    else
                        this.changeState(2);
                }
                break;
            case 2: // HALF SHOT
                this.fireCooldown -= delta * game.currentTimeSpeed;
                if (this.fireCooldown<0){ // fire cooldown finished
                    if (this.isShooting)
                        this.shoot();
                    else
                        this.changeState(0);
                } 
                break;
            case 3: // RELOADING : 
                this.reloadCooldown -= delta * game.currentTimeSpeed;

                if (this.reloadCooldown<0){ // reload cooldown finished

                    if (this.maxAmmo==-1){ // infinite bullets
                        this.currentAmmo = this.magCapacity;
                    } else {
                        var bulletsNeeded = this.magCapacity - this.currentAmmo;
                        if (this.maxAmmo <= bulletsNeeded) {
                            this.currentAmmo += this.maxAmmo;
                            this.maxAmmo = 0;
                        } else {
                            this.maxAmmo -= bulletsNeeded;
                            this.currentAmmo = this.magCapacity;
                        }
                    }
                    
                    this.stopReloading();

                    if (this.isShooting) 
                        this.shoot();
                    else
                        this.changeState(0);
                }

                updateReloadHUD(this);
                break;
            case 4: // OUT OF AMMO
                break;
        }
    }

    reload() {
        if (this.currentAmmo == this.magCapacity || this.isReloading || this.maxAmmo == 0)
            return;
        this.isReloading = true;
        this.reloadCooldown = this.reloadTime;
        this.changeState(3); // reload
    }

    stopReloading() {
        if (this.isReloading){
            this.isReloading = false;
            this.reloadCooldown = 0;
        }
        if (this.currentAmmo<=0)
            this.changeState(4); // out of ammo
        else if (this.fireCooldown > 1/(this.fireRate*3))
            this.changeState(2); // shot
        else if (this.fireCooldow > 0)
            this.changeState(1);
        else 
            this.changeState(0); // normal
        
    }

    
}

class Pistol extends Gun {
    constructor(mesh, bulletType, accuracyDistance, spread, bulletPosition){
        var damage = 100;
        var bulletSpeed = 15;
        var fireRate = 4; // balas por segundo
        var maxAmmo = -1;// infinite
        var magCapacity = 10; 
        var reloadTime = 1.5;

        super(
            mesh, 
            damage, 
            bulletSpeed, 
            fireRate, 
            maxAmmo, 
            magCapacity,
            reloadTime, 
            bulletType, 
            bulletPosition, 
            accuracyDistance,
            spread
        );
        
        this.canShot = true; // um disparo por clique do botao
    }

    stopShooting(){
        super.stopShooting();
        this.canShot = true;
    }

    // a pistola so dispara 1 vez por clique do rato
    shoot(){
        if (this.canShot){
            if (super.shoot()) {
                var gun1Audio = new Audio('audio/gun2.mp3');
                gun1Audio.play();
            }
            this.canShot = false;
        }

    }
}

class Automatic extends Gun { 
    constructor(mesh, bulletType,accuracyDistance,spread,bulletPosition){
        var damage = 100;
        var bulletSpeed = 20;
        var fireRate = 4.5; // balas por segundo
        var maxAmmo = 200;
        var magCapacity = 40;
        var reloadTime = 3.5;
        
        super(mesh, 
            damage, 
            bulletSpeed, 
            fireRate, 
            maxAmmo, 
            magCapacity,
            reloadTime,
            bulletType,
            bulletPosition,
            accuracyDistance, 
            spread
        );
    }

    shoot(){
        if (super.shoot()){
            var gunAudio = new Audio('audio/gun1.mp3');
            gunAudio.play();
        }
    }
}
