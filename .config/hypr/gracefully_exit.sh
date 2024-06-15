#! /usr/bin/env bash

pkill --oldest --signal TERM -f msedge
hyprctl dispatch exit
