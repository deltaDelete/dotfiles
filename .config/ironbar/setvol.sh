#! /bin/sh

#value= echo $1 | awk '{print int($1+0.5)/100}'
#echo $1 >> setvol.log
#echo $value >> setvol.log
wpctl set-volume @DEFAULT_SINK@ ${1%,*}%
return 0