#! /bin/bash

inputs=$(
    pactl list sink-inputs | \
    grep -e 'Sink Input #' -e 'application.name = ' -e 'Volume: ' | \
    perl -pe 's/Sink Input #(\d*)/{"id": $1,/g' | \
    perl -pe 's/\t?(Volume: )?(front-\w+): \d{0,5} \/ +(\d{1,3})% \/ -?\d*,?\d{2} dB,?/"$2": $3,/g' | \
    perl -pe 's/\t{0,2}application\.name = "(.*)"/"name": "$1"}/g'
)


echo $inputs | jq -s | jq -Mca


# | \
# jq -sR 'split("\n") | {id: (.[0]), volume: (.[1]), name: (.[2])}'