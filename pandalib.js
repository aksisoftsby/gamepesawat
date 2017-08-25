note //
SceneTitle = game.Scene.extend
game audio :: game.audio.playMusic("audio/PiggybackRideLoop.m4a");

init : function(id, y, opt_options, a) {
      var options = opt_options || game.scene.unlockedBees.random();
      var settings = this.getBeeData(options);
      if (game.merge(this, settings), "ThreeBanded" === this.name && (this.steerDir = Math.random() > 0.5 ? 1 : -1), this._steerSpeed = this.steerSpeed, this.setSpeed(this.lowSpeed), this.dirVector = new game.Vector, this.pathContainer = new game.Container, game.scene.pathContainer.addChild(this.pathContainer), this.sprite = new game.Animation(this.name + "Fly01.png", this.name + "Fly02.png", this.name + "Fly03.png", this.name + "Fly04.png", this.name + "Fly05.png", this.name + "Fly06.png", this.name + 
      "Fly07.png", this.name + "Fly08.png"), this.sprite.animationSpeed = 1, this.sprite.play(), this.sprite.anchor.set(0.5, 0.5), this.sprite.interactive = true, this.sprite.mousedown = this.mousedown.bind(this), this.sprite.touchstart = this.touchstart.bind(this), game.config.useShadows && (this.shadow = new game.Animation(this.name + "Fly01.png", this.name + "Fly02.png", this.name + "Fly03.png", this.name + "Fly04.png", this.name + "Fly05.png", this.name + "Fly06.png", this.name + "Fly07.png", 
      this.name + "Fly08.png"), this.shadow.animationSpeed = this.sprite.animationSpeed, this.shadow.play(), this.shadow.anchor.set(0.5, 0.5), this.shadow.scale.set(0.47, 0.47), this.shadow.alpha = 0.2, this.shadow.position.set(0, 250), game.config.useTint && (this.shadow.tint = 928595), game.scene.shadowContainer.addChild(this.shadow)), "Queen" === this.name) {
        var sprite = new game.Sprite("noGrabQueen.png");
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(0, 0);
        this.sprite.addChild(sprite);
		
TitleBee