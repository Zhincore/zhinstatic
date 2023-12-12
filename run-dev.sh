#!/bin/sh 

# Run vite dev for a few seconds
# for some reason this fixes vite build on bun
# otherise it stops at "Rendering chunks" and doesn't build anything

bun run vite --port 8080 & (  # start dev server
  VITE_PID=$!  # save it's PID
  curl --retry 60 --retry-max-time 60 --retry-all-errors -o /dev/null http://localhost:8080/ #  ping the dev server to make it do something
  sleep 2  # wait another two seconds
  kill $VITE_PID  # end dev server
)
