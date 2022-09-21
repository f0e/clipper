# clipper

## about

Clipper is a POV demo recording and management tool for Counter-Strike: Global Offensive.

It has multiple modes:

- Archiver: Automatically record every match you play and name the files with the date and map name.
- Clipper: Record specific rounds in a game using a shadowplay-like clipping system. When you clip you enter a name, and then at the end of the round that round's demo is saved with the given name as the filename.

You can also view and manage all of your demos through a web interface, which makes organising them easier than working directly with the demo files.

## why?

Recording POV demos is a hassle. You have to remember to record them every match you play, and even then you can only start recording during warmups and freezetimes.

This application removes the need to manually start recording, saving you time and effort, but also ensuring that every match is always recorded.

Also, the clipper mode removes the need to record whole games entirely, as you can just clip certain rounds. This saves disk space, and also makes reviewing demos much easier as you don't have to go through entire demos just to get to the highlights.

# installation

## 1. CS:GO setup

1. Enable clipper's Game State Integration
   - Copy `gamestate_integration_clipper.cfg` to your CS:GO config folder. (e.g. C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive/csgo/cfg)
2. Enable the remote console
   - Add the launch option `-netconport 2121`

## 2. application setup

Choose one of the following options.

## docker

If you've already got Docker installed you can add Clipper as a container. This will handle the installation for you and will automatically run at system startup by default.

You can run the following command to pull the latest version and run it as a container. Replace the CS:GO path if necessary.

```
docker run -d --name=clipper -p 4747:4747 --restart unless-stopped --volume "C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive:/csgo-folder" ghcr.io/f0e/clipper:latest
```

There's also a `docker-compose.yml` file for easier container management. You can use that if you prefer.

1. Clone the repo
2. Check the `docker-compose.yml` file to see if the CS:GO path is correct. If it isn't, replace it with the path to your CS:GO directory.
3. Run `docker-compose up -d` inside the directory

## **or** manual

1. Download the latest [`app.zip` release](https://github.com/f0e/clipper/releases/latest)
2. Extract the zip file
3. Open `run.bat`, or run `node clipper/app/index`

# usage

Type `clipper` in the CS:GO console to view the list of commands.

## faq

Can I get banned for using this?

- **No.** The only interactions this application has with CS:GO are through utilising features of the game, making it 100% safe.

## how does it work?

The application utilises [Game State Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration), which is Valve's way of allowing applications access to information about the game. This was added for use in things like tournaments, and for this application it allows us to get the current map and round information.

Also, the [`-netconport`](https://developer.valvesoftware.com/wiki/Command_Line_Options) launch option is used, which allows for applications to connect to the game's console and read and send console commands. This is how the application records demos.
