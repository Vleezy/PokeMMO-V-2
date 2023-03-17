export const attributeKeys = (self) => {
  const keys = self.scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.Z,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.Q,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    cross: "R",
  });
  const isLeftPressed = keys.left.isDown;
  const isRightPressed = keys.right.isDown;
  const isUpPressed = keys.up.isDown;
  const isDownPressed = keys.down.isDown;
  const isShiftPressed = keys.shift.isDown;
  const isCrossCliqued = Phaser.Input.Keyboard.JustDown(keys.cross);

  if (isCrossCliqued) {
    self.isCrossActivated = !self.isCrossActivated;
    console.log("isCrossActivated", self.isCrossActivated);
    if (self.isCrossActivated) {
      self.scene.gridEngine.setSpeed("player", 7);
      self.scene.gridEngine.setWalkingAnimationMapping("player", 2);
    } else {
      self.scene.gridEngine.setSpeed("player", 3);
      self.scene.gridEngine.setWalkingAnimationMapping("player", 0);
    }
  }

  if (isShiftPressed && !self.isCrossActivated) {
    self.scene.gridEngine.setSpeed("player", 4);
    self.scene.gridEngine.setWalkingAnimationMapping("player", 1);
  } else if (!self.isCrossActivated) {
    self.scene.gridEngine.setSpeed("player", 3);
    self.scene.gridEngine.setWalkingAnimationMapping("player", 0);
  }

  if (isLeftPressed) {
    self.scene.gridEngine.move("player", "left");
  } else if (isRightPressed) {
    self.scene.gridEngine.move("player", "right");
  } else if (isUpPressed) {
    self.scene.gridEngine.move("player", "up");
  } else if (isDownPressed) {
    self.scene.gridEngine.move("player", "down");
  }
};
