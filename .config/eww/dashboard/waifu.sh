#! /bin/bash
waifu=$(curl -s -o- https://api.waifu.pics/sfw/waifu | jq -r '.url')
wget $waifu -O waifu_temp
