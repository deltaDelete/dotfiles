#! /bin/bash

window_id="$1"
window_class="$2"
window_instance="$3"
window_type="$(xprop -id "$window_id" _NET_WM_WINDOW_TYPE | sed '/^_NET_WM_WINDOW_TYPE/!d ; s/^.* = \(.*\),.*/\1/')"
window_title="$( xprop -id "$window_id" WM_NAME | sed "s/WM_NAME(UTF8_STRING) = //" | sed "s/\"//g" )"
logfile="/home/delta/.config/bspwm/exrules.log"
time="$(date +"%d/%m/%Y %H:%M")"

function log() {
	echo "$time:" >> $logfile
	echo "	window_id: $window_id" >> $logfile
	echo "	window_class: $window_class" >> $logfile
	echo "	window_instance: $window_instance" >> $logfile
	echo "	window_type: $window_type" >> $logfile
	echo "	window_title: $window_title" >> $logfile
}
function checkTitle {
	if [[ $window_title == "Список друзей" || $window_title == "Свойства"* || $window_title == "Настройки"* ]]; then
		return true
	else
		return false
	fi
}

if [[ ( "${window_class,,}" == "steam" && "$window_type" == *"_NET_WM_WINDOW_TYPE_DIALOG"* ) || ( "${window_class,,}" == "steam" && checkTitle ) ]]; then
	echo "state=floating"
	echo "center=on"
	log
elif [[ "${window_class,,}" == "spotify" ]]; then
	# echo "state=tiled"
	echo "desktop=\"^5\""
	log
fi


