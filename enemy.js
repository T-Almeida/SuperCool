function Enemy(position) {
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
    // cast and receive shadows
    this.enemyChar.setWireframe (false) ;
    this.enemyChar.enableShadows( true );
    this.enemyChar.setWeapon( 0 );
    //enemyChar.setSkin( i );

    //adicionar ponto de disparo
    //var pointBulletSpawn = new THREE.Object3D();
    this.pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xff0000}));
    this.pointBulletSpawn.position.set(28,13,-10);
    this.enemyChar.meshWeapon.add(this.pointBulletSpawn);
    console.log(this.enemyChar);


    this.mesh = this.enemyChar.root; // redundandte, mas para manter a consistencia
    this.mesh.position.copy(position);

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    var helper = new THREE.Box3Helper( this.meshBB, 0x0000ff );//DEGUB ELEMINAR O HELPER
    game.scene.add( helper );

    this.isSun = false;

    //VARIAVEIS DE CONTROLO DO ENIMIGO
    this.speed = 0.00002;
    this.fireCooldown = 3;
    this.velocityVertical = 0;
    this.enemyMass = 10;
    this.enemyHeight = 1.10;

    //animacao de ataque
    this.attackAniTime = 0.5;
    this.takeShoot = false;
    //dot product de tolerancia usado no lockAtPlayer
    this.dotAngleThreshold = 0.1;
    //tempo para a dumb AI do enimigo
    this.timeLook = 0;

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.enemyHeight + 1);

    this.shoot = function (){

        console.log("shoot");

        var pointBulletVec = new THREE.Vector3(0,0,0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);


        var direction = new THREE.Vector3( 0, 0, 1 ).applyMatrix4(new THREE.Matrix4().extractRotation( this.mesh.matrix ));
        direction.y=0;

        var bullet = new EnemyBullet(pointBulletVec, direction, 15);
        //draw bullet
        bullet.render();

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
        var intersection = this.raycaster.intersectObjects(game.platform.children, true);

        if (intersection.length>=1){
            if (this.mesh.position.y-this.enemyHeight <= intersection[0].point.y) { //colisao com o chao
                if (this.velocityVertical<0) {
                    this.velocityVertical= 0;
                    this.mesh.position.y = intersection[0].point.y+this.enemyHeight;
                }
            }
        }

        this.mesh.translateY(delta * this.velocityVertical);
    };
    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        if (outsideMap(this.mesh.position)) {
            this.mesh.position.y = 40;
            this.velocityVertical = 0;
        }

       // console.log(this.mesh.position)
        //update fisica
        this.updatePhysics(delta);


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
                    self.timeLook = 1+Math.random()*4;
                });//quando terminar de olhar para o player resta timeLook para 5
        }

        //console.log("move " , this.timeLook)

        //this.mesh.rotateY(0.3*delta * superHotConstant);
        //this.mesh.translateZ(-this.speed*delta * superHotConstant);

        //update animation
        this.enemyChar.update(delta * game.currentTimeSpeed);

        this.meshBB.setFromObject(this.mesh); //update bounding box
        this.detectCollision();

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