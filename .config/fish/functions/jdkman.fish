function jdkman --argument-names cmd --description "A jdk manager for .jdks"
    set --local jdkman_version '0.1.0'
    switch "$cmd"
        case -v --version
            echo $jdkman_version
        case "" -h --help
            echo "No help :("
        case l list
            for i in $HOME/.jdks/*
                if test -d $i && not test -L $i
                    echo (basename $i)
                end
            end
        case current
            set --local current_jdk (readlink $HOME/.jdks/current)
            echo "Current JDK is $current_jdk"
        case -i --init
            echo "set --global --export --prepend PATH \$HOME/.jdks/current/bin"
            echo "set --global --export JAVA_HOME \$HOME/.jdks/current"
        case set
            if test -z "$argv[1]"
                echo "Please specify jdk name as in `jdkman list`"
                return 1
            end
            if test -d "$HOME/.jdks/$argv[1]" && not test -L "$HOME/.jdks/$argv[1]"
                rm '$HOME/.jdks/current'
                ln -s "$HOME/.jdks/$argv[1]" "$HOME/.jdks/current"
            end
    end
end

function jdkman_new --argument-names cmd --description "A jdk manager for .jdks"
    argparse h/help -- $argv
    or return

    if test -n "$_flag_help" -o -z "$cmd"
        printf "Usage: jdkman <command> [options]\n\n"
        printf "Commands:\n"
        printf "\tl/list        List installed jdks\n"
        printf "\tcurrent       Show current jdk name\n"
        printf "\tset <name>    Set <name> as current jdk\n"
        printf "Flags:\n"
        printf "\t-h/--help     Show this help\n"
        return 0
    end
end
