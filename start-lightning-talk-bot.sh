#!/bin/bash

# "exec" is a bash builtin that tells it to launch the
# specified command, replacing the bash interpreter.
# This allows the process that called this script
# (runit, in this case) to directly control the called
# executable (Python, in this case) through the
# original process ID. Without exec, expect problems
# with restarts not working or behaving weird.
killall node || true
exec npm run start

# if you want to start the service using another user,
# use http://smarden.org/runit1/chpst.8.html
# like this:
# exec chpst -u www-data -U www-data COMMAND
