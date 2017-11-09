function Enemy(position) {

    this.controls = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        attack: false
    };

    this.enemyChar = new THREE.MD2CharacterComplex();
    this.enemyChar.scale = 0.5;
    this.enemyChar.controls = this.controls;
    this.enemyChar.shareParts( loader.enemy );
    // cast and receive shadows
    this.enemyChar.setWireframe (false) ;
    this.enemyChar.enableShadows( true );
    this.enemyChar.setWeapon( 0 );
    //enemyChar.setSkin( i );
    console.log(this.enemyChar);
    this.mesh = this.enemyChar.root // redundandte, mas para manter a consistencia

    this.mesh.position.copy(position);

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    var helper = new THREE.Box3Helper( this.meshBB, 0x0000ff );
    game.scene.add( helper );

    //adicionar o disparo
    var pointBulletSpawn3 = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.1), new THREE.MeshBasicMaterial({color:0x0000ff}));// usar isto para encontrar o ponto

    this.enemyChar.weapons[0].add(pointBulletSpawn3);
    //var pointBulletSpawn = new THREE.Object3D();
    this.pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xff0000}));
    this.pointBulletSpawn.position.set(28,13,-10);
    console.log("pos " + strVector(this.pointBulletSpawn.position));
   // this.mesh.children[1].children[0].add(pointBulletSpawn);
    this.enemyChar.meshWeapon.add(this.pointBulletSpawn);

    this.isSun = false;

    this.speed = 10;

    this.fireCooldown = 3;

    this.controls.moveForward = true;

    this.attackAniTime = 0.5;
    this.takeShoot = false;


    this.shoot = function (){

        console.log("shoot");

        var pointBulletVec = new THREE.Vector3(0,0,0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);


        var direction = new THREE.Vector3( 0, 0, 1 ).applyMatrix4(new THREE.Matrix4().extractRotation( this.mesh.matrix ));
        direction.y=0;

        var bullet = new EnemyBullet(pointBulletVec, direction, 80);
        //draw bullet
        bullet.render();

    };


    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex){




        if (this.fireCooldown<=0) {
            this.controls.attack = true;
            this.fireCooldown = 3;
        }

        if (this.fireCooldown>0) this.fireCooldown -= delta * game.currentTimeSpeed;

        if (this.controls.attack){
            this.attackAniTime -= delta * game.currentTimeSpeed;

            if (this.attackAniTime<0.25 && !this.takeShoot){//dispara quando shoot = 0.5-0.25 time total ani 0.5
                this.shoot();
                this.takeShoot = true;//impedir outros disparos enquanto a animação de attack n termina
            }

            if (this.attackAniTime<0){
                this.attackAniTime = 0.5;
                this.controls.attack = false; // reset animação
                this.takeShoot = false // pode disparar novamente
            }
        }

        //update animation
        this.enemyChar.update(delta*game.currentTimeSpeed);


        //look at player
        //this.mesh.lookAt(game.controls.getObject().position);



        //this.mesh.rotateY(0.3*delta * superHotConstant);
        //this.mesh.translateZ(-this.speed*delta * superHotConstant);

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