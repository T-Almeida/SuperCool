function Bullet() {
    var defaultPosition = new THREE.Vector3(0, -20, 0);
    var defaultDirection = new THREE.Vector3(0, 0, 0);
    var axis = new THREE.Vector3(0, 1, 0);

    this.direction = defaultDirection;
    this.speed = 0;
    this.active = false;

    var mat = new THREE.MeshPhongMaterial( {emissive: colorWhite} );
    var trailMat = new THREE.MeshPhongMaterial( {emissive: colorSecondary}); //, transparent:true, opacity:0.5} );
    
    var bulletSize = 0.02;
    var trailSize = 2;
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(bulletSize, 4, 4), mat);
    this.trail = new THREE.Mesh(new THREE.CylinderGeometry(bulletSize, 0 , trailSize, 3 ), trailMat);
    this.mesh.add(this.trail);

    this.mesh.position.set(defaultPosition);
    game.scene.add(this.mesh);
        
    var self = this;    
    
    this.setPosition = function(position) {
        this.mesh.position.copy(position);
    }

    this.update = function (delta, objectIndex) {

        if ( outsideMap(this.mesh.position) ){ 
            this.destroy(objectIndex);
            return ;
        }

        this.mesh.translateOnAxis( this.direction, this.speed * delta * game.currentTimeSpeed);
    };

    this.activate = function (position, direction, speed) {
        this.setPosition(position);
        this.direction = direction;
        this.speed = speed;
        this.active = true;
        game.bullets.push(this);
        
        this.trail.quaternion.setFromUnitVectors(axis, direction);  // rotação do trail
        // posição do trail atraz da bala
        this.trail.position.x = - direction.x * trailSize / 2;
        this.trail.position.y = - direction.y * trailSize / 2;
        this.trail.position.z = - direction.z * trailSize / 2;
    };

    this.destroy = function(index){
        game.bullets.splice(index,1); //remover dos objetos ativos
        bPool.free(this);
        this.setPosition(defaultPosition);
        this.direction = defaultDirection;

    }
}


function EnemyBullet(posicaoOrigem,direcao,speed) {

    this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2,8,8),
        new THREE.MeshBasicMaterial({color:0xff0000}));

    this.mesh.position.copy(posicaoOrigem);

    var self = this;

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        if (outsideMap(this.mesh.position)){ //destuir bala
            this.destroy(objectIndex);
            return ;
        }

        this.mesh.translateOnAxis( direcao, speed * delta * game.currentTimeSpeed);

    };

    this.render = function () {
        game.objects.push(this);
        game.scene.add(this.mesh);
    };

    this.destroy = function(index){
        //console.log("Bullet destroyed");
        game.scene.remove(this.mesh); //remover da cena
        game.objects.splice(index,1); //remover dos objetos ativos
    }
}

function BulletPool() {
    this.totalPooled = 0;
    this.totalUsed = 0;

    var pool = [];

    // função interna
    this.createBullet = function() {
        var bullet = new Bullet();
        pool.push(bullet);
        this.totalPooled += 1;
        return bullet;
    }

    this.init = function(number) {
        for (var i=0; i<number; i++){
            this.createBullet();
        }
    }

    this.allocate = function() {
        var bullet;
        // se está a usar todas as balas que existem tem de criar uma nova
        if (this.totalUsed === this.totalPooled) {
            bullet = this.createBullet();
        } else {
            bullet = pool.pop();
            this.totalUsed += 1;
        }
        return bullet;
    }

    this.free = function(bullet) {
        if (!bullet.active) return;

        bullet.active = false;
        pool.push(bullet);
        this.totalUsed -= 1;
    }
}