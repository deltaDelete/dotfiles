#! /bin/bash
wpctl get-volume @DEFAULT_SINK@ | sed 's/Volume: //g' | sed 's/\.//g'
