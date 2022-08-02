# Nuts performance test

This repository contains a performance test setup for a Nuts network.
It starts multiple nuts nodes. 
For each node a prometheus datasource is used to display graphs in grafana.


## Networking

Monitoring is started separately from the performance tests.
This way the monitoring setup can always stay running in the background while new tests are started.
For this to work, create a shared network so prometheus has access to all relevant endpoints for scraping.


Create the network `performance-monitor` using
```shell
# Create network so the monitor and tests can live in the same space
docker network create performance-monitor
```

For the current network setups, this docker network is set as default in `docker-compose.yml`
```yaml
networks:
  default:
    name: performance-monitor
    external: true
```

## Performance monitor

### Start monitoring
```shell
# Start prometheus and grafana combo for monitoring
docker compose -f ./monitor/docker-compose.yml up -d
```

### Prometheus

The Nuts node exposes metric in the [prometheus format](https://nuts-node.readthedocs.io/en/latest/pages/deployment/monitoring.html#exported-metrics).
The config for prometheus is in `./prometheus`.
For each node a **scrape config** needs to be added to `prometheus.yml`:

```yaml
  - job_name: nodes
    metrics_path: '/metrics'
    scrape_interval: 5s
    static_configs:
      - targets: [ 'nodes:1323']
```

Replace `node1` with the correct image name from the docker compose file.

The prometheus user interface is exposed on `localhost:9090`.

### Grafana

The easiest way to change the grafana dashboard is to disable the anonymous user through the docker compose file.
Remove all grafana environment variables. 
You can then login on `localhost:3000` with `admin:admin` and change the dashboard.
To export the dashboard to the JSON file in `./grafana/dashboards/overview.json` click on dashboard settings (cog top-left) and choose **JSON Model** from the menu.
Copy-paste the contents to the file.

check https://grafana.com/tutorials/provision-dashboards-and-data-sources/ for more information.

#### Available dashboards
- Nuts [`localhost:3000/d/nuts/`](http://localhost:3000/d/nuts/). 
This contains an overview of many metrics grouped by Nuts, Network, CPU, Disk, and Memory.
Requires the [nuts-node:dev](#dev-image) image for some metrics.

- Redis [`localhost:3000/d/redis/`](http://localhost:3000/d/redis/).
Public grafana [dashboard #763](https://grafana.com/grafana/dashboards/763) that uses [redis-exporter](https://github.com/oliver006/redis_exporter) to scrape metrics from multiple redis instances. 
Instances to scrape are configured in `prometheus.yml`. 
A sub-selection in the available instances can be made in the top left of the dashboard.

## Nuts network configurations
The network setup are configured in the `network/<network-name>/docker-compose.yml` files to keep all relevant settings in a single file.

### dev image

These tests require the `nutsfoundation/nuts-node:dev` build that contains [node-exporter](https://github.com/prometheus/node_exporter) to expose some more metrics.
To build this image see https://github.com/nuts-foundation/nuts-node/tree/master/development/performance_analyzer

### baseline

This network consist of 2 nodes running the default settings.

### redis

This network consists of 2 nuts-nodes with each their own redis instance.

## Tests

### Artillery

[Artillery](https://artillery.io) is used to perform the load test.
The scripts are available in `./artillery`.
Visit https://www.artillery.io/docs/guides/getting-started/writing-your-first-test for a quick tutorial.
The docker compose files of the different networks start the test.
