#! /usr/bin/env bash

pkexec efibootmgr -n 0003 && /home/delta/.config/hypr/gracefully_close.sh
sync
sleep 1
