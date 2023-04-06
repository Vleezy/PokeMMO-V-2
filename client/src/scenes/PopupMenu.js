import { Scene } from "phaser";

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class PopupMenu extends Scene {
  constructor() {
    super("PopupMenu");
  }

  preload() {}

  create(scene) {
    var items = [
      {
        name: "Joueur",
        children: [
          {
            name: "AA-0",
            children: [{ name: "AA-00" }, { name: "AA-01" }, { name: "AA-02" }],
          },
          {
            name: "AA-1",
            children: [{ name: "AA-10" }, { name: "AA-11" }, { name: "AA-12" }],
          },
          {
            name: "AA-2",
            children: [{ name: "AA-20" }, { name: "AA-21" }, { name: "AA-22" }],
          },
        ],
      },
      {
        name: "BB",
        children: [{ name: "BB-0" }, { name: "BB-1" }, { name: "BB-2" }],
      },
      {
        name: "CC",
        children: [{ name: "CC-0" }, { name: "CC-1" }, { name: "CC-2" }],
      },
    ];

    var scene = this,
      menu = undefined;
    this.print = this.add.text(0, 0, "");
    this.input.on(
      "pointerdown",
      function (pointer) {
        if (menu === undefined) {
          menu = CreateMenu(
            scene,
            pointer.x,
            pointer.y,
            items,
            function (button) {
              scene.print.text += "Click " + button.text + "\n";
            }
          );
        } else if (!menu.isInTouching(pointer)) {
          // menu.collapse(); // Auto collapsing if `pointerDownOutsideCollapsing: true`
          menu = undefined;
          scene.print.text = "";
        }
      },
      this
    );
  }

  update() {}
}

var CreateMenu = function (scene, x, y, items, onClick) {
  var exapndOrientation = "y";
  var easeOrientation = "y";

  var menu = scene.rexUI.add.menu({
    x: x,
    y: y,
    orientation: exapndOrientation,
    // subMenuSide: 'right',

    items: items,
    createBackgroundCallback: function (items) {
      var scene = items.scene;
      return scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, COLOR_PRIMARY);
    },

    createButtonCallback: function (item, i, items) {
      return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0),
        text: scene.add.text(0, 0, item.name, {
          fontSize: "20px",
        }),
        icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
          icon: 10,
        },
      });
    },

    // easeIn: 500,
    easeIn: {
      duration: 500,
      orientation: easeOrientation,
    },

    // easeOut: 100,
    easeOut: {
      duration: 100,
      orientation: easeOrientation,
    },

    // expandEvent: 'button.over',

    // pointerDownOutsideCollapsing: false,

    // space: { item: 10 }
  });

  menu
    .on("button.over", function (button) {
      button.getElement("background").setStrokeStyle(1, 0xffffff);
    })
    .on("button.out", function (button) {
      button.getElement("background").setStrokeStyle();
    })
    .on("button.click", function (button) {
      onClick(button);
    })
    .on("popup.complete", function (subMenu) {
      console.log("popup.complete");
    })
    .on("scaledown.complete", function () {
      console.log("scaledown.complete");
    });

  return menu;
};
