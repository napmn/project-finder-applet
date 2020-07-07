const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;
const Settings = imports.ui.settings;
const St = imports.gi.St;
const Util = imports.misc.util;


const UUID = "project-loader@napmn";
const APPLET_PATH = global.userdatadir + "/applets/" + UUID;
const USER_CONFIGS_PATH = APPLET_PATH + '/project_loader/configs/user_configs';
const ICONS_PATH = APPLET_PATH + '/project_loader/icons';
const ICON = APPLET_PATH + "/icon.png";
const PYTHON_PATH = APPLET_PATH + '/project_loader/venv/bin/python';


function ProjectMenuItem() {
    this._init.apply(this, arguments);
}

ProjectMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(config, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);
        this.config = config;
        let iconFile = Gio.file_new_for_path(ICONS_PATH + '/' + this.config.icon_filename);
        if (iconFile.query_exists(null)) {
            let gIcon = new Gio.FileIcon({file: iconFile});
            this.icon = new St.Icon(
                {
                    gicon: gIcon,
                    icon_size: 24,
                    icon_type: St.IconType.FULLCOLOR,
                    // style_class: "nejakacssclassa"
                }
            )
            this.addActor(this.icon);
        }
        this.label = new St.Label({text: config.name})
        this.addActor(this.label);
        this.pfArg = '--find-project'
        if (this.config.hasOwnProperty('config_name')) {
            this.pfArg = '--project-config=' + this.config.config_name;
        }
        this.connect('activate', function(actor, event) {
            Util.spawnCommandLine(
                'gnome-terminal --working-directory=' + APPLET_PATH +
                ' -x zsh -c "' + PYTHON_PATH + ' project_loader/project_loader.py ' + this.pfArg + '"'
            );
        }.bind(this));
    }
}


function ProjectFinder(metadata, orientation, panelHeight, instanceId) {
    this._init(orientation, panelHeight, instanceId);
}


ProjectFinder.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

		this.set_applet_icon_path(ICON);
        this.set_applet_tooltip("Click to load project");

        // Menu
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);
        this._display();
    },

    _display: function() {
        // Find project item
        this.findProjectItem = new ProjectMenuItem(
            {
                name: 'Find project',
                icon_filename: 'search.png'
            }
        )
        this.menu.addMenuItem(this.findProjectItem);

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let parsedConfigs = this._load_configs();
        this.predefinedConfigs = [];
        for (let i = 0; i < parsedConfigs.length; i++) {
            this.predefinedConfigs[i] = new ProjectMenuItem(parsedConfigs[i]);
            this.menu.addMenuItem(this.predefinedConfigs[i]);
        }
    },

    _load_configs: function() {
        let parsedConfigs = [];
        let configDir = Gio.file_new_for_path(USER_CONFIGS_PATH);
        let fileEnumerator = configDir.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);

        // iterate over contents of config folder
        while((file = fileEnumerator.next_file(null)) !== null) {
            if (file.get_file_type() === Gio.FileType.REGULAR && file.get_name() !== 'template.json') {
                try {
                    let configFile = Gio.file_new_for_path(USER_CONFIGS_PATH + '/' + file.get_name());
                    let [ok, data, etag] = configFile.load_contents(null);
                    if (ok) {
                        let parsedConfig = JSON.parse(data);
                        parsedConfig.config_name = file.get_name().split('.')[0];
                        parsedConfigs.push(parsedConfig);
                    } else {
                        global.log('Could not read config file ' + file.get_name());
                    }
                } catch(e) {
                    global.log('Exception occured: ' + e);
                }
            }
        }
        return parsedConfigs;
    },

    on_applet_clicked: function(event) {
        this.menu.toggle()
    }
}


function main(metadata, orientation, panelHeight, instanceId) {
	return new ProjectFinder(metadata, orientation, panelHeight, instanceId);
}
