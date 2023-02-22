#! /bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
lang=$(locale | grep LANG | sed "s/LANG=//" | sed "s/.UTF-8//")
readarray -t variants < powermenu.$lang.txt

declare -A options=(
    ["${variants[0]}"]="poweroff"
    ["${variants[1]}"]="reboot"
    ["${variants[2]}"]="exit"
    ["${variants[3]}"]="lock"
    ["${variants[4]}"]="reboot --boot-loader-entry=auto-windows"
)

#  | sed "s/ /\n/g" 
selected=$( cat powermenu.$lang.txt | wofi --style style.powermenu.css --width 64 --xoffset -158 -l 4 -i --dmenu -r )

echo $selected
selectedCmd="${options[$selected]}"

if [[ $selectedCmd == "exit" ]]; then
    hyprctl keyword exit
elif [[ $selectedCmd == "lock" ]]; then
    swaylock -c 000000 -i archlogo.svg -s center
elif [[ $selectedCmd == "" ]]; then
    echo $selectedCmd is unknown
else
    systemctl $selectedCmd
fi
