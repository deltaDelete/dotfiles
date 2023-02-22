#! /bin/bash
player_status=$(playerctl status -p spotify 2> /dev/null)
if [ "$player_status" == "Paused" ]; then
	echo ""
elif [ "$player_status" == "Playing" ]; then
	echo ""
fi
