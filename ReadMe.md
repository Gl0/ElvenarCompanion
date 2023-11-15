Elvenar Companion
==============

Elvenar Companion is a small Chrome extension which only function for now is to help archmages to track Spire stats for their fellowships while playing [Elvenar](https://elvenar.com).

* Installation

1. Unpack archive to some folder.
2. Open chrome://extensions/
3. Enable developer mode
4. Use "Load unpacked" button to find and load Elvenar Companion from folder (1).

* Limitations

To be able to receive websocket messages from the game, extension attaches debugger to game tab when you enter the game.

For secuity reasons chrome will show notification "Elvanar Companion started debugging this browser".

If you close/cancel it - extension won't be able to track game connection.

The only way to remove it is to run chrome with `--silent-debugger-extension-api` command line switch.

There is no way to know how many archive points were spent => Companion calculates it as `Overall_FS_score - Sum(individual_scores)`. If someone leaves FS during Spire, their contribution also goes to "Archive" dummy user.

* Usage

After loading and enabling extension, it will start to gather info in background.

To get player names it has to catch the beginning of connection to chat server at least once per fellowship.

Spire stats are updated in realtime either on entering the Spire or when someone in your FS progress through the Spire.

Extension adds a button on toolbar, which opens spire stats report tab.

Report tab will show information for all fellowships Companion has seen even if Spire is already closed and you are offline.

Each report is labeled as *serverName_fellowshipId* (same id's as on Elvenstats).

If it stays opened - it will be refreshed in realtime with information about FS Spire progress in currently active game tab.

