#! /bin/bash
player_status=$(playerctl status -p spotify 2> /dev/null)
if [ "$player_status" == "Playing" ]; then
	echo "$(playerctl metadata -p spotify artist) - $(playerctl metadata -p spotify title)"
elif [ "$player_status" == "Paused" ]; then
	echo "$(playerctl metadata -p spotify artist) - $(playerctl metadata -p spotify title)"
fi
