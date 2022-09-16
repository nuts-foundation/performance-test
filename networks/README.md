
# Creating a test setup
To create a new test, copy the following config in to a new compose file at `./<test-name>/docker-compose.yml`.

```yaml
##### DOCKER NETWORK ASSIGNMENT #####
# make sure prometheus is on the same network to scrape the metrics (run /monitor/docker-compose.yml)
networks:
  default:
    name: performance-monitor
    external: true
    
# Docker compose up/down acts on compose groups. 
# Setting the same group name in all configs makes starting a new test a bit easier when there is another test active.
name: performance-test-network 
services:
  ##### TEST CONFIGURATION #####
  # Set test script to run in command
  artillery:
    image: artilleryio/artillery:latest
    depends_on:
      nodeA:
        condition: service_healthy  # nodeA's healthcheck.interval determines how long this takes.
    volumes: ["../../artillery:/scripts:ro"]
    command: run /scripts/private-vcs.yaml  # <-- set test here
  # This container exposes the docker rest api (https://docs.docker.com/engine/api/) on http://docker.api to other containers.
  socat:
    image: bobrik/socat
    hostname: docker.api # give it an interpretable hostname
    volumes: ["/var/run/docker.sock:/var/run/docker.sock:ro"]
    command: TCP-LISTEN:80,fork UNIX-CONNECT:/var/run/docker.sock

  ##### TEST NETWORK SETUP #####
  # must contain at least a nodeA and nodeB
  nodeA:
    container_name: nodeA  # needed to manage container through docker APIs
    image: &image nutsfoundation/nuts-node:dev
    volumes: ["../nuts.yaml:/nuts.yaml:ro"]
#    environment:
#      ... add nuts.yaml overrides here
    healthcheck:
      interval: 5s
  nodeB:
    container_name: nodeB
    image: *image
    volumes: ["../nuts.yaml:/nuts.yaml:ro"]
#    environment:
#      ... add nuts.yaml overrides here
```

The compose file consists of 3 parts:
- **DOCKER NETWORK ASSIGNMENT:**  this adds the services to the `performance-monitor` network so the containers can be scraped by prometheus.
- **TEST CONFIGURATION:** this section runs the artillery test and exposes the docker APIs (on http://docker.api) to the network. This section should probably not be changed. (Besides the test to run.)
- **TEST NETWORK SETUP:** this section in contains the network setup to test. It includes all nodes and additional containers needed for the test.
Overrides for the nuts.yaml config, or additions to the configuration should be added as env variables. (Or mount a different nuts.yaml)  

The `<service>.container_name` field allows setting a fixed container name which is required to manage a container using the `docker.api` service.
I.e., when the `container_name` is not set, the container for a service named `nodeA` will be renamed by compose to something like `performance-test-network-nodeA-1`.
However, when the config contains `nodeA.container_name: nodeB`, the container will be named `nodeB` and can be manged through the API using this name (e.g., http://docker.api/containers/nodeB/json). 
