const Util = imports.misc.util;
const Applet = imports.ui.applet;


const UUID = "project-loader@napmn";
const APPLET_PATH = global.userdatadir + "/applets/" + UUID;
const ICON = APPLET_PATH + "/icon.png";


function ProjectFinder(orientation, panelHeight, instanceId) {
    this._init(orientation, panelHeight, instanceId);
}


ProjectFinder.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

		// this.set_applet_icon_path(ICON);
        this.set_applet_tooltip("Click to search for project");
    },

    on_applet_clicked: function(event) {
        Util.spawnCommandLine('gnome-terminal');
    }
}


function main(metadata, orientation, panelHeight, instanceId) {
	return new ProjectFinder(metadata, orientation, panelHeight, instanceId);
}
