## Change log 

Change log for OctoPrint-LUI. 

## 1.0.5

### This update requires two _consecutive_ updates due to switching of branches. Update version number will stay 1.0.5. after second update.

- Switched main update branch from `devel` to `master`. ***Requires 2 consecutive updates**
- Added changelog information screen after update. Can be accessed through the Settings -> Update -> Changelog button. 
- Added auto shutdown function. Will shutdown the machine after print is finished. Option will reset after a shutdown. Go to Settings -> Printer to turn it on/off.
- Auto-shut down adds a "!" behind the power icon in the UI. It also adds a warning to the shutdown option.
- Enhanced the selection of materials during filament swap. Bigger area to tap on.
- Added warning when printer is in Error state on start up. 
- Printer can be shut down when in Error state on start up.
- Added error explanation if error is MINTEMP during startup: Either extruder disconnected or very cold environment. 
- Fixed: Can't swap filament after a print is finished.
- Fixed: Bug in OctoPrint-NetworkManager where SSIDs with ":" would crash the SSID parser. Bumped version of NetworkManager to 1.0.1
- Fixed: G92 X0 Y0 Z0 were not stripped correctly. G92 X0 Y0 Z0, which will zero a specific axis, will bug the printer when in sync/mirror mode and are therefore removed from gcode when sending. 

## 1.0.4

- Fixed: Bug introduced in 1.0.3 that would not allow remote uploads. 

## 1.0.3 

- Added notifications on disk space low and diskspace critically low.
- After print done/cancel/error print, move the bed down 20mm. 
- After z-offset (Xcel / Xeed) is completed, move the bed down 20mm.
- Fixed: Webcam stream not working in certain situations. 
- Fixed: Bug not being to start a print in certain situations introduced in 1.0.2. (typo)
- Fixed: Can't login remotely on Safari browser(css rule fix)
- Fixed: Actual and Target temperature could take two lines when certain temperatures were shown


## 1.0.2

- Changed 'Check Dimension' option that failed on the new wiping sequence coordinates. The dimension check is less strict now and depends more on the user input knowledge
- Selecting sync/mirror mode will show a warning that the model has to be sliced on the left side with one nozzle


## 1.0.1

- Better Xcel support
- Better filament detection handling for Xeed and Xcel, including only filament detection during printing.
- Better out of bounds grid and info. (Check dimensions)
- Fixed blocking flyout bug introduced in 1.0.0
- Fixed out of bounds check bug
- Added full gcode name to additional information
- Additional information of job can always be shown now, if analysis is not done yet this will be shown with a spinner.
- No more auto *.HEX detection, only in debug mode
- Typo's
- Title change: Timelapse -> Webcam in settings menu 
- Added this changelog ^^


## 1.0.0 

- All modules to 1.0.0 
- Added global version number to settings screen
- gcodeRender to master branch
- Added better multiple flyout support
- Tweaked bed level calibration
- on{$SettingsTopic}SettingsShown callback added to minimize calls to back-end 
- Refactored updating mechanism completely
- Warning if no internet connection is available or if update server(github) is not available
- Debug moved to config.yaml setting(debug_lui: true/false)
- Minimizing back-end calls 


## Known bugs

- Still got an issue with first boot and not being able to home. 'Retry printer connection' needed
- Printer locks down if nozzle is swapped when printer is on. Needs a wizard / work.

