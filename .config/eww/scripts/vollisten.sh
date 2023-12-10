#! /bin/bash

appvol() {
    inputs=$(
        pactl list sink-inputs | \
        grep -e 'Sink Input #' -e 'application.name = ' -e 'Volume: ' | \
        perl -pe 's/Sink Input #(\d*)/{"id": $1,/g' | \
        perl -pe 's/\t?(Volume: )?(front-\w+): \d{0,5} \/ +(\d{1,3})% \/ -?\d*,?\d{2} dB,?/"$2": $3,/g' | \
        perl -pe 's/\t{0,2}application\.name = "(.*)"/"name": "$1"}/g'
    )

    echo $inputs | jq -s | jq -Mca
}

appvol
while read -r line
do 
    appvol
done < <(pactl subscribe sink-inputs | stdbuf -o0 grep change)
