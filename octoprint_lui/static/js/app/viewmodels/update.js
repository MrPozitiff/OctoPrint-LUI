$(function () {
    function UpdateViewModel(parameters) {
        var self = this;

        self.loginState = parameters[0];
        self.system = parameters[1];
        self.flyout = parameters[2];
        self.files = parameters[3];
        self.settings = parameters[4];
        self.flashArduino = parameters[5];
        self.printerState = parameters[6];

        self.updateinfo = ko.observableArray([]);
        self.updating = ko.observable(false);
        self.update_needed = ko.observable(false);
        self.updateCounter = 0;
        self.updateTarget = 0;

        self.fileNameToFlash = ko.observable(undefined); // Can either be a local (USB) file name or a filename to be uploaded

        self.modelName = ko.observable(undefined);
        self.firmwareVersion = ko.observable(undefined);

        self.flashingAllowed = ko.computed(function () {
            return self.printerState.isOperational() && self.printerState.isReady() && !self.printerState.isPrinting() && self.loginState.isUser();
        });

        self.getUpdateText = function (data) {
            if (data.update()) {
                return "Update"
            } else {
                return "Up-to-date"
            }
        };

        self.getUpdateIcon = function (data) {
            if (data.update()) {
                return "fa-refresh"
            } else {
                return "fa-check"
            }
        };

        self.getUpdateAllText = ko.pureComputed(function() {
            if (self.update_needed() > 0) {
                return "Update"
            } else {
                return "Up-to-date"
            }
        });

        self.getUpdateAllIcon = ko.pureComputed(function() {
            if (self.update_needed() > 0) {
                return "fa-refresh"
            } else {
                return "fa-check"
            }
        });

        self.getUpdateButtonClass = function (data) {
            if (data.update()) {
                return ""
            } else {
                return "ok-button disabled"
            }
        };

        self.getUpdateAllButtonClass = ko.pureComputed(function () {
            if (self.update_needed() > 0) {
                return ""
            } else {
                return "ok-button disabled"
            }
        });

        self.browseForFirmware = function () {

            self.files.browseUsbForFirmware();

            self.flyout.closeFlyoutAccept();

            self.flyout.showFlyout('firmware_file')
                .done(function () {
                    file = self.files.selectedFirmwareFile();
                    self.flashArduino.onLocalFileSelected(file);
                    self.settings.showSettingsTopic('update');
                })
                .fail(function () { })
                .always(function () {
                    self.files.browseLocal(); // Reset file list to local gcodes
                });
        };

        self.sendUpdateCommand = function (data) {

            var text = "You are about to update a component of the User Interface.";
            var question = "Do want to update " + data.name() + "?";
            var title = "Update: " + data.name()
            var dialog = { 'title': title, 'text': text, 'question': question };

            var command = { 'actionSource': 'custom', 'action': data.action(), 'name': data.name(), confirm: dialog };
            self.system.triggerCommand(command)
                .done(function () {
                    self.system.systemReboot();
                });
        };

        self._updateNext = function ()
        {
            //TODO: Provide progress feedback to user
            console.log('Updating' + (self.updateCounter + 1) + '/' + self.updateTarget);
                
            var items = self.updateinfo();
            var data = items[self.updateCounter];

            if (!data.update) {
                self.updateCounter++;

                if (self.updateCounter == self.updateTarget)
                    self.system.systemReboot();
                else
                    self._updateNext();
            }

            var command = { 'actionSource': 'custom', 'action': data.action(), 'name': data.name()};
            self.system.triggerCommand(command)
                .done(function () {
                    self.updateCounter++;

                    if (self.updateCounter == self.updateTarget)
                        self.system.systemReboot();// TODO: Show spinner that system is rebooting
                    else
                        self._updateNext();
                }).fail(function()
                {
                    $.notify({title: 'Software update failed', text: 'An error has occured while trying to update the software. Please try again.'}, "error");
                });
        }

        self.updateAll = function (data) {

            self.updateCounter = 0;
            self.updateTarget = self.updateinfo().length;

            if (self.updateTarget > 0) {
                var text = "You are about to update the printer software.";
                var question = "Do want to continue?";
                var title = "Update software";

                self.flyout.showConfirmationFlyout({ 'title': title, 'text': text, 'question': question }).done(function () {
                    self._updateNext();
                })
            }

            
                
        };

        self.fromResponse = function (data) {
            var info = ko.mapping.fromJS(data.update);
            var updates = 0;
            _.each(info(), function (i) {
                if (i.update()) updates++
            });
            self.update_needed(updates);
            self.updateinfo(info());

            self.modelName(data.machine_info.machine_type);
            self.firmwareVersion(data.machine_info.firmware_version);
        };

        self.requestData = function () {
            OctoPrint.simpleApiGet('lui', {
                success: self.fromResponse
            });
        };

        self.onFirmwareUpdateFound = function (file) {
            var title = "Firmware update found"
            var text = _.sprintf(gettext('The USB drive you inserted contains a firmware update with filename "%(filename)s".'), { filename: file["name"] });
            var question = "Would you like to install this update?";

            var dialog = { 'title': title, 'text': text, 'question': question };

            self.flyout.showConfirmationFlyout(dialog)
                .done(function () {
                    self.settings.showSettingsTopic('update');
                    self.flashArduino.onLocalFileSelected(file);
                });
        };

        self.refreshUpdateInfo = function () {
            self.updating(true);
            $('#update_spinner').addClass('fa-spin');
            var data = {
                command: "refresh_update_info"
            };
            var url = OctoPrint.getSimpleApiUrl('lui');
            OctoPrint.postJson(url, data);
            //TODO: Get rid of the timeout?
            setTimeout(function () {
                self.requestData();
                self.updating(false);
                $('#update_spinner').removeClass('fa-spin');
            }, 10000);
        }

        self.onHexPathChanged = function(hex_path)
        {
            self.fileNameToFlash(hex_path);
        }

        self.onSettingsShown = function () {
            self.requestData();
        };

        self.onSettingsHidden = function () {
            self.flashArduino.resetFile();
        }

        self.onBeforeBinding = function () {
            self.requestData();
        };

        self.onAfterBinding = function() 
        {
            self.flashArduino.hex_path.subscribe(self.onHexPathChanged);

            // Communicate to the plugin wheter he's allowed to flash
            self.flashingAllowed.subscribe(function (allowed) { self.flashArduino.flashingAllowed(allowed); });

            
        }

        self.onDataUpdaterPluginMessage = function (plugin, data) {
            if (plugin != "lui") {
                return;
            }

            var messageType = data['type'];
            var messageData = data['data'];
            switch (messageType) {
                case "firmware_update_found":
                    self.onFirmwareUpdateFound(messageData.file);
                    break;
            }
        }
    }

    OCTOPRINT_VIEWMODELS.push([
      UpdateViewModel,
      ["loginStateViewModel", "systemViewModel", "flyoutViewModel", "gcodeFilesViewModel", "settingsViewModel", "flashArduinoViewModel", "printerStateViewModel"],
      ['#update', '#update_icon']
    ]);

});
