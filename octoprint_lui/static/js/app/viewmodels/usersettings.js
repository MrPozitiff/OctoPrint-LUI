$(function () {
    function UserSettingsViewModel(parameters) {
        var self = this;

        self.loginState = parameters[0];
        self.users = parameters[1];
        self.flyout = parameters[2];
        self.system = parameters[3];
        self.settings = parameters[4];

        self.userSettingsDialog = undefined;

        var auto_locale = {language: "_default", display: gettext("Site default"), english: undefined};
        self.locales = ko.observableArray([auto_locale].concat(_.sortBy(_.values(AVAILABLE_LOCALES), function(n) {
            return n.display;
        })));
        self.locale_languages = _.keys(AVAILABLE_LOCALES);

        self.access_password = ko.observable(undefined);
        self.access_repeatedPassword = ko.observable(undefined);
        self.access_apikey = ko.observable(undefined);
        self.interface_language = ko.observable(undefined);

        self.currentUser = ko.observable(undefined);
        self.currentUser.subscribe(function(newUser) {
            self.access_password(undefined);
            self.access_repeatedPassword(undefined);
            self.access_apikey(undefined);
            self.interface_language("_default");

            if (newUser != undefined) {
                self.access_apikey(newUser.apikey);
                if (newUser.settings.hasOwnProperty("interface") && newUser.settings.interface.hasOwnProperty("language")) {
                    self.interface_language(newUser.settings.interface.language);
                }
            }
        });

        self.textLogin = ko.computed(function () {
            if (self.loginState.loggedIn()) {
                return gettext("Logout");
            } else {
                return gettext("Login");
        }
        });


        self.passwordMismatch = ko.computed(function () {
            return self.access_password() != self.access_repeatedPassword();
        });

        self.show = function(user) {
            if (!CONFIG_ACCESS_CONTROL) return;

            if (user == undefined) {
                user = self.loginState.currentUser();
            }

            self.currentUser(user);
        };

        self.save = function () {
            if (!CONFIG_ACCESS_CONTROL) return;

            if (self.access_password() && !self.passwordMismatch()) {
                self.users.updatePassword(self.currentUser().name, self.access_password(), function(){});
            }

            var settings = {
                "interface": {
                    "language": self.interface_language()
                }
            };
            self.updateSettings(self.currentUser().name, settings)
                .done(function () {
                    // close dialog
                    self.currentUser(undefined);
                    self.loginState.reloadUser();
                });
        };

        self.updateSettings = function(username, settings) {
            return OctoPrint.users.saveSettings(username, settings);
        };

        self.saveEnabled = function () {
            return !self.passwordMismatch();
        };

        self.onStartup = function () {
            self.userSettingsDialog = $("#usersettings_dialog");
        };

        self.onAllBound = function(allViewModels) {
            self.userSettingsDialog.on('show', function () {
                callViewModels(allViewModels, "onUserSettingsShown");
            });
            self.userSettingsDialog.on('hidden', function () {
                callViewModels(allViewModels, "onUserSettingsHidden");
            });
        }


    }

    OCTOPRINT_VIEWMODELS.push([
        UserSettingsViewModel,
        ["loginStateViewModel", "usersViewModel", "flyoutViewModel", "systemViewModel", "settingsViewModel" ],
        ["#login_flyout"]
    ]);
});
