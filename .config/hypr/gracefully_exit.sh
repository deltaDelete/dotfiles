#! /usr/bin/env bash

CONFIRM=$(
    zenity --question --text='Вы действительно ходите завершить сессию?' --default-cancel
    $?
)
sleep 1
if [[ $CONFIRM -eq 0 ]]; then
    notify-send "Exiting session"
    pkill --oldest --signal TERM -f msedge
    hyprctl dispatch exit
fi
