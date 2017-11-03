//Objeto especial para acelerar as colisoes
function Bullet(posicaoOrigem,direcao,speed) {

    this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.05,8,8),
        new THREE.MeshBasicMaterial({color:0xff0000}));

    this.mesh.position.copy(posicaoOrigem);

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        if (outsideMap(this.mesh.position)){ //destuir bala
            console.log("Bullet destroyed");
            scene.remove(this.mesh); //remover da cena
            objetos.splice(objectIndex,1); //remover dos objetos ativos
            return ;
        }

        this.mesh.translateOnAxis( direcao, speed * delta);
    };

    this.draw = function () {
        return this.mesh;
    }
}