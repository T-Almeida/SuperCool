function Bullet(posicaoOrigem,direcao,speed) {

    this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.05,8,8),
        new THREE.MeshBasicMaterial({color:0x000000}));

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
        console.log("Bullet destroyed");
        game.scene.remove(this.mesh); //remover da cena
        game.objects.splice(index,1); //remover dos objetos ativos
    }
}


function EnemyBullet(posicaoOrigem,direcao,speed) {

    this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.05,8,8),
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
        console.log("Bullet destroyed");
        game.scene.remove(this.mesh); //remover da cena
        game.objects.splice(index,1); //remover dos objetos ativos
    }
}