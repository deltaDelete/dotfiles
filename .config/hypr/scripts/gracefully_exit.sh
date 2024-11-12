#! /usr/bin/env bash

CONFIRM=$(
    zenity --question --text='Вы действительно ходите завершить сессию?' --default-cancel
    $?
)
if [[ $CONFIRM -eq 0 ]]; then
    notify-send "Завершение сессии"
    ./gracefully_close.sh
    hyprctl dispatch exit
fi
