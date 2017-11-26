//ESTRUTURA MUITO ABERTA ainda a depender de ver como ficam os boosts laterais
function Boost(postion,actionFunction) {
    this.position = postion;
    this.actionFunction = actionFunction;
    this.thresholdDistance = 1.6;

    var self = this;

    this.update = function(posObject){
        if (posObject.distanceTo(postion)<this.thresholdDistance){//conta o valor de Y por isso deve ser descontada a altura dos objetos
            this.actionFunction();// aplicação de forças para o jump!
        }
    }


}