function Enemy() {
    var defaultPosition = new THREE.Vector3(0, -20, 0);
    var self = this;

    this.controls = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        attack: false
    };

    //preparação do modelo
    this.enemyChar = new THREE.MD2CharacterComplex();
    this.enemyChar.scale = 2/50;
    this.enemyChar.controls = this.controls;
    this.enemyChar.shareParts( loader.enemy );
    this.enemyChar.setWireframe (true) ;
    this.enemyChar.setWeapon( 0 );
    //enemyChar.setSkin( i );
    //adicionar ponto de disparo
    this.pointBulletSpawn = new THREE.Object3D();
    //this.pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xff0000}));
    this.pointBulletSpawn.position.set(28,13,-10);
    this.bulletSpeed = 15;
    this.enemyChar.meshWeapon.add(this.pointBulletSpawn);
    this.isDying = false;

    this.mesh = this.enemyChar.root; // redundandte, mas para manter a consistencia
    this.mesh.position.copy(defaultPosition);
    this.mesh.name="enemy";

    this.isSun = false;

    //VARIAVEIS DE CONTROLO DO ENIMIGO
    this.fireCooldown = 3;
    this.velocityVertical = 0;
    this.enemyMass = 5;
    this.enemyHeight = 1.10;
    this.enemyDamage = 20;
    this.health = 100;
    this.aimbotThreshold = 0.55;

    

    //animacao de ataque
    this.attackAniTime = 0.5;
    this.takeShoot = false;
    //dot product de tolerancia usado no lockAtPlayer
    this.dotAngleThreshold = 0.1;
    //tempo para a dumb AI do enimigo
    this.timeLook = 0;

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.enemyHeight + 1);

    this.boosts = []; //lista de boost que se aplicam aos enimigos
    var enemyBoost = function() {
        self.velocityVertical = 16;
    };
    var boostPos = new THREE.Vector3(0,0,0);
    this.boosts.push(new Boost(boostPos,enemyBoost));
    var boostCoord = 17;
    boostPos = new THREE.Vector3(boostCoord,0,boostCoord);
    this.boosts.push(new Boost(boostPos,enemyBoost));
    boostPos = new THREE.Vector3(-boostCoord,0,boostCoord);
    this.boosts.push(new Boost(boostPos,enemyBoost));
    boostPos = new THREE.Vector3(boostCoord,0,-boostCoord);
    this.boosts.push(new Boost(boostPos,enemyBoost));
    boostPos = new THREE.Vector3(-boostCoord,0,-boostCoord);
    this.boosts.push(new Boost(boostPos,enemyBoost));

    this.shoot = function () {
        var pointBulletVec = new THREE.Vector3(0, 0, 0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);

        var direction = new THREE.Vector3(0, 0, 1).applyMatrix4(new THREE.Matrix4().extractRotation(this.mesh.matrix));
        //vetor na direao do player EP = P-E
        var dirEP = new THREE.Vector3().subVectors(game.controls.getObject().position, this.mesh.position);

        var cos = (direction.x * dirEP.x + direction.y * dirEP.y + +direction.z * dirEP.z) / (direction.length() + dirEP.length());

        if (cos > this.aimbotThreshold) {
            //autoaim
            direction = dirEP;
        } else {
            direction.y = 0;
        }
        var bullet = bPool.allocate();
        bullet.activate(this.enemyDamage, pointBulletVec, direction, this.bulletSpeed, false);
    };


    this.lookAtPlayer = function (callback) {
        //vetor na direcao do player EP = P-E
        var dirEnyPlayer = new THREE.Vector3().subVectors(game.controls.getObject().position, this.mesh.position);
        var dirEny = new THREE.Vector3(0, 0, 1).applyMatrix4(new THREE.Matrix4().extractRotation(this.mesh.matrix));
        //var angle = this.mesh.position.angleTo(game.controls.getObject().position);

        dirEnyPlayer.y = 0;
        dirEny.y = 0;
        var dot = dirEny.x * -dirEnyPlayer.z + dirEny.z * dirEnyPlayer.x;

        if (dot > this.dotAngleThreshold) {//esquerda
            this.controls.moveRight = false;
            this.controls.moveLeft = true;
        } else if (dot < -this.dotAngleThreshold) {//direita
            this.controls.moveRight = true;
            this.controls.moveLeft = false;
        } else {
            this.controls.moveRight = false;
            this.controls.moveLeft = false;

            callback();
        }
    };
    this.updatePhysics = function (delta) {
        this.velocityVertical -= game.gravity * this.enemyMass * delta * game.currentTimeSpeed;  // força gravitica

        this.raycaster.ray.origin.copy(this.mesh.position);
        var intersection = this.raycaster.intersectObjects(game.floors.children, true);

        if (intersection.length>=1){
            if (this.mesh.position.y-this.enemyHeight <= intersection[0].point.y) { //colisao com o chao
                if (this.velocityVertical<0) {
                    this.velocityVertical= 0;
                    this.mesh.position.y = intersection[0].point.y+this.enemyHeight;
                }
            }
        }

        this.mesh.translateY(delta * this.velocityVertical* game.currentTimeSpeed);
    };
    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        if (!this.active) return;




        //update fisica

        if (this.isDying){
            this.dyingAnimation(delta, objectIndex);
            return;
        }

        
        if (outsideMap(this.mesh.position)) {
            this.mesh.position.y = 40;
            this.velocityVertical = 0;
        }
        this.updatePhysics(delta);
        
        //aplicar lógica dos boosts
        for (var i = 0;i<this.boosts.length; i++) {
            this.boosts[i].update(new THREE.Vector3().subVectors(this.mesh.position,new THREE.Vector3(0,this.enemyHeight,0)))//ver se é preciso passar o delta
        }

        

        if (this.fireCooldown <= 0) {
            this.controls.attack = true;
            this.fireCooldown = 3;
        }

        if (this.fireCooldown > 0) this.fireCooldown -= delta * game.currentTimeSpeed;

        if (this.controls.attack) { //animacao de ataque sincronizada apartir dos controls
            this.attackAniTime -= delta * game.currentTimeSpeed;

            if (this.attackAniTime < 0.25 && !this.takeShoot) {//dispara quando shoot = 0.5-0.25 time total ani 0.5
                this.shoot();
                this.takeShoot = true;//impedir outros disparos enquanto a animação de attack n termina
            }

            if (this.attackAniTime < 0) {
                this.attackAniTime = 0.5;
                this.controls.attack = false; // reset animação
                this.takeShoot = false // pode disparar novamente
            }
        }


        //dumb IA
        
        if (this.timeLook > 0) { // VAI EM FRENTE
            this.timeLook -= delta * game.currentTimeSpeed;
            this.controls.moveForward = true;
        }else{                  // OLHA PARA O PLAYER
            this.controls.moveForward = false;
                this.lookAtPlayer(function(){
                    self.timeLook = 1+Math.random();
                });//quando terminar de olhar para o player resta timeLook para 1+random
        }


        //this.mesh.rotateY(0.3*delta * superHotConstant);
        //this.mesh.translateZ(-this.speed*delta * superHotConstant);


        //update animation
        this.enemyChar.update(delta*game.currentTimeSpeed);

    };

    this.render = function () {
        game.scene.add(this.mesh);
    };

    this.damage = function(damage, index, direction) {
        this.health -= damage;
        if (this.health <= 0){
            this.isDying = true;
            game.score += 1;
            scoreDiv.innerHTML = game.score;
        }
    };

    this.activate = function (position) {
        this.active = true;
        this.isDying = false;

        // main model
        this.mesh.children[0].materialWireframe.opacity = 1;
        this.mesh.children[0].materialWireframe.transparent = true;
        this.mesh.children[0].materialWireframe.emissive = colorSecondary;
        this.mesh.children[0].materialWireframe.color = colorSecondary;

         // gun
         this.mesh.children[1].materialWireframe.opacity = 1;
         this.mesh.children[1].materialWireframe.transparent = true;
         this.mesh.children[1].materialWireframe.emissive = colorSecondary;
         this.mesh.children[1].materialWireframe.color = colorSecondary;

        this.health = 100;
        game.enemies.push(this);
        this.setPosition(position);

    };

    this.destroy = function(index){
        game.enemies.splice(index,1); //remover dos objetos ativos
        enemyPool.free(this);
        this.setPosition(defaultPosition);
    };

    this.setPosition = function(position) {
        this.mesh.position.copy(position);
    };

    this.dyingAnimation = function(delta, index) {
        var ratio = 1 - 2 * delta * game.currentTimeSpeed
        this.mesh.children[0].materialWireframe.emissive = colorRed;
        this.mesh.children[0].materialWireframe.color = colorRed;
        this.mesh.children[0].materialWireframe.opacity *= ratio; 
        this.mesh.children[1].materialWireframe.emissive = colorRed;
        this.mesh.children[1].materialWireframe.color = colorRed;
        this.mesh.children[1].materialWireframe.opacity *= ratio;
        
        if (this.mesh.children[0].materialWireframe.opacity < 0.2) {
            this.destroy(index);
        }
    }
}


function EnemyPool() {
    this.totalPooled = 0;
    this.totalUsed = 0;
    this.pool = [];

    // função interna
    this.createEnemy = function() {
        var enemy = new Enemy();
        enemy.render();
        this.totalPooled += 1;
        this.pool.push(enemy);
        return enemy;
    };

    this.init = function(number) {
        for (var i=0; i<number; i++){
            this.createEnemy();
        }
        this.refreshUI();
        
    };

    this.allocate = function() {
        var enemy;
        if (this.totalUsed === this.totalPooled) {
            enemy = this.createEnemy();
        } else {
            enemy = this.pool.pop();
            this.totalUsed += 1;
        }

        this.refreshUI();
        
        return enemy;
    };

    this.free = function(enemy) {
        if (!enemy.active) return;

        enemy.active = false;
        this.pool.push(enemy);
        this.totalUsed -= 1;

        this.refreshUI();
    };

    this.refreshUI = function() {
        enemyPoolInfo.innerHTML = this.totalUsed + " / " + this.totalPooled;
    }
}