# Nuts performance test

This repository contains a performance test setup for a Nuts network.
It starts multiple nuts nodes. 
For each node a prometheus datasource is used to display graphs in grafana.

```shell
docker compose up
```

then navigate to `localhost:3000/d/nuts/nodes` 

## dev image

These tests require the `nutsfoundation/nuts-node:dev` build that contains `node-exporter` to expose some more metrics.
To build this image see https://github.com/nuts-foundation/nuts-node/tree/master/development/performance_analyzer

## Artillery

[Artillery](https://artillery.io) is used to perform the load test.
The scripts are available in `./artillery`.
Visit https://www.artillery.io/docs/guides/getting-started/writing-your-first-test for a quick tutorial.
The docker compose file currently only starts a single test.

## Prometheus

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

## Grafana

The easiest way to change the grafana dashboard is to disable the anonymous user through the docker compose file.
Remove all grafana environment variables. 
You can then login on `localhost:3000` with `admin:admin` and change the dashboard.
To export the dashboard to the JSON file in `./grafana/dashboards/overview.json` click on dashboard settings (cog top-left) and choose **JSON Model** from the menu.
Copy-paste the contents to the file.

check https://grafana.com/tutorials/provision-dashboards-and-data-sources/ for more information.